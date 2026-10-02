-- Ejecutar una vez en un proyecto Supabase nuevo. No contiene datos personales.
begin;
create table public.fuerza_records (
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 key text not null check(length(key) between 1 and 250),
 payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=32768),
 revision integer not null default 1 check(revision>0),
 updated_at timestamptz not null default now(),
 primary key(owner_id,key),
 constraint fuerza_valid_type check (payload->>'type' is not null and payload->>'type' in ('profile','log','workout','review','photo')),
 constraint fuerza_matching_key check (coalesce(key = case payload->>'type'
  when 'profile' then 'profile'
  when 'workout' then 'workout:'||(payload->>'date')||':'||(payload->>'session')||':'||(payload->>'exercise')
  else (payload->>'type')||':'||(payload->>'date') end,false)),
 constraint fuerza_photo_owner check (payload->>'type'<>'photo' or (payload->>'path' is not null and split_part(payload->>'path','/',1)=owner_id::text))
);
alter table public.fuerza_records enable row level security;
revoke all on public.fuerza_records from anon, authenticated;
grant select,insert,update on public.fuerza_records to authenticated;
create policy fuerza_read_own on public.fuerza_records for select to authenticated using ((select auth.uid())=owner_id);
create policy fuerza_insert_own on public.fuerza_records for insert to authenticated with check ((select auth.uid())=owner_id);
create policy fuerza_update_own on public.fuerza_records for update to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create function public.fuerza_bump_revision() returns trigger language plpgsql set search_path='' as $$
begin
 if new.owner_id is distinct from old.owner_id or new.key is distinct from old.key then
  raise exception 'La identidad del registro no puede cambiar';
 end if;
 new.revision:=old.revision+1;
 new.updated_at:=now();
 return new;
end;
$$;
create trigger fuerza_revision before update on public.fuerza_records for each row execute function public.fuerza_bump_revision();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('fuerza-photos','fuerza-photos',false,5242880,array['image/jpeg','image/png','image/webp']);
create policy fuerza_photos_read on storage.objects for select to authenticated
 using(bucket_id='fuerza-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy fuerza_photos_insert on storage.objects for insert to authenticated
 with check(bucket_id='fuerza-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy fuerza_photos_delete on storage.objects for delete to authenticated
 using(bucket_id='fuerza-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
commit;

