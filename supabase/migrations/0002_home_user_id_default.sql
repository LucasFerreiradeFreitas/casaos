-- ============================================================
-- CasaOS — Migração 0002
-- O frontend deixa de precisar enviar user_id ao criar uma home:
-- o banco preenche sozinho a partir da sessão autenticada.
-- A RLS continua sendo a proteção real (isto é reforço, não troca).
-- ============================================================

alter table homes alter column user_id set default auth.uid();
