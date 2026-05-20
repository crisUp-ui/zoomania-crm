-- ================================================================
-- ZOOMANIA CRM — SEED DATA DE DEMOSTRACIÓN
-- Ejecutar completo en Supabase SQL Editor
-- ================================================================

-- 1. Agregar columna especie si no existe
ALTER TABLE mascotas ADD COLUMN IF NOT EXISTS especie TEXT DEFAULT 'Perro';

-- 2. Eliminar constraints que pueden bloquear el insert
ALTER TABLE mascotas DROP CONSTRAINT IF EXISTS mascotas_estado_pelaje_check;
ALTER TABLE mascotas DROP CONSTRAINT IF EXISTS mascotas_tamano_check;
ALTER TABLE mascotas DROP CONSTRAINT IF EXISTS mascotas_tamaño_check;
ALTER TABLE mascotas DROP CONSTRAINT IF EXISTS mascotas_tipo_pelo_check;
ALTER TABLE mascotas DROP CONSTRAINT IF EXISTS mascotas_temperamento_check;
ALTER TABLE mascotas DROP CONSTRAINT IF EXISTS mascotas_especie_check;

-- 3. Normalizar filas existentes para no violar los nuevos constraints
UPDATE mascotas SET estado_pelaje = 'Bueno'      WHERE estado_pelaje IS NULL OR estado_pelaje NOT IN ('Excelente','Bueno','Regular','Enmarañado');
UPDATE mascotas SET tamaño        = 'Mediano'     WHERE tamaño IS NULL OR tamaño NOT IN ('Pequeño','Mediano','Grande');
UPDATE mascotas SET tipo_pelo     = 'Corto'       WHERE tipo_pelo IS NULL OR tipo_pelo NOT IN ('Corto','Medio','Largo','Rizado');
UPDATE mascotas SET temperamento  = 'Tranquilo'   WHERE temperamento IS NULL OR temperamento NOT IN ('Tranquilo','Nervioso','Agresivo','Juguetón','Tímido');
UPDATE mascotas SET especie       = 'Perro'       WHERE especie IS NULL OR especie NOT IN ('Perro','Gato','Conejo','Ave','Iguana','Reptil','Hámster','Hurón','Pez','Otro');

-- 4. Recrear constraints con los valores correctos
ALTER TABLE mascotas ADD CONSTRAINT mascotas_estado_pelaje_check  CHECK (estado_pelaje IN ('Excelente','Bueno','Regular','Enmarañado'));
ALTER TABLE mascotas ADD CONSTRAINT mascotas_tamaño_check         CHECK (tamaño IN ('Pequeño','Mediano','Grande'));
ALTER TABLE mascotas ADD CONSTRAINT mascotas_tipo_pelo_check      CHECK (tipo_pelo IN ('Corto','Medio','Largo','Rizado'));
ALTER TABLE mascotas ADD CONSTRAINT mascotas_temperamento_check   CHECK (temperamento IN ('Tranquilo','Nervioso','Agresivo','Juguetón','Tímido'));
ALTER TABLE mascotas ADD CONSTRAINT mascotas_especie_check        CHECK (especie IN ('Perro','Gato','Conejo','Ave','Iguana','Reptil','Hámster','Hurón','Pez','Otro'));

-- ================================================================
-- SERVICIOS
-- ================================================================
INSERT INTO servicios (id, nombre, precio_base, tiempo_base_minutos, activo)
VALUES
  ('aaa00001-0000-0000-0000-000000000001', 'Baño y corte pequeño',    45.00, 60,  true),
  ('aaa00001-0000-0000-0000-000000000002', 'Baño y corte mediano',    60.00, 75,  true),
  ('aaa00001-0000-0000-0000-000000000003', 'Baño y corte grande',     80.00, 90,  true),
  ('aaa00001-0000-0000-0000-000000000004', 'Baño simple',             30.00, 45,  true),
  ('aaa00001-0000-0000-0000-000000000005', 'Consulta veterinaria',    55.00, 30,  true),
  ('aaa00001-0000-0000-0000-000000000006', 'Corte de uñas',           20.00, 20,  true)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- CLIENTES
