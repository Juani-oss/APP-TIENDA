-- Esquema inicial de app_tienda
-- Se ejecuta automáticamente al levantar el contenedor de Postgres
-- (docker-entrypoint-initdb.d). SQLAlchemy también puede crear estas
-- tablas si no existen (Base.metadata.create_all), por eso se usa
-- IF NOT EXISTS en todo.

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    slug VARCHAR(140) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    slug VARCHAR(140) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    descripcion TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    imagen_url VARCHAR(500),
    destacado BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    marca_id INTEGER NOT NULL REFERENCES marcas(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    autor VARCHAR(120) NOT NULL,
    contenido TEXT NOT NULL,
    calificacion INTEGER NOT NULL DEFAULT 5,
    aprobado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_marca ON productos(marca_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_producto ON comentarios(producto_id);

-- ---------- Datos de ejemplo ----------

-- Usuario admin: admin@tienda.com / admin123
INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES ('Administrador', 'admin@tienda.com', '$2b$12$h4FeyfTC/McKUUDAlrGuyOsdGh8ufNvR9PBoIwRFKdT7x9L.1qgCC', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO categorias (nombre, slug, descripcion) VALUES
    ('Electrónica', 'electronica', 'Dispositivos y gadgets electrónicos'),
    ('Ropa', 'ropa', 'Indumentaria para todas las edades'),
    ('Hogar', 'hogar', 'Artículos para el hogar y decoración'),
    ('Deportes', 'deportes', 'Equipamiento y accesorios deportivos')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO marcas (nombre, slug, descripcion) VALUES
    ('Genérica', 'generica', 'Marca genérica sin fabricante específico'),
    ('TechPro', 'techpro', 'Tecnología de alta gama'),
    ('UrbanStyle', 'urbanstyle', 'Moda urbana contemporánea'),
    ('HomeMax', 'homemax', 'Artículos premium para el hogar')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, destacado, activo, categoria_id, marca_id)
SELECT * FROM (VALUES
    ('Auriculares Bluetooth', 'Auriculares inalámbricos con cancelación de ruido', 49.99, 25, NULL, TRUE, TRUE,
        (SELECT id FROM categorias WHERE slug = 'electronica'), (SELECT id FROM marcas WHERE slug = 'techpro')),
    ('Smartwatch Serie 5', 'Reloj inteligente con monitor de ritmo cardíaco', 89.99, 15, NULL, TRUE, TRUE,
        (SELECT id FROM categorias WHERE slug = 'electronica'), (SELECT id FROM marcas WHERE slug = 'techpro')),
    ('Remera Básica', 'Remera de algodón 100%, varios colores', 12.50, 100, NULL, FALSE, TRUE,
        (SELECT id FROM categorias WHERE slug = 'ropa'), (SELECT id FROM marcas WHERE slug = 'urbanstyle')),
    ('Campera Urbana', 'Campera impermeable estilo urbano', 65.00, 30, NULL, TRUE, TRUE,
        (SELECT id FROM categorias WHERE slug = 'ropa'), (SELECT id FROM marcas WHERE slug = 'urbanstyle')),
    ('Set de Sábanas', 'Juego de sábanas de algodón egipcio', 34.90, 40, NULL, FALSE, TRUE,
        (SELECT id FROM categorias WHERE slug = 'hogar'), (SELECT id FROM marcas WHERE slug = 'homemax')),
    ('Lámpara de Escritorio', 'Lámpara LED regulable', 22.00, 0, NULL, FALSE, TRUE,
        (SELECT id FROM categorias WHERE slug = 'hogar'), (SELECT id FROM marcas WHERE slug = 'homemax')),
    ('Pelota de Fútbol', 'Pelota reglamentaria N°5', 18.75, 50, NULL, FALSE, TRUE,
        (SELECT id FROM categorias WHERE slug = 'deportes'), (SELECT id FROM marcas WHERE slug = 'generica')),
    ('Mancuernas 5kg (par)', 'Set de mancuernas de goma', 27.30, 20, NULL, TRUE, TRUE,
        (SELECT id FROM categorias WHERE slug = 'deportes'), (SELECT id FROM marcas WHERE slug = 'generica'))
) AS v(nombre, descripcion, precio, stock, imagen_url, destacado, activo, categoria_id, marca_id)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE productos.nombre = v.nombre);

INSERT INTO comentarios (producto_id, autor, contenido, calificacion, aprobado)
SELECT (SELECT id FROM productos WHERE nombre = 'Auriculares Bluetooth'), 'Carla', 'Excelente calidad de sonido, muy cómodos.', 5, TRUE
WHERE EXISTS (SELECT 1 FROM productos WHERE nombre = 'Auriculares Bluetooth')
  AND NOT EXISTS (SELECT 1 FROM comentarios WHERE autor = 'Carla' AND contenido LIKE 'Excelente calidad%');

INSERT INTO comentarios (producto_id, autor, contenido, calificacion, aprobado)
SELECT (SELECT id FROM productos WHERE nombre = 'Smartwatch Serie 5'), 'Martín', 'La batería dura menos de lo esperado.', 3, FALSE
WHERE EXISTS (SELECT 1 FROM productos WHERE nombre = 'Smartwatch Serie 5')
  AND NOT EXISTS (SELECT 1 FROM comentarios WHERE autor = 'Martín' AND contenido LIKE 'La batería%');
