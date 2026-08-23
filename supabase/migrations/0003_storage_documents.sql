-- ============================================================
-- CasaOS — Migração 0003
-- Bucket privado para documentos anexados aos bens (notas
-- fiscais, manuais, fotos) + políticas de RLS no Storage.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- O Supabase já habilita RLS por padrão em storage.objects — essa
-- tabela pertence a um papel interno do sistema, então o SQL Editor
-- (rodando como "postgres") não tem permissão para alterá-la, e não
-- precisa: só falta criar as políticas abaixo.

-- Cada usuário só acessa arquivos dentro da própria pasta:
-- o primeiro segmento do caminho precisa ser o próprio user_id.
-- Convenção de caminho usada pelo frontend: {user_id}/{item_id}/{uuid}-{nome}.
create policy "documents_select_own" on storage.objects
  for select using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "documents_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "documents_delete_own" on storage.objects
  for delete using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
