# Zoomania CRM - Sistema de Agendamiento Veterinario

Web app para gestionar citas, clientes y mascotas en una veterinaria. Conectada en tiempo real con Supabase y n8n.

## 🚀 Stack

- **Frontend:** Next.js 14 + React 18 + TypeScript
- **Estilos:** Tailwind CSS
- **Base de datos:** Supabase (PostgreSQL + Realtime)
- **Componentes:** lucide-react
- **Deploy:** Vercel

## 📋 Funcionalidades

### ✅ Implementadas (Funcionales)
- **Agenda**: Timeline de citas por día, completar citas con tiempo real
- **Clientes**: CRUD completo, búsqueda
- **Mascotas**: CRUD completo, asociación con clientes
- **Dashboard**: Cards de KPIs, lista rápida de citas

### ⏳ Placeholder (estructura lista, sin datos)
- **Historial**: Datos ficticios
- **Facturación**: Datos ficticios
- **Inventario**: Datos ficticios

### 🔄 Realtime
- Todas las páginas se actualizan en tiempo real vía Supabase Realtime
- Cambios desde n8n (workflow) aparecen instantáneamente en la web

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Crear .env.local (ya está creado con credenciales)
# Verificar: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

# Ejecutar dev server
npm run dev
```

Accede en: http://localhost:3000

## 📦 Estructura

```
zoo-crm-web/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── agenda/page.tsx       # Agenda (FUNCIONAL)
│   ├── clientes/page.tsx     # Clientes CRUD (FUNCIONAL)
│   ├── mascotas/page.tsx     # Mascotas CRUD (FUNCIONAL)
│   ├── historial/page.tsx    # Placeholder
│   ├── facturacion/page.tsx  # Placeholder
│   ├── inventario/page.tsx   # Placeholder
│   ├── layout.tsx            # Layout global
│   └── globals.css           # Estilos globales
├── components/
│   ├── Sidebar.tsx           # Navegación
│   └── BotIndicator.tsx      # Indicador bot Telegram
├── lib/
│   ├── supabase.ts          # Cliente Supabase
│   ├── types.ts             # Tipos TypeScript
│   └── hooks.ts             # Hooks React (useCitas, useClientes, etc)
├── .env.local               # Credenciales (no commitear)
├── .env.example             # Plantilla variables
└── package.json
```

## 🔗 Integración con n8n

El workflow de n8n agrega citas automáticamente a la tabla `citas` en Supabase.
Estas aparecen en la página `/agenda` en tiempo real.

### Flujo:
1. Usuario envía mensaje a bot Telegram
2. n8n (AI Agent) procesa intención
3. n8n inserta cita en Supabase
4. CRM web actualiza instantáneamente (Realtime)

## 🚀 Deploy a Vercel

```bash
# Conectar repo a Vercel
# https://vercel.com/new

# Variables de entorno en Vercel:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_KEY (opcional, para admin)

# Deploy automático en cada push
```

## 📝 Variables de Entorno

```
NEXT_PUBLIC_SUPABASE_URL=https://ihnlqjcgkvtltjpqeonj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_KEY=sb_secret_...
```

## 🐛 Troubleshooting

### Citas no aparecen en tiempo real
- Verificar Realtime activado en Supabase (tablas con `REPLICA IDENTITY FULL`)
- Revisar console del navegador (F12)

### Error de conexión Supabase
- Verificar URL y keys en `.env.local`
- Confirmar que el proyecto Supabase está activo

### npm install falla
- Eliminar `node_modules` y `package-lock.json`
- Ejecutar `npm install` de nuevo

## 👥 Equipo

Desarrollado para demostración en Zoomania (demo: 4pm Jueves).

## 📄 Licencia

Privado - Zoomania
