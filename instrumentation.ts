export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { tracer } = await import('dd-trace');
    tracer.init({
      service: 'centro-medico-pichardo',
      env: 'local',
      version: '1.0.0',
      appsec: true, // ESTO DEBE ESTAR EN TRUE
      logInjection: true
    });
    console.log("🛡️ RASP: Sistema de protección inyectado en CMP");
  }
}