-- Integración CRM <-> Bot Telegram ZooManiaOF
-- Ejecutar en Supabase SQL Editor

-- 1. Telegram chat_id en clientes (para enviar recordatorios y vincular bot<->CRM)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS telegram_chat_id bigint UNIQUE;

-- 2. Fuente de cada cita: 'crm' (staff) o 'telegram' (bot)
ALTER TABLE citas ADD COLUMN IF NOT EXISTS fuente text DEFAULT 'crm';

-- 3. Índice para consultas de recordatorios (citas de mañana con telegram)
CREATE INDEX IF NOT EXISTS idx_citas_fecha_fuente ON citas(fecha, fuente);
CREATE INDEX IF NOT EXISTS idx_clientes_telegram ON clientes(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;
