import {createClient} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL?.trim();
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
function publicKey(value:string|undefined){if(!value)return false;if(value.startsWith('sb_publishable_'))return true;try{return JSON.parse(atob(value.split('.')[1])).role==='anon'}catch{return false}}
export const configured=!!url&&/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)&&!url.includes('TU-PROYECTO')&&publicKey(key)&&!key?.includes('REEMPLAZAR');
export const supabase=configured?createClient(url!,key!,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'fuerza60-auth'}}):null;
export function client(){if(!supabase)throw Error('Falta conectar Supabase. Seguí la guía de configuración.');return supabase;}
export async function userId(){const {data,error}=await client().auth.getUser();if(error||!data.user)throw Error('Tu sesión venció. Volvé a iniciar sesión.');return data.user.id;}
export const redirectURL=()=>new URL(import.meta.env.BASE_URL,window.location.href).href.split('#')[0].split('?')[0];
