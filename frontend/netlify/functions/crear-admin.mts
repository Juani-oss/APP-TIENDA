import { createClient } from '@supabase/supabase-js';
import type { Context } from '@netlify/functions';

/**
 * Crea un usuario admin nuevo (Supabase Auth + fila en public.perfiles).
 * Corre en el servidor de Netlify — acá SÍ es seguro usar la clave
 * service_role (nunca en el navegador). Antes de crear nada, verifica que
 * quien llama ya sea un admin real, usando su propio token de sesión.
 */
export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: 'Falta configurar SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en Netlify.' }),
      { status: 500 }
    );
  }

  const authHeader = req.headers.get('authorization') ?? '';
  const callerToken = authHeader.replace(/^Bearer\s+/i, '');
  if (!callerToken) {
    return new Response(JSON.stringify({ error: 'No autenticado.' }), { status: 401 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1) ¿Quién llama? ¿Es un admin real?
  const { data: callerData, error: callerError } = await supabaseAdmin.auth.getUser(callerToken);
  if (callerError || !callerData.user) {
    return new Response(JSON.stringify({ error: 'Sesión inválida.' }), { status: 401 });
  }

  const { data: perfilLlamador, error: perfilError } = await supabaseAdmin
    .from('perfiles')
    .select('rol')
    .eq('id', callerData.user.id)
    .single();

  if (perfilError || perfilLlamador?.rol !== 'admin') {
    return new Response(JSON.stringify({ error: 'No tenés permisos de administrador.' }), {
      status: 403,
    });
  }

  // 2) Datos del nuevo admin.
  let body: { email?: string; password?: string; nombre?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Body inválido.' }), { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password ?? '';
  const nombre = body.nombre?.trim() || email;

  if (!email || password.length < 8) {
    return new Response(
      JSON.stringify({ error: 'Falta email o la contraseña tiene menos de 8 caracteres.' }),
      { status: 400 }
    );
  }

  // 3) Crear el usuario en Supabase Auth (con el email ya confirmado).
  const { data: nuevoUsuario, error: crearError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (crearError || !nuevoUsuario.user) {
    return new Response(
      JSON.stringify({ error: crearError?.message ?? 'No se pudo crear el usuario.' }),
      { status: 400 }
    );
  }

  // 4) Vincularlo como admin en perfiles.
  const { error: insertError } = await supabaseAdmin
    .from('perfiles')
    .insert({ id: nuevoUsuario.user.id, nombre, rol: 'admin' });

  if (insertError) {
    return new Response(
      JSON.stringify({
        error: `El usuario se creó, pero no se pudo asignar el rol de admin: ${insertError.message}`,
      }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify({ id: nuevoUsuario.user.id, email, nombre }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