-- ================================================================
INSERT INTO clientes (id, nombre, apellido, telefono, email, direccion)
VALUES
  ('bbb00001-0000-0000-0000-000000000001', 'María',    'García',    '987654301', 'maria.garcia@gmail.com',    'Av. Larco 234, Miraflores'),
  ('bbb00001-0000-0000-0000-000000000002', 'Carlos',   'López',     '987654302', 'carlos.lopez@gmail.com',    'Jr. Camaná 540, Lima'),
  ('bbb00001-0000-0000-0000-000000000003', 'Ana',      'Martínez',  '987654303', 'ana.martinez@gmail.com',    'Calle Los Pinos 12, San Borja'),
  ('bbb00001-0000-0000-0000-000000000004', 'Jorge',    'Ramírez',   '987654304', 'jorge.ramirez@gmail.com',   'Av. Javier Prado 890, San Isidro'),
  ('bbb00001-0000-0000-0000-000000000005', 'Lucía',    'Torres',    '987654305', 'lucia.torres@gmail.com',    'Calle Las Flores 78, Surco'),
  ('bbb00001-0000-0000-0000-000000000006', 'Roberto',  'Castillo',  '987654306', 'roberto.castillo@gmail.com','Av. Angamos 321, Surquillo'),
  ('bbb00001-0000-0000-0000-000000000007', 'Sofía',    'Mendoza',   '987654307', 'sofia.mendoza@gmail.com',   'Jr. Huallaga 100, Lima Centro'),
  ('bbb00001-0000-0000-0000-000000000008', 'Diego',    'Vargas',    '987654308', 'diego.vargas@gmail.com',    'Av. Brasil 445, Magdalena'),
  ('bbb00001-0000-0000-0000-000000000009', 'Patricia', 'Flores',    '987654309', 'patricia.flores@gmail.com', 'Calle Colón 200, Barranco'),
  ('bbb00001-0000-0000-0000-000000000010', 'Miguel',   'Quispe',    '987654310', 'miguel.quispe@gmail.com',   'Av. Colonial 680, Pueblo Libre')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- MASCOTAS
