---
name: supabase-setup
description: "Use when: creating Supabase tables, configuring Row Level Security, writing database migrations, setting up Supabase Auth, or designing the database schema for any business type."
argument-hint: "Describe the database task (e.g., 'create tables for a psychology clinic', 'add RLS policies', 'set up auth for admin')"
---

# Skill: Configurar Supabase para una web

## Procedimiento

### 1. Crear proyecto Supabase
1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto (región EU para España)
3. Copiar URL y anon key

### 2. Esquema base (todas las webs)
Ejecutar en SQL Editor:

```sql
-- Citas / Reservas
CREATE TABLE IF NOT EXISTS citas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  servicio TEXT,
  fecha DATE,
  hora TIME,
  notas TEXT,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada'))
);

ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert citas" ON citas
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated can read citas" ON citas
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update citas" ON citas
  FOR UPDATE TO authenticated USING (true);

-- Mensajes de contacto
CREATE TABLE IF NOT EXISTS contacto_mensajes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT false
);

ALTER TABLE contacto_mensajes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert mensajes" ON contacto_mensajes
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated can read mensajes" ON contacto_mensajes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update mensajes" ON contacto_mensajes
  FOR UPDATE TO authenticated USING (true);

-- Contenidos editables (opcional)
CREATE TABLE IF NOT EXISTS contenidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contenidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read contenidos" ON contenidos
  FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can manage contenidos" ON contenidos
  FOR ALL TO authenticated USING (true);
```

### 3. Tablas específicas por tipo de negocio

#### Veterinaria
```sql
CREATE TABLE IF NOT EXISTS mascotas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,    -- perro, gato, ave, etc.
  raza TEXT,
  edad_aprox TEXT,
  peso DECIMAL,
  dueño_nombre TEXT NOT NULL,
  dueño_telefono TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Psicología
```sql
-- Solo se usa tabla citas con campos extra
ALTER TABLE citas ADD COLUMN IF NOT EXISTS tipo_sesion TEXT;
-- tipos: individual, pareja, familiar, grupal
```

#### Dentista
```sql
ALTER TABLE citas ADD COLUMN IF NOT EXISTS urgente BOOLEAN DEFAULT false;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS tipo_tratamiento TEXT;
```

### 4. Autenticación admin
Para el panel de administración:

```sql
-- Crear usuario admin desde el Dashboard de Supabase:
-- Authentication → Users → Invite user → email del admin
```

Patron en Astro para proteger rutas admin:
```astro
---
// src/pages/admin/index.astro
export const prerender = false;
import { supabase } from '../../lib/supabase';

const { cookies, redirect } = Astro;
const accessToken = cookies.get('sb-access-token')?.value;
const refreshToken = cookies.get('sb-refresh-token')?.value;

if (!accessToken || !refreshToken) return redirect('/admin/login');

const { error } = await supabase.auth.setSession({
  access_token: accessToken,
  refresh_token: refreshToken,
});

if (error) return redirect('/admin/login');
---
```

### 5. Variables de entorno
Crear `.env` en la raíz de la app:
```
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

**NUNCA** incluir la `service_role` key en el código cliente.

### 6. Seguridad checklist
- [ ] RLS habilitado en TODAS las tablas
- [ ] Tablas públicas: solo INSERT para anon
- [ ] Tablas con datos sensibles: solo authenticated
- [ ] No se expone service_role key en cliente
- [ ] Validación de datos con CHECK constraints
- [ ] Índices en columnas de búsqueda frecuente
