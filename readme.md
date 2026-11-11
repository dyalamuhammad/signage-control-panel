# Signage Control Panel

Aplikasi signage digital dengan dashboard admin dan device client real-time.

## Live Demo

- Dashboard: https://signage-control-panel-fawn.vercel.app
- Login: `admin` / `admin123`
- Device client: `https://signage-control-panel-fawn.vercel.app/device/<device-id>`

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 15 (App Router), Tailwind, shadcn/ui |
| Auth | JWT (jose, httpOnly cookie, Edge-compatible) |
| Database | Supabase Postgres |
| Storage | Supabase Storage |
| Real-time | WebSocket (`ws`) — server terpisah |
| Deploy | Vercel (web) + Render (WS server) |

## Arsitektur

[Admin Dashboard] ⇄ REST ⇄ [Next.js API] ⇄ Supabase
⇅ WebSocket
[Device Client] ⇄ WS (heartbeat + command)

- `apps/web` — Next.js: dashboard admin, REST API, device viewer
- `apps/ws-server` — Node `ws`: registry admin/device, heartbeat, broadcast status

## Real-time Flow

1. Device connect WS → kirim `register` + `ping` tiap 5s
2. WS server simpan `last_seen` di Map
3. Timer 10s cek device yang `now - last_seen > 15s` → tandai offline
4. Saat status berubah → broadcast `device:status` ke semua admin
5. Dashboard update badge **tanpa refresh**
6. Device disconnect → langsung broadcast offline (grace via heartbeat tetap aktif)
7. Saat admin ganti content device → web panggil `POST /push` ke WS server
8. WS server kirim `command:push` ke socket device → device update content langsung

## Fitur

- ✅ CRUD devices & contents
- ✅ Upload file ke Supabase Storage
- ✅ Status online/offline real-time via WebSocket
- ✅ Heartbeat + offline detector
- ✅ Device client fullscreen (text/image/video/url)
- ✅ Reconnection dengan exponential backoff (max 30s)
- ✅ Auth JWT untuk dashboard admin
- ✅ Command push content real-time (bonus) — admin ganti content → device update tanpa refresh

## Setup Lokal

```bash
# 1. clone
git clone <repo>
cd signage-control-panel

# 2. web
cd apps/web
npm install
cp .env.example .env.local   # isi sesuai punyamu
npm run dev                  # :3000

# 3. ws server (terminal baru)
cd apps/ws-server
npm install
cp .env.example .env
npm run dev                  # :4000

Env — apps/web/.env.local

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
JWT_SECRET=            # min 32 char
ADMIN_USER=admin
ADMIN_PASS=admin123
NEXT_PUBLIC_WS_URL=ws://localhost:4000

Env — apps/ws-server/.env

PORT=4000
SUPABASE_URL=
SUPABASE_SECRET_KEY=
HEARTBEAT_INTERVAL=5000
OFFLINE_THRESHOLD=15000

Skema Database

create table devices (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  lokasi text,
  status text not null default 'offline' check (status in ('online','offline')),
  last_seen timestamptz,
  content_id uuid references contents(id) on delete set null,
  created_at timestamptz default now()
);

create table contents (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  tipe text not null check (tipe in ('image','video','text','url')),
  payload text not null,
  created_at timestamptz default now()
);

```

## Bonus — Command Push

Admin mengganti content di `/devices` → device client yang sedang online
langsung menampilkan content baru **tanpa refresh**.

Alur:
Admin PATCH /api/devices/:id
→ web panggil POST /push (dengan x-push-secret)
→ WS server cari device di Map
→ kirim { type: 'command:push', payload: content }
→ device client setContent(payload)

Env tambahan:
- `apps/web`: `WS_PUSH_URL`, `WS_PUSH_SECRET`
- `apps/ws-server`: `PUSH_SECRET` (harus sama dengan `WS_PUSH_SECRET`)