-- ================================================================
INSERT INTO mascotas (id, nombre, especie, raza, cliente_id, tamaño, peso_kg, edad_años, tipo_pelo, estado_pelaje, temperamento)
VALUES
  ('ccc00001-0000-0000-0000-000000000001', 'Rocky',   'Perro',   'Labrador',         'bbb00001-0000-0000-0000-000000000001', 'Grande',  28,  3, 'Corto',  'Bueno',      'Juguetón'),
  ('ccc00001-0000-0000-0000-000000000002', 'Luna',    'Gato',    'Persa',            'bbb00001-0000-0000-0000-000000000001', 'Pequeño',  4,  5, 'Largo',  'Excelente',  'Tranquilo'),
  ('ccc00001-0000-0000-0000-000000000003', 'Max',     'Perro',   'Golden Retriever', 'bbb00001-0000-0000-0000-000000000002', 'Grande',  32,  4, 'Largo',  'Bueno',      'Juguetón'),
  ('ccc00001-0000-0000-0000-000000000004', 'Mimi',    'Gato',    'Siamés',           'bbb00001-0000-0000-0000-000000000003', 'Pequeño',  3,  2, 'Corto',  'Excelente',  'Tranquilo'),
  ('ccc00001-0000-0000-0000-000000000005', 'Toby',    'Perro',   'Shih Tzu',         'bbb00001-0000-0000-0000-000000000003', 'Pequeño',  5,  1, 'Largo',  'Regular',    'Nervioso'),
  ('ccc00001-0000-0000-0000-000000000006', 'Bella',   'Perro',   'French Bulldog',   'bbb00001-0000-0000-0000-000000000004', 'Pequeño', 10,  2, 'Corto',  'Bueno',      'Juguetón'),
  ('ccc00001-0000-0000-0000-000000000007', 'Kiki',    'Ave',     'Loro',             'bbb00001-0000-0000-0000-000000000004', 'Pequeño',  1,  3, 'Corto',  'Excelente',  'Juguetón'),
  ('ccc00001-0000-0000-0000-000000000008', 'Thor',    'Perro',   'Husky Siberiano',  'bbb00001-0000-0000-0000-000000000005', 'Grande',  25,  2, 'Medio',  'Bueno',      'Juguetón'),
  ('ccc00001-0000-0000-0000-000000000009', 'Nala',    'Gato',    'Angora',           'bbb00001-0000-0000-0000-000000000006', 'Pequeño',  4,  4, 'Largo',  'Enmarañado', 'Tímido'),
  ('ccc00001-0000-0000-0000-000000000010', 'Coco',    'Perro',   'Poodle',           'bbb00001-0000-0000-0000-000000000006', 'Pequeño',  6,  6, 'Rizado', 'Regular',    'Nervioso'),
  ('ccc00001-0000-0000-0000-000000000011', 'Peanut',  'Hámster', 'Dorado',           'bbb00001-0000-0000-0000-000000000007', 'Pequeño',  1,  1, 'Corto',  'Excelente',  'Tranquilo'),
  ('ccc00001-0000-0000-0000-000000000012', 'Rex',     'Perro',   'Pastor Alemán',    'bbb00001-0000-0000-0000-000000000008', 'Grande',  35,  5, 'Corto',  'Bueno',      'Agresivo'),
  ('ccc00001-0000-0000-0000-000000000013', 'Lola',    'Perro',   'Maltés',           'bbb00001-0000-0000-0000-000000000009', 'Pequeño',  3,  3, 'Largo',  'Excelente',  'Tranquilo'),
  ('ccc00001-0000-0000-0000-000000000014', 'Iggy',    'Iguana',  'Iguana verde',     'bbb00001-0000-0000-0000-000000000010', 'Mediano',  2,  4, 'Corto',  'Bueno',      'Tranquilo'),
  ('ccc00001-0000-0000-0000-000000000015', 'Bunny',   'Conejo',  'Holandés enano',   'bbb00001-0000-0000-0000-000000000007', 'Pequeño',  2,  2, 'Corto',  'Excelente',  'Tranquilo')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- CITAS DE HOY (2026-05-20) — 10 citas
