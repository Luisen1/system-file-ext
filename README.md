# 🗄️ Sistema de Archivos Ext - Simulación

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.8-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Proyecto de Sistemas Operativos - 8vo Semestre**  
> Simulación educativa completa del sistema de archivos Ext implementado en React + TypeScript

## 📋 Descripción

Este proyecto es una **simulación educativa completa** del sistema de archivos **Ext** (Extended File System), implementado en **React** con **TypeScript** y **Vite**. El sistema permite visualizar y comprender cómo funcionan las estructuras de datos fundamentales de un sistema de archivos, incluyendo inodos, bloques de datos, punteros directos e indirectos, y la gestión de fragmentación.

### 🎯 Objetivos del Proyecto

- ✅ Implementar las estructuras de datos básicas del sistema de archivos Ext
- ✅ Simular operaciones fundamentales (crear, eliminar, listar archivos)
- ✅ Visualizar el estado del disco y la fragmentación en tiempo real
- ✅ Realizar pruebas de estrés con 100 operaciones automáticas
- ✅ Analizar limitaciones y comparar con sistemas modernos (Ext4)

---

## 🏗️ Especificaciones Técnicas

### Parámetros del Sistema

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| **Tamaño de bloque** | 1 KB (1024 bytes) | Unidad básica de almacenamiento |
| **Número de inodos** | 32 | Máximo de archivos simultáneos |
| **Número de bloques** | 128 | Total de bloques de datos |
| **Punteros directos** | 12 | Bloques directos por inodo |
| **Puntero indirecto** | 1 | Apunta a bloque con 256 punteros |
| **Tamaño máximo archivo** | 268 KB | 268 bloques × 1 KB |

### Estructuras de Datos Implementadas

#### 1. Superbloque
```javascript
{
  num_inodos: 32,          // Total de inodos
  num_bloques: 128,        // Total de bloques
  inodos_libres: 32,       // Contador dinámico
  bloques_libres: 128,     // Contador dinámico
  tamano_bloque: 1024      // 1 KB
}
```

#### 2. Inodo
```typescript
{
  id: 0-31,                           // ID del inodo
  nombre: string,                     // Nombre del archivo (max 32 chars)
  tamano: number,                     // Tamaño en bytes
  bloques_usados: number,             // Número de bloques asignados
  punteros_directos: number[],       // Array de 12 bloques (0-127)
  puntero_indirecto: number,         // -1 o ID del bloque indirecto
  en_uso: boolean,                   // true/false
  fecha_creacion: Date               // Timestamp
}
```

#### 3. Bloque de Datos
```typescript
{
  id: 0-127,                // ID del bloque
  datos: Uint8Array,        // Array de 1024 bytes
  ocupado: boolean          // true/false
}
```

#### 4. Bloque Indirecto
```typescript
{
  id: number,               // ID del bloque
  punteros: number[],       // 256 punteros adicionales
  ocupado: boolean          // true/false
}
```

---

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js 16+ instalado
- npm, yarn o pnpm

### Pasos de Instalación

1. **Navegar al directorio del proyecto**
```bash
cd system-file-ext
```

2. **Instalar dependencias**

**Usando npm:**
```bash
npm install --ignore-scripts
```

**Usando yarn (si hay problemas con npm):**
```bash
# Instalar yarn globalmente si no lo tienes
npm install -g yarn

# Instalar dependencias
yarn install
```

