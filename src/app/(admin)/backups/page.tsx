// src/app/(admin)/backups/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { BackupsHeader } from '@/components/admin/backups/BackupsHeader';
import { BackupStats } from '@/components/admin/backups/BackupStats';
import { BackupTable } from '@/components/admin/backups/BackupTable';
import { BackupGenerator } from '@/components/admin/backups/BackupGenerator';
import type { Backup, BackupStats as BackupStatsType } from '@/types/backups';

export default function AdminBackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<BackupStatsType>({
    total: 0,
    completos: 0,
    parciales: 0,
    espacioTotal: '0 KB',
    ultimoBackup: null,
    promedioTamaño: '0 KB'
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backups');
      const data = await res.json();

      if (data.backups) {
        setBackups(data.backups);

        // Calcular estadísticas
        const completos = data.backups.filter((b: Backup) => b.tipo === 'completo').length;
        const parciales = data.backups.filter((b: Backup) => b.tipo === 'parcial').length;
        const totalSize = data.backups.reduce((acc: number, b: Backup) => {
          const size = Number.parseFloat(b.tamaño) || 0;
          return acc + size;
        }, 0);

        setStats({
          total: data.backups.length,
          completos,
          parciales,
          espacioTotal: `${totalSize.toFixed(2)} KB`,
          ultimoBackup: data.backups[0]?.fecha || null,
          promedioTamaño: data.backups.length > 0
            ? `${(totalSize / data.backups.length).toFixed(2)} KB`
            : '0 KB'
        });
      }
    } catch (error) {
      console.error('Error cargando backups:', error);
      setError('No se pudieron cargar los respaldos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleGenerateBackup = async (tipo: 'completo' | 'parcial') => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al generar backup');
      }

      // Descargar el archivo
      const blob = await res.blob();
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fecha = new Date().toISOString().replaceAll(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `backup-${tipo}-${fecha}.sql`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      globalThis.URL.revokeObjectURL(url);

      // Recargar lista
      await loadBackups();
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al generar el respaldo');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteBackup = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este respaldo? Esta acción no se puede deshacer.')) return;

    try {
      const res = await fetch(`/api/backups/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      await loadBackups();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el respaldo');
    }
  };

  const handleDownloadBackup = async (id: string) => {
    try {
      const res = await fetch(`/api/backups/${id}`);
      if (!res.ok) throw new Error('Error al descargar');

      const blob = await res.blob();
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${id}.sql`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      globalThis.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al descargar el respaldo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin" size={48} color="#0A3D62" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BackupsHeader />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      )}

      <BackupStats stats={stats} />

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <BackupTable
            backups={backups}
            onDownload={handleDownloadBackup}
            onDelete={handleDeleteBackup}
          />
        </div>
        <div>
          <BackupGenerator
            onGenerate={handleGenerateBackup}
            generating={generating}
          />
        </div>
      </div>
    </div>
  );
}