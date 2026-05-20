-- Alertas médicas por mascota (una por cada mascota registrada)
-- Ejecutar en Supabase SQL Editor
-- Inserta alertas usando los IDs reales de las mascotas

INSERT INTO alertas_medicas (mascota_id, tipo, descripcion, fecha_vencimiento)
SELECT m.id, 'vacuna', 'Vacuna antirrábica pendiente de renovación', (CURRENT_DATE + INTERVAL '30 days')::date
FROM mascotas m WHERE m.nombre = 'Max' LIMIT 1;

INSERT INTO alertas_medicas (mascota_id, tipo, descripcion, fecha_vencimiento)
SELECT m.id, 'vacuna', 'Vacuna polivalente vence próximamente', (CURRENT_DATE + INTERVAL '15 days')::date
FROM mascotas m WHERE m.nombre = 'Luna' LIMIT 1;

INSERT INTO alertas_medicas (mascota_id, tipo, descripcion)
SELECT m.id, 'alergia', 'Alergia a champú con fragancia — usar solo productos hipoalergénicos'
FROM mascotas m WHERE m.nombre = 'Toby' LIMIT 1;

INSERT INTO alertas_medicas (mascota_id, tipo, descripcion, fecha_vencimiento)
SELECT m.id, 'vacuna', 'Triple felina pendiente', (CURRENT_DATE + INTERVAL '45 days')::date
FROM mascotas m WHERE m.nombre = 'Michi' LIMIT 1;

INSERT INTO alertas_medicas (mascota_id, tipo, descripcion)
SELECT m.id, 'comportamiento', 'Nervioso con ruidos fuertes — manejar con calma en la recepción'
FROM mascotas m WHERE m.nombre = 'Rocky' LIMIT 1;

INSERT INTO alertas_medicas (mascota_id, tipo, descripcion, fecha_vencimiento)
SELECT m.id, 'vacuna', 'Desparasitación interna vence', (CURRENT_DATE + INTERVAL '7 days')::date
FROM mascotas m WHERE m.nombre = 'Bella' LIMIT 1;

INSERT INTO alertas_medicas (mascota_id, tipo, descripcion)
SELECT m.id, 'alergia', 'Sensible a productos con alcohol — evitar en baño'
FROM mascotas m WHERE m.nombre = 'Pelusa' LIMIT 1;

INSERT INTO alertas_medicas (mascota_id, tipo, descripcion, fecha_vencimiento)
SELECT m.id, 'vacuna', 'Bordetella (tos de las perreras) pendiente', (CURRENT_DATE + INTERVAL '60 days')::date
FROM mascotas m WHERE m.nombre = 'Bruno' LIMIT 1;

INSERT INTO alertas_medicas (mascota_id, tipo, descripcion)
SELECT m.id, 'comportamiento', 'Agresivo con otros perros — mantener separado en sala de espera'
FROM mascotas m WHERE m.nombre = 'Thor' LIMIT 1;

INSERT INTO alertas_medicas (mascota_id, tipo, descripcion, fecha_vencimiento)
SELECT m.id, 'vacuna', 'Vacuna moquillo pendiente de refuerzo', (CURRENT_DATE + INTERVAL '20 days')::date
FROM mascotas m WHERE m.nombre = 'Coco' LIMIT 1;

INSERT INTO alertas_medicas (mascota_id, tipo, descripcion)
SELECT m.id, 'otro', 'Diabetes controlada — monitorear nivel de estrés durante el servicio'
FROM mascotas m WHERE m.nombre = 'Simba' LIMIT 1;

INSERT INTO alertas_medicas (mascota_id, tipo, descripcion, fecha_vencimiento)
SELECT m.id, 'vacuna', 'Leucemia felina pendiente', (CURRENT_DATE + INTERVAL '10 days')::date
FROM mascotas m WHERE m.nombre = 'Gatita' LIMIT 1;

INSERT INTO alertas_medicas (mascota_id, tipo, descripcion)
SELECT m.id, 'alergia', 'Alergia alimentaria — no dar snacks sin consultar al dueño'
FROM mascotas m WHERE m.nombre = 'Peanut' LIMIT 1;

INSERT INTO alertas_medicas (mascota_id, tipo, descripcion, fecha_vencimiento)
SELECT m.id, 'vacuna', 'Desparasitación externa (pulgas/garrapatas)', (CURRENT_DATE + INTERVAL '14 days')::date
FROM mascotas m WHERE m.nombre = 'Buddy' LIMIT 1;

INSERT INTO alertas_medicas (mascota_id, tipo, descripcion)
SELECT m.id, 'comportamiento', 'Muy juguetón — requiere correa corta en recepción'
FROM mascotas m WHERE m.nombre = 'Kira' LIMIT 1;