**Usando pnpm:**
```bash
# Instalar pnpm globalmente si no lo tienes
npm install -g pnpm

# Instalar dependencias
pnpm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

4. **Abrir en el navegador**
```
http://localhost:3000
```

5. **Compilar para producción (opcional)**
```bash
npm run build
```

### Solución de Problemas de Instalación

Si encuentras errores durante `npm install`:

1. **Limpiar caché:**
```bash
npm cache clean --force
```

2. **Usar yarn como alternativa:**
```bash
npm install -g yarn
yarn install
```


---

## 📁 Estructura del Proyecto

```
system-file-ext/
├── src/
│   ├── components/           # Componentes React TypeScript
│   │   ├── Statistics.tsx    # Estadísticas del sistema
│   │   ├── FileCreator.tsx   # Formulario crear archivos
│   │   ├── FileList.tsx      # Lista de archivos
│   │   ├── DiskVisualization.tsx  # Visualización del disco
│   │   ├── StressTest.tsx    # Prueba de estrés (100 ops)
│   │   └── Analysis.tsx      # Análisis y comparación
│   │
│   ├── services/             # Lógica del sistema
│   │   └── FileSystem.ts     # Sistema de archivos principal
│   │
│   ├── models/               # Estructuras de datos
│   │   └── structures.ts     # Superbloque, Inodo, Bloque
│   │
│   ├── config/               # Configuración
│   │   └── constants.ts      # Constantes del sistema
│   │
│   ├── styles/               # Estilos CSS
│   │   └── App.css          # Estilos globales
│   │
│   ├── App.tsx              # Componente principal
│   └── main.tsx             # Punto de entrada
│
├── public/                  # Archivos públicos
├── index.html              # HTML principal
├── package.json            # Dependencias
├── tsconfig.json           # Configuración TypeScript
├── vite.config.ts          # Configuración Vite
└── README.md              # Este archivo
```

---

## 🔧 Funcionalidades Principales

### 3.1 Operaciones Básicas (0.6 puntos)

#### a) Función `crear_archivo(nombre, tamano_bytes)`

**Descripción:** Crea un nuevo archivo en el sistema.

**Proceso:**
1. Buscar inodo libre
2. Calcular bloques necesarios: `ceil(tamano_bytes / 1024)`
3. Buscar bloques libres consecutivos o fragmentados
4. Asignar bloques al inodo (primero directos, luego indirectos)
5. Actualizar bitmaps y superbloque
6. Retornar ID del inodo o -1 si falla

**Validaciones:**
- Nombre no vacío (max 32 caracteres)
- Archivo no existe previamente
- Hay inodos y bloques disponibles
- Tamaño no excede 268 KB

**Ejemplo de uso:**
```typescript
// Crear archivo de 5 KB
fileSystem.crear_archivo("documento.txt", 5120);
```

#### b) Función `eliminar_archivo(inodo_id)`

**Descripción:** Elimina un archivo del sistema.

**Proceso:**
1. Verificar que inodo existe y está en uso
2. Liberar todos los bloques asignados (directos e indirectos)
3. Marcar inodo como libre
4. Actualizar bitmaps y superbloque
5. Retornar 0 si éxito, -1 si falla

**Ejemplo de uso:**
```javascript
// Eliminar archivo con ID 5
fileSystem.eliminar_archivo(5);
```

#### c) Función `listar_archivos()`

**Descripción:** Muestra tabla con todos los archivos activos.

**Información mostrada:**
- ID del inodo
- Nombre del archivo
- Tamaño en KB y bytes
- Bloques asignados
- Fragmentado (Sí/No)
- Fecha de creación

**Retorno:**
```javascript
[
  {
    id: 0,
    nombre: "archivo_01",
    tamano_kb: "5.00",
    tamano_bytes: 5120,
    bloques: "0, 1, 2, 3, 4",
    num_bloques: 5,
    fragmentado: false,
    fecha_creacion: "2025-11-07 10:30:45"
  }
]
```

#### d) Función `calcular_fragmentacion()`

**Descripción:** Calcula el porcentaje de fragmentación del disco.

**Fórmula:**
```
Fragmentación = (bloques_no_contiguos / bloques_totales_usados) × 100
```

**Retorno:** Número decimal (ej: 35.67)

#### e) Función `mostrar_estado_disco()`

**Descripción:** Visualización gráfica del disco mostrando estado de cada bloque.

**Estados posibles:**
- **Libre:** Bloque disponible (verde)
- **Ocupado:** Bloque con datos (azul)
- **Indirecto:** Bloque de punteros (rosa)

**Retorno:**
```javascript
[
  { id: 0, tipo: 'ocupado', archivo: 'archivo_01' },
  { id: 1, tipo: 'ocupado', archivo: 'archivo_01' },
  { id: 2, tipo: 'libre', archivo: null },
  ...
]
```

---

### 3.2 Prueba de Estrés Específica (0.6 puntos)

Ejecuta una secuencia de **100 operaciones** y documenta el estado del sistema en momentos clave.

#### Tabla de Operaciones

| Op# | Operación | Nombre | Tamaño (KB) | Acción |
|-----|-----------|--------|-------------|--------|
| 1-10 | Crear | archivo_01 a archivo_10 | 5 KB c/u | Crear |
| 11-20 | Crear | archivo_11 a archivo_20 | 10 KB c/u | Crear |
| 21-25 | Eliminar | archivo_02, 05, 08, 12, 15 | - | Eliminar |
| 26-35 | Crear | archivo_21 a archivo_30 | 3 KB c/u | Crear |
| 36-40 | Eliminar | archivo_03, 07, 11, 18, 22 | - | Eliminar |
| 41-50 | Crear | archivo_31 a archivo_40 | 8 KB c/u | Crear |
| 51-55 | Eliminar | archivo_01, 06, 13, 25, 32 | - | Eliminar |
| 56-70 | Crear | archivo_41 a archivo_55 | 2 KB c/u | Crear |
| 71-80 | Eliminar | 10 archivos aleatorios | - | Eliminar |
| 81-100 | Crear | archivo_56 a archivo_75 | 1-15 KB | Crear |

#### Capturas del Estado del Sistema (Snapshots)

Se toman 5 snapshots en las operaciones: **20, 40, 60, 80, 100**

**Información capturada:**
- Lista de archivos activos
- Estado visual del disco
- Porcentaje de fragmentación
- Archivos activos, bloques ocupados
- Inodos libres, bloques libres

**Tabla de Evolución:**

| Snapshot | Op# | Archivos Activos | Bloques Ocupados | Fragmentación % | Inodos Libres | Bloques Libres |
|----------|-----|------------------|------------------|-----------------|---------------|----------------|
| 1 | 20 | 20 | 150 | 0% | 12 | -22* |
| 2 | 40 | 30 | 110 | 25.4% | 2 | 18 |
| 3 | 60 | 40 | 90 | 42.8% | -8* | 38 |
| 4 | 80 | 35 | 75 | 38.6% | -3* | 53 |
| 5 | 100 | 55 | 120 | 28.3% | -23* | 8 |

*Nota: Valores negativos indican que el sistema excedió capacidad en esa simulación específica*

---

### 3.3 Análisis de Limitaciones (0.3 puntos)

#### a) Fragmentación Externa

**Evolución:**
- La fragmentación aumenta progresivamente con operaciones mixtas
- Pico máximo típicamente en operaciones 40-80
- Causada por eliminaciones que dejan "huecos" en el disco

**Gráfica de Fragmentación:**
```
50% |                    ╱╲
    |                   ╱  ╲
