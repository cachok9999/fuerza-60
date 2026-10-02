const url=process.env.VITE_SUPABASE_URL||'',key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY||'';
let publicKey=key.startsWith('sb_publishable_');try{publicKey ||= JSON.parse(Buffer.from(key.split('.')[1]||'','base64url')).role==='anon'}catch{}
if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!publicKey||key.startsWith('sb_secret_')||key.includes('REEMPLAZAR')){console.error('Configurá VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en Settings > Secrets and variables > Actions > Variables. Nunca uses una clave secreta o service_role.');process.exit(1)}
console.log('Configuración publicable válida; las políticas RLS protegen los datos.');
