---
applyTo: "src/lib/supabase.ts,**/*supabase*,src/pages/api/**"
description: "Use when working with Supabase client, database queries, authentication, or API endpoints. Covers Supabase JS SDK v2 patterns for Astro."
---

# Supabase Integration Guidelines

## Client Setup
The Supabase client is initialized in `src/lib/supabase.ts`. Always import from there:
```ts
import { supabase } from '../lib/supabase';
```

## Environment Variables
```
PUBLIC_SUPABASE_URL — Supabase project URL
PUBLIC_SUPABASE_ANON_KEY — Supabase anonymous/public key
```
Access via `import.meta.env.PUBLIC_SUPABASE_URL` (never `process.env`).

## Query Patterns
```ts
// Select
const { data, error } = await supabase.from('table').select('*');

// Insert
const { error } = await supabase.from('table').insert({ column: value });

// Update
const { error } = await supabase.from('table').update({ column: value }).eq('id', id);

// Delete
const { error } = await supabase.from('table').delete().eq('id', id);
```

## Authentication (if needed)
```ts
// Sign up
const { data, error } = await supabase.auth.signUp({ email, password });

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// Sign out
await supabase.auth.signOut();

// Get session
const { data: { session } } = await supabase.auth.getSession();
```

## Security Rules
- Never expose the `service_role` key in client-side code
- Use Row Level Security (RLS) on all tables
- Validate and sanitize user input before inserting into database
- Use parameterized queries (Supabase SDK does this automatically)

## Error Handling
Always check for errors in Supabase responses:
```ts
const { data, error } = await supabase.from('citas').insert(formData);
if (error) {
  console.error('Supabase error:', error.message);
  // Handle error appropriately
}
```