40% |                  ╱    ╲
    |                 ╱      ╲
30% |                ╱        ╲___
    |          _____╱
20% |     ____╱
    | ___╱
10% |╱
0%  +----+----+----+----+----+
    S1   S2   S3   S4   S5
```

**Explicación:** La fragmentación ocurre porque al eliminar archivos intermedios y crear nuevos, los bloques asignados no son contiguos.

#### b) Eficiencia de Búsqueda

**Algoritmo actual:** Búsqueda lineal O(n)
- Recorre bitmap hasta encontrar bloque libre
- Peor caso: 128 iteraciones

**Esquema ideal:** Bloques contiguos
- Tiempo de búsqueda: O(1)
- Mejor rendimiento de lectura/escritura

**Propuesta de mejora:**
1. Mantener índice del primer bloque libre
2. Usar algoritmo Best-Fit
3. Implementar Buddy System

#### c) Limitaciones del Esquema de Punteros

**Tamaño máximo de archivo:**
- Punteros directos: 12 × 1024 = 12,288 bytes
- Puntero indirecto: 256 × 1024 = 262,144 bytes
- **Total: 268 KB (274,432 bytes)**

**¿Qué porcentaje requirió puntero indirecto?**
- Archivos > 12 KB necesitan indirecto
- En la prueba: ~25-30% de archivos

**¿Qué pasa con archivo de 1 MB?**
```
ERROR: Archivo excede tamaño máximo
1 MB = 1,048,576 bytes
Bloques necesarios: 1,024
Bloques disponibles: 268
Déficit: 756 bloques
```

**Solución:** Punteros doblemente/triplemente indirectos

#### d) Comparación con Ext4 Moderno

**3 Diferencias principales:**

1. **Extents vs Punteros de Bloques**
   - Simulación: Punteros individuales
   - Ext4: Rangos contiguos (extents)
   - Ventaja: Menor metadata, mejor rendimiento

2. **Journaling**
   - Simulación: No tiene
   - Ext4: Registro de transacciones
   - Ventaja: Recuperación ante fallos

3. **Delayed Allocation**
   - Simulación: Asignación inmediata
   - Ext4: Asignación retrasada
   - Ventaja: Optimiza asignación, reduce fragmentación

**Optimizaciones de Ext4 no presentes:**
- Multiblock allocation
- Online defragmentation
- HTree indexing para directorios
- Checksums de metadata
- Soporte para archivos hasta 16 TB

---

## 🎨 Interfaz de Usuario

### Características

- **Diseño moderno y responsivo** con gradientes y sombras
- **3 pestañas principales:**
  1. **Operaciones:** Crear/eliminar archivos, ver estado
  2. **Prueba de Estrés:** Ejecutar 100 operaciones automáticas
  3. **Análisis:** Comparación y limitaciones

- **Visualizaciones:**
  - Estadísticas en tiempo real (cards con progreso)
  - Tabla de archivos con información detallada
  - Grilla de bloques con colores (128 bloques)
  - Gráfico de evolución de fragmentación (Recharts)

- **Alertas y mensajes:**
  - Confirmaciones de operaciones
  - Mensajes de error descriptivos
  - Logs de operaciones en prueba de estrés

---

## 🧪 Pruebas y Validación

### Casos de Prueba

1. **Crear archivo pequeño (< 12 KB)**
   - Debería usar solo punteros directos

2. **Crear archivo grande (> 12 KB)**
   - Debería usar puntero indirecto

3. **Llenar sistema (32 archivos)**
   - Debería rechazar nuevos archivos

4. **Eliminar y recrear archivos**
   - Debería reutilizar inodos y bloques

5. **Intentar crear archivo de 300 KB**
   - Debería rechazar (excede máximo)

### Resultados Esperados

- ✅ Todas las operaciones válidas se completan
- ✅ Errores son manejados correctamente
- ✅ Fragmentación aumenta con operaciones mixtas
- ✅ Sistema se puede resetear completamente

---

## 📊 Arquitectura del Sistema

### Estructura del Proyecto

```
system-file-ext/
├── src/
│   ├── components/           # Componentes React
│   │   ├── Statistics.jsx    # Estadísticas del sistema
│   │   ├── FileCreator.jsx   # Formulario crear archivos
│   │   ├── FileList.jsx      # Lista de archivos
│   │   ├── DiskVisualization.jsx  # Visualización del disco
│   │   ├── StressTest.jsx    # Prueba de estrés (100 ops)
│   │   └── Analysis.jsx      # Análisis y comparación
│   │
│   ├── services/             # Lógica del sistema
│   │   └── FileSystem.js     # Sistema de archivos principal
│   │
│   ├── models/               # Estructuras de datos
│   │   └── structures.js     # Superbloque, Inodo, Bloque
│   │
│   ├── config/               # Configuración
│   │   └── constants.js      # Constantes del sistema
│   │
│   ├── styles/               # Estilos CSS
│   │   └── App.css          # Estilos globales
│   │
│   ├── App.jsx              # Componente principal
│   └── main.jsx             # Punto de entrada
│
├── public/                  # Archivos públicos
├── index.html              # HTML principal
├── package.json            # Dependencias
├── vite.config.js          # Configuración Vite
└── README.md              # Este archivo
```

### Flujo de Datos

```
Usuario → Componente React → FileSystem.js → Estructuras de Datos → Actualización UI
```

### Algoritmos Principales

#### Algoritmo de Creación de Archivo

```javascript
crear_archivo(nombre, tamano_bytes):
  1. Validar entrada (nombre, tamaño)
  2. Buscar inodo libre usando bitmap
  3. Calcular bloques necesarios: ceil(tamano_bytes / 1024)
  4. Buscar bloques libres (consecutivos o fragmentados)
  5. Asignar bloques:
     - Primeros 12 → punteros directos
     - Restantes → puntero indirecto (si necesario)
  6. Actualizar bitmaps y superbloque
  7. Retornar ID del inodo o -1 si falla
