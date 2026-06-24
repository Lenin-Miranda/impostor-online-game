-- ============================================================
-- Grant DML privileges to service_role (the backend's role)
--
-- Why: in this local setup the tables only received
-- REFERENCES/TRIGGER/TRUNCATE by default, NOT
-- SELECT/INSERT/UPDATE/DELETE. So the backend (which connects as
-- service_role) got "permission denied for table ...".
--
-- service_role is the only role the backend uses and it bypasses
-- RLS, so it is safe to give it full DML. anon/authenticated keep
-- NO DML on purpose: the FE never touches these tables directly.
-- ============================================================

grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- Same privileges for tables/sequences created in future migrations.
alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to service_role;