-- 3 completadas · 2 en_proceso · 5 pendientes
-- ================================================================
INSERT INTO citas (id, fecha, hora_inicio, hora_fin_estimada, hora_fin_real, cliente_id, mascota_id, servicio_id, tiempo_calculado_minutos, estado)
VALUES
  ('ddd00001-0000-0000-0000-000000000001', '2026-05-20', '09:00:00', '10:30:00', '10:25:00', 'bbb00001-0000-0000-0000-000000000001', 'ccc00001-0000-0000-0000-000000000001', 'aaa00001-0000-0000-0000-000000000003', 90, 'completada'),
  ('ddd00001-0000-0000-0000-000000000002', '2026-05-20', '09:15:00', '10:30:00', '10:40:00', 'bbb00001-0000-0000-0000-000000000002', 'ccc00001-0000-0000-0000-000000000003', 'aaa00001-0000-0000-0000-000000000003', 90, 'completada'),
  ('ddd00001-0000-0000-0000-000000000003', '2026-05-20', '10:00:00', '10:45:00', '10:42:00', 'bbb00001-0000-0000-0000-000000000003', 'ccc00001-0000-0000-0000-000000000005', 'aaa00001-0000-0000-0000-000000000001', 60, 'completada'),
  ('ddd00001-0000-0000-0000-000000000004', '2026-05-20', '10:30:00', '11:30:00', NULL,        'bbb00001-0000-0000-0000-000000000004', 'ccc00001-0000-0000-0000-000000000006', 'aaa00001-0000-0000-0000-000000000001', 60, 'en_proceso'),
  ('ddd00001-0000-0000-0000-000000000005', '2026-05-20', '11:00:00', '12:15:00', NULL,        'bbb00001-0000-0000-0000-000000000005', 'ccc00001-0000-0000-0000-000000000008', 'aaa00001-0000-0000-0000-000000000002', 75, 'en_proceso'),
  ('ddd00001-0000-0000-0000-000000000006', '2026-05-20', '12:00:00', '12:45:00', NULL,        'bbb00001-0000-0000-0000-000000000006', 'ccc00001-0000-0000-0000-000000000010', 'aaa00001-0000-0000-0000-000000000001', 60, 'pendiente'),
  ('ddd00001-0000-0000-0000-000000000007', '2026-05-20', '13:00:00', '13:30:00', NULL,        'bbb00001-0000-0000-0000-000000000007', 'ccc00001-0000-0000-0000-000000000011', 'aaa00001-0000-0000-0000-000000000005', 30, 'pendiente'),
  ('ddd00001-0000-0000-0000-000000000008', '2026-05-20', '14:00:00', '15:30:00', NULL,        'bbb00001-0000-0000-0000-000000000008', 'ccc00001-0000-0000-0000-000000000012', 'aaa00001-0000-0000-0000-000000000003', 90, 'pendiente'),
  ('ddd00001-0000-0000-0000-000000000009', '2026-05-20', '15:30:00', '16:15:00', NULL,        'bbb00001-0000-0000-0000-000000000009', 'ccc00001-0000-0000-0000-000000000013', 'aaa00001-0000-0000-0000-000000000002', 75, 'pendiente'),
  ('ddd00001-0000-0000-0000-000000000010', '2026-05-20', '16:00:00', '16:20:00', NULL,        'bbb00001-0000-0000-0000-000000000010', 'ccc00001-0000-0000-0000-000000000014', 'aaa00001-0000-0000-0000-000000000006', 20, 'pendiente')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- CITAS DE LA SEMANA (5 citas en distintos días)
-- ================================================================
INSERT INTO citas (id, fecha, hora_inicio, hora_fin_estimada, cliente_id, mascota_id, servicio_id, tiempo_calculado_minutos, estado)
VALUES
  ('ddd00001-0000-0000-0000-000000000011', '2026-05-21', '09:00:00', '10:00:00', 'bbb00001-0000-0000-0000-000000000001', 'ccc00001-0000-0000-0000-000000000002', 'aaa00001-0000-0000-0000-000000000001', 60, 'pendiente'),
  ('ddd00001-0000-0000-0000-000000000012', '2026-05-22', '10:00:00', '11:15:00', 'bbb00001-0000-0000-0000-000000000003', 'ccc00001-0000-0000-0000-000000000004', 'aaa00001-0000-0000-0000-000000000002', 75, 'pendiente'),
  ('ddd00001-0000-0000-0000-000000000013', '2026-05-23', '11:00:00', '12:30:00', 'bbb00001-0000-0000-0000-000000000005', 'ccc00001-0000-0000-0000-000000000008', 'aaa00001-0000-0000-0000-000000000003', 90, 'pendiente'),
  ('ddd00001-0000-0000-0000-000000000014', '2026-05-26', '14:00:00', '14:45:00', 'bbb00001-0000-0000-0000-000000000006', 'ccc00001-0000-0000-0000-000000000009', 'aaa00001-0000-0000-0000-000000000004', 45, 'pendiente'),
  ('ddd00001-0000-0000-0000-000000000015', '2026-05-27', '09:30:00', '10:30:00', 'bbb00001-0000-0000-0000-000000000004', 'ccc00001-0000-0000-0000-000000000007', 'aaa00001-0000-0000-0000-000000000005', 30, 'pendiente')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- HISTORIAL ANTERIOR (citas completadas semanas pasadas)