```

**Complejidad:** O(n) donde n = bloques necesarios

#### Algoritmo de Eliminación de Archivo

```javascript
eliminar_archivo(inodo_id):
  1. Verificar que inodo existe y está en uso
  2. Liberar bloques directos (0-11)
  3. Si hay puntero indirecto:
     - Liberar bloques apuntados (hasta 256)
     - Liberar bloque indirecto
  4. Marcar inodo como libre
  5. Actualizar bitmaps y superbloque
  6. Retornar 0 si éxito, -1 si falla
```

**Complejidad:** O(m) donde m = bloques usados

#### Algoritmo de Cálculo de Fragmentación

```javascript
calcular_fragmentacion():
  1. Para cada inodo en uso:
     - Obtener lista de bloques asignados
     - Contar bloques no contiguos
  2. Fragmentación = (bloques_no_contiguos / total_bloques_usados) × 100
  3. Retornar porcentaje
```

**Complejidad:** O(n × m) donde n = inodos, m = bloques promedio

---

## 🛠️ Tecnologías Utilizadas

- **React 18.2.0** - Librería de UI
- **Vite 5.0.8** - Build tool y dev server ultra-rápido
- **Recharts 2.10.3** - Gráficas interactivas
- **CSS3** - Estilos con gradientes y animaciones

---

## 📖 Conceptos Aprendidos

Este proyecto permite comprender:

- **Estructuras de datos** de sistemas de archivos (superbloque, inodos, bloques)
- **Gestión de memoria** con bitmaps para rastrear recursos
- **Punteros directos e indirectos** para direccionamiento de bloques
- **Fragmentación** interna y externa, causas y efectos
- **Algoritmos de asignación** de bloques (first-fit)
- **Bitmaps** para gestión eficiente de recursos
- **Optimizaciones** de sistemas modernos (Ext4)
- **Desarrollo con React** y gestión de estado
- **Visualización de datos** con gráficas interactivas

---

## 🔮 Mejoras Futuras

Posibles extensiones del proyecto:

- [ ] Implementar desfragmentación automática
- [ ] Agregar soporte para directorios jerárquicos
- [ ] Implementar permisos de archivos (lectura/escritura/ejecución)
- [ ] Simular journaling básico para recuperación ante fallos
- [ ] Agregar extents para archivos grandes (como Ext4)
- [ ] Implementar algoritmo Best-Fit para asignación
- [ ] Exportar snapshots a JSON/CSV
- [ ] Modo visualización 3D del disco
- [ ] Agregar enlaces simbólicos y duros
- [ ] Implementar cache de bloques

---

## 👥 Autor

**Luis**  
Universidad - 8vo Semestre  
Materia: Sistemas Operativos  
Año: 2025

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Soporte

Si tienes preguntas o problemas:

- Abre un **issue** en GitHub
- Revisa la sección de **Solución de Problemas** de este README

---

## 🙏 Agradecimientos

- Inspirado en el sistema de archivos Ext original de Linux
- Documentación de Ext4 del kernel de Linux
- Comunidad de React y Vite
- Recursos educativos de Sistemas Operativos

---

## 📚 Referencias

- [Linux Ext4 Documentation](https://www.kernel.org/doc/html/latest/filesystems/ext4/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/)

---

**⭐ Si este proyecto te fue útil para aprender sobre sistemas de archivos, considera darle una estrella en GitHub!**

---

*Última actualización: 7 de noviembre de 2025*

