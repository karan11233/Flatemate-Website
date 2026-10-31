import { describe, it, expect } from 'vitest';
import { newDb, DataType } from 'pg-mem';
import fs from 'fs';
import path from 'path';

describe('SQL Migrations Execution & Schema Verification', () => {
  it('executes tables, enums, views, and seed data against an isolated PostgreSQL instance without errors', () => {
    const db = newDb({
      autoCreateForeignKeyIndices: true,
    });

    // Register auth and storage schemas as Supabase does
    db.public.none(`
      create schema if not exists auth;
      create table if not exists auth.users (
        id uuid primary key,
        email text,
        phone text,
        raw_user_meta_data jsonb
      );
      create schema if not exists storage;
    `);

    // Register mock functions for pg-mem
    db.public.registerFunction({
      name: 'uid',
      returns: DataType.uuid,
      implementation: () => null,
    });
    db.public.registerFunction({
      name: 'role',
      returns: DataType.text,
      implementation: () => 'anon',
    });
    db.public.registerFunction({
      name: 'char_length',
      args: [DataType.text],
      returns: DataType.integer,
      implementation: (str: string) => (str ? str.length : 0),
    });
    db.public.registerFunction({
      name: 'digest',
      args: [DataType.text, DataType.text],
      returns: DataType.text,
      implementation: (str: string) => str,
    });
    db.public.registerFunction({
      name: 'encode',
      args: [DataType.text, DataType.text],
      returns: DataType.text,
      implementation: (str: string) => str,
    });
    db.public.registerFunction({
      name: 'gen_random_uuid',
      returns: DataType.uuid,
      implementation: () => '11111111-2222-3333-4444-555555555555',
    });

    const migrationsDir = path.resolve(__dirname, '../supabase/migrations');

    const cleanForPgMem = (sql: string) => {
      return sql
        .replace(/create extension [^;]+;/gi, '')
        .replace(/create (or replace )?function[\s\S]*?\$\$ language plpgsql[^;]*;/gi, '')
        .replace(/drop trigger [^;]+;/gi, '')
        .replace(/create trigger [^;]+;/gi, '')
        .replace(/revoke [^;]+;/gi, '')
        .replace(/grant [^;]+;/gi, '')
        .replace(/alter table [^;]+ enable row level security;/gi, '')
        .replace(/create policy [^;]+;/gi, '')
        .replace(/drop policy [^;]+;/gi, '')
        .replace(/with \(security_invoker = false\)/gi, '')
        .replace(/generated always as [^)]+\)\) stored/gi, '')
        .replace(/~ '\^\[0-9\]\{10\}\$'/gi, "like '%'");
    };

    // 1. Initial schema (tables, enums, views)
    const rawInitialSchema = fs.readFileSync(path.join(migrationsDir, '00001_initial_schema.sql'), 'utf-8');
    const initialSchemaSql = cleanForPgMem(rawInitialSchema);
    expect(() => db.public.none(initialSchemaSql)).not.toThrow();

    // Verify all primary tables were created
    const tables = db.public.many(`
      select table_name from information_schema.tables 
      where table_schema = 'public'
    `).map((r: any) => r.table_name);

    expect(tables).toContain('profiles');
    expect(tables).toContain('spaces');
    expect(tables).toContain('space_claim_secrets');
    expect(tables).toContain('space_photos');
    expect(tables).toContain('inquiries');
    expect(tables).toContain('reports');
    expect(tables).toContain('rate_limits');

    // Verify views are queryable
    expect(() => db.public.one(`select count(*) as count from public.public_spaces`)).not.toThrow();
    expect(() => db.public.one(`select count(*) as count from public.public_profiles`)).not.toThrow();

    // 2. Storage setup
    const rawStorage = fs.readFileSync(path.join(migrationsDir, '00003_storage_setup.sql'), 'utf-8');
    const storageSql = cleanForPgMem(rawStorage);
    expect(() => db.public.none(storageSql)).not.toThrow();

    // 3. Seed Ahmedabad data
    const rawSeed = fs.readFileSync(path.join(migrationsDir, '00004_seed_ahmedabad.sql'), 'utf-8');
    const seedSql = rawSeed.replace(/do \$\$[\s\S]*?\$\$;/gi, '');
    expect(() => db.public.none(seedSql)).not.toThrow();

    // Verify seed data was inserted
    const spacesCount = db.public.one(`select count(*) as count from public.spaces`);
    expect(Number(spacesCount.count)).toBe(6);

    // Verify seed data is tagged as demo data
    const demoCount = db.public.one(`select count(*) as count from public.spaces where is_demo = true`);
    expect(Number(demoCount.count)).toBe(6);

    // Verify public_spaces view filters out is_demo = true listings
    const publicSpacesCount = db.public.one(`select count(*) as count from public.public_spaces`);
    expect(Number(publicSpacesCount.count)).toBe(0); // 0 demo listings in public view!

    // Insert an active non-demo listing to test public view masking
    db.public.none(`
      insert into public.spaces (
        id, title, description, location, city, rent, contact_name, contact_phone,
        consent_whatsapp_contact, status, is_demo
      ) values (
        '99999999-9999-9999-9999-999999999999',
        'Real Active Space',
        'Valid listing description with more than twenty characters.',
        'Satellite', 'Ahmedabad', 10000, 'Host Name', '9825111222',
        false, 'active', false
      );
    `);

    // Verify public view now returns the 1 space, but contact_phone is masked to NULL because consent_whatsapp_contact = false
    const activePublicSpace = db.public.one(`select * from public.public_spaces where id = '99999999-9999-9999-9999-999999999999'`);
    expect(activePublicSpace).toBeDefined();
    expect(activePublicSpace.contact_phone).toBeNull();
    expect(activePublicSpace.consent_whatsapp_contact).toBe(false);
  });
});