-- ================================================================
INSERT INTO citas (id, fecha, hora_inicio, hora_fin_estimada, hora_fin_real, cliente_id, mascota_id, servicio_id, tiempo_calculado_minutos, estado)
VALUES
  ('ddd00001-0000-0000-0000-000000000020', '2026-05-13', '09:00:00', '10:30:00', '10:20:00', 'bbb00001-0000-0000-0000-000000000001', 'ccc00001-0000-0000-0000-000000000001', 'aaa00001-0000-0000-0000-000000000003', 90, 'completada'),
  ('ddd00001-0000-0000-0000-000000000021', '2026-05-13', '10:00:00', '11:00:00', '10:55:00', 'bbb00001-0000-0000-0000-000000000003', 'ccc00001-0000-0000-0000-000000000005', 'aaa00001-0000-0000-0000-000000000002', 75, 'completada'),
  ('ddd00001-0000-0000-0000-000000000022', '2026-05-14', '11:00:00', '11:45:00', '11:50:00', 'bbb00001-0000-0000-0000-000000000004', 'ccc00001-0000-0000-0000-000000000006', 'aaa00001-0000-0000-0000-000000000001', 60, 'completada'),
  ('ddd00001-0000-0000-0000-000000000023', '2026-05-15', '09:30:00', '10:00:00', '09:58:00', 'bbb00001-0000-0000-0000-000000000007', 'ccc00001-0000-0000-0000-000000000015', 'aaa00001-0000-0000-0000-000000000004', 45, 'completada'),
  ('ddd00001-0000-0000-0000-000000000024', '2026-05-15', '14:00:00', '15:30:00', '15:35:00', 'bbb00001-0000-0000-0000-000000000005', 'ccc00001-0000-0000-0000-000000000008', 'aaa00001-0000-0000-0000-000000000003', 90, 'completada'),
  ('ddd00001-0000-0000-0000-000000000025', '2026-05-06', '10:00:00', '11:00:00', '10:58:00', 'bbb00001-0000-0000-0000-000000000002', 'ccc00001-0000-0000-0000-000000000003', 'aaa00001-0000-0000-0000-000000000003', 90, 'completada'),
  ('ddd00001-0000-0000-0000-000000000026', '2026-05-07', '09:00:00', '09:30:00', '09:28:00', 'bbb00001-0000-0000-0000-000000000009', 'ccc00001-0000-0000-0000-000000000013', 'aaa00001-0000-0000-0000-000000000006', 20, 'completada'),
  ('ddd00001-0000-0000-0000-000000000027', '2026-05-08', '11:00:00', '12:00:00', '11:52:00', 'bbb00001-0000-0000-0000-000000000006', 'ccc00001-0000-0000-0000-000000000010', 'aaa00001-0000-0000-0000-000000000001', 60, 'completada'),
  ('ddd00001-0000-0000-0000-000000000028', '2026-04-29', '14:00:00', '15:30:00', '15:45:00', 'bbb00001-0000-0000-0000-000000000008', 'ccc00001-0000-0000-0000-000000000012', 'aaa00001-0000-0000-0000-000000000003', 90, 'completada'),
  ('ddd00001-0000-0000-0000-000000000029', '2026-04-30', '09:00:00', '09:30:00', '09:32:00', 'bbb00001-0000-0000-0000-000000000010', 'ccc00001-0000-0000-0000-000000000014', 'aaa00001-0000-0000-0000-000000000005', 30, 'completada')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- ALERTAS MÉDICAS
-- ================================================================
INSERT INTO alertas_medicas (mascota_id, tipo, descripcion, fecha_vencimiento)
VALUES
  ('ccc00001-0000-0000-0000-000000000001', 'vacuna',     'Vacuna antirrábica pendiente',          '2026-06-15'),
  ('ccc00001-0000-0000-0000-000000000003', 'vacuna',     'Refuerzo polivalente',                  '2026-07-01'),
  ('ccc00001-0000-0000-0000-000000000005', 'alergia',    'Alergia a champú con parabenos',        NULL),
  ('ccc00001-0000-0000-0000-000000000008', 'medicacion', 'Tratamiento mensual antipulgas',        '2026-06-20'),
  ('ccc00001-0000-0000-0000-000000000012', 'alergia',    'Sensible a anestesia local',            NULL),
  ('ccc00001-0000-0000-0000-000000000009', 'otro',       'Pelaje enmarañado — requiere sedación', '2026-06-10')
ON CONFLICT DO NOTHING;
