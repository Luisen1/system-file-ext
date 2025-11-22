# Sistema de Archivos Ext - Simulador Educativo

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Proyecto de Sistemas Operativos - 8vo Semestre**  
> Simulador educativo del sistema de archivos Ext implementado con React + TypeScript

---

## 📋 Descripción

Este proyecto es un **simulador educativo interactivo** del sistema de archivos **Ext** (Extended File System), desarrollado con **React 18**, **TypeScript** y **Vite**. Permite visualizar y comprender en tiempo real el funcionamiento de las estructuras de datos fundamentales: inodos, bloques de datos, punteros directos e indirectos, y la gestión de fragmentación.

### 🎯 Características Principales

- ✅ Implementación completa de estructuras Ext (superbloque, inodos, bloques)
- ✅ Operaciones CRUD (crear, eliminar, listar archivos)
- ✅ Visualización gráfica del disco en tiempo real
- ✅ Prueba de estrés automatizada con 100 operaciones
- ✅ **Exportación de resultados a Excel (XLSX)**
- ✅ Análisis de fragmentación y limitaciones del sistema
- ✅ Interfaz moderna con diseño minimalista
- ✅ Código optimizado con React hooks (useMemo, useCallback)
- ✅ TypeScript strict mode para mayor seguridad de tipos

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

- **Node.js** 16+ 
- **npm**, **yarn** o **pnpm**

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Luisen1/system-file-ext.git
cd system-file-ext
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:3000
```

5. **Compilar para producción**
```bash
npm run build
npm run preview
```

---

## 🎨 Paleta de Colores

El diseño utiliza un esquema de colores moderno y minimalista:

- **Turquesa (#1abc9c)**: Color principal, botones, headers
- **Naranja (#ff8c42)**: Progress bars, alertas, highlights
- **Dorado (#f39c12)**: Iconos de check, elementos destacados
- **Gris claro (#f7f7f7)**: Fondos sutiles
- **Negro (#1a1a1a)**: Títulos y texto principal
- **Gris medio (#666666)**: Texto secundario


---

## 📁 Estructura del Proyecto

```
system-file-ext/
├── src/
│   ├── components/              # Componentes React
│   │   ├── Statistics.tsx       # Estadísticas del sistema
│   │   ├── FileCreator.tsx      # Formulario crear archivos
│   │   ├── FileList.tsx         # Tabla de archivos
│   │   ├── DiskVisualization.tsx # Visualización bloques
│   │   ├── StressTest.tsx       # Prueba de estrés (100 ops)
│   │   ├── Analysis.tsx         # Análisis comparativo
│   │   └── EducationalInfo.tsx  # Teoría del sistema Ext
│   │
│   ├── services/                # Lógica del sistema
│   │   └── FileSystem.ts        # Sistema de archivos principal
│   │
│   ├── models/                  # Tipos e interfaces
│   │   └── structures.ts        # Superbloque, Inodo, Bloque
│   │
│   ├── config/                  # Configuración
│   │   └── constants.ts         # Constantes del sistema
│   │
│   ├── styles/                  # Estilos
│   │   └── App.css             # Estilos globales
│   │
│   ├── App.tsx                 # Componente principal
│   └── main.tsx                # Punto de entrada
│
├── index.html                  # HTML principal
├── package.json               # Dependencias
├── tsconfig.json              # Configuración TypeScript
├── vite.config.ts             # Configuración Vite
└── README.md                  # Documentación
```

---

## 🔧 Funcionalidades

### Operaciones del Sistema de Archivos

#### `crear_archivo(nombre: string, tamano_bytes: number)`
Crea un nuevo archivo en el sistema.

**Proceso:**
1. Validar nombre y tamaño
2. Buscar inodo libre
3. Calcular bloques necesarios: `ceil(tamano_bytes / 1024)`
4. Asignar bloques (directos e indirectos si es necesario)
5. Actualizar bitmaps y superbloque

**Límites:**
- Nombre: 32 caracteres máximo
- Tamaño: 268 KB máximo (268 bloques)
- Archivos: 32 simultáneos (límite de inodos)

#### `eliminar_archivo(inodo_id: number)`
Elimina un archivo y libera sus recursos.

**Proceso:**
1. Validar que el inodo existe
2. Liberar todos los bloques asignados
3. Liberar bloque indirecto si existe
4. Marcar inodo como libre
5. Actualizar estadísticas

#### `listar_archivos()`
Retorna información de todos los archivos activos.

**Información mostrada:**
- ID del inodo
- Nombre del archivo
- Tamaño (KB y bytes)
- Bloques asignados
- Estado de fragmentación
- Fecha de creación

#### `calcular_fragmentacion()`
Calcula el porcentaje de fragmentación del disco.

**Fórmula:**
```
Fragmentación = (bloques_no_contiguos / bloques_totales_usados) × 100
```

#### `mostrar_estado_disco()`
Visualiza gráficamente el estado de los 128 bloques del disco.

**Estados de bloques:**
- **Libre**: Disponible para asignar (gris claro)
- **Ocupado**: Contiene datos de archivo (turquesa)
- **Indirecto**: Bloque de punteros (naranja)

---

## 🧪 Prueba de Estrés

Ejecuta una secuencia automatizada de **100 operaciones** que incluye:

- **Operaciones 1-20**: Crear archivos pequeños (5-10 KB)
- **Operaciones 21-40**: Eliminar archivos intermedios
- **Operaciones 41-60**: Crear archivos medianos (3 KB)
- **Operaciones 61-80**: Más eliminaciones y creaciones
- **Operaciones 81-100**: Crear archivos variables (1-15 KB)

### Snapshots del Sistema

Se capturan 5 snapshots en operaciones clave: **20, 40, 60, 80, 100**

**Métricas registradas:**
- Número de archivos activos
- Bloques ocupados
- Porcentaje de fragmentación
- Inodos y bloques libres

### Gráfica de Fragmentación

La prueba genera una gráfica que muestra la evolución de la fragmentación a lo largo de las 100 operaciones, permitiendo identificar:
- Picos de fragmentación
- Momentos críticos del sistema
- Relación entre operaciones y fragmentación

### 📊 Exportación a Excel

Una vez ejecutada la prueba de estrés, puedes **exportar todos los resultados a Excel** con un solo clic:

**Archivo generado:** `resultados_ext.xlsx`

**Contenido del archivo:**
1. **Hoja "Evolución del Sistema"**: Tabla completa con los 5 snapshots
   - Snapshot, Operación, Archivos Activos, Bloques Ocupados
   - Fragmentación (%), Inodos Libres, Bloques Libres

2. **Hoja "Datos Fragmentación"**: Datos para gráficos
   - Snapshot, Operación, Fragmentación, Archivos, Bloques

3. **Hoja "Análisis"**: Métricas clave
   - Fragmentación máxima alcanzada
   - Snapshot donde ocurrió el pico
   - Estado del sistema en ese momento

4. **Hoja "Logs de Operaciones"**: Registro completo
   - Primeras 100 operaciones ejecutadas
   - Tipo de operación (crear/eliminar)
   - Resultado (éxito/fallo)

**Cómo usar:**
1. Ejecuta la prueba de estrés con el botón "Iniciar Prueba"
2. Espera a que termine (100 operaciones)
3. Haz clic en el botón "📊 Exportar a Excel"
4. El archivo `resultados_ext.xlsx` se descargará automáticamente

---

## 📊 Interfaz de Usuario

### Pestañas Principales

1. **Teoría**
   - Explicación del sistema Ext
   - Conceptos de inodos y bloques
   - Funcionamiento de punteros directos e indirectos
   - Limitaciones del sistema

2. **Operaciones**
   - Crear archivos nuevos
   - Ver lista de archivos activos
   - Eliminar archivos
   - Visualización del disco en tiempo real
   - Estadísticas del sistema

3. **Prueba de Estrés**
   - Ejecutar 100 operaciones automatizadas
   - Ver evolución del sistema en snapshots
   - Gráfica de fragmentación
   - Logs detallados de operaciones

4. **Análisis**
   - Fragmentación externa
   - Eficiencia de búsqueda
   - Limitaciones del esquema de punteros
   - Comparación con Ext4 moderno

### Componentes Visuales

- **Stat Cards**: Muestran métricas clave (inodos, bloques, fragmentación)
- **Progress Bars**: Visualizan porcentajes de uso
- **Grilla de Bloques**: 128 bloques del disco con código de colores
- **Tabla de Archivos**: Lista completa con información detallada
- **Gráfica de Línea**: Evolución de fragmentación (Recharts)

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **React** | 18.2.0 | Framework UI |
| **TypeScript** | 5.3.3 | Tipado estático |
| **Vite** | 5.0.8 | Build tool y dev server |
| **Recharts** | 2.10.3 | Gráficas interactivas |
| **XLSX** | 0.18.5 | Exportación a Excel |
| **CSS3** | - | Estilos personalizados |

### Optimizaciones Aplicadas

- **useMemo**: Cálculos memoizados para evitar re-renders
- **useCallback**: Funciones memoizadas para optimizar performance
- **Functional Programming**: map, filter, reduce, findIndex
- **Constantes centralizadas**: Evita magic numbers
- **TypeScript strict mode**: Seguridad de tipos

---

## 💡 Conceptos Aprendidos

Este proyecto permite comprender:

✅ **Estructuras de datos** de sistemas de archivos  
✅ **Gestión de memoria** con bitmaps  
✅ **Punteros directos e indirectos** para direccionamiento  
✅ **Fragmentación** interna y externa  
✅ **Algoritmos de asignación** de bloques  
✅ **Optimizaciones** de sistemas modernos (Ext4)  
✅ **Desarrollo con React** y TypeScript  
✅ **Visualización de datos** interactiva  
✅ **Performance optimization** con React hooks

---

## 🔮 Mejoras Futuras

Posibles extensiones del proyecto:

- [ ] Implementar desfragmentación automática
- [ ] Soporte para directorios jerárquicos
- [ ] Sistema de permisos (lectura/escritura/ejecución)
- [ ] Simulación de journaling para recuperación
- [ ] Algoritmo Best-Fit para asignación optimizada
- [ ] Exportar snapshots a JSON/CSV
- [ ] Modo oscuro (dark mode)
- [ ] Enlaces simbólicos y duros
- [ ] Cache de bloques
- [ ] Animaciones de transición entre estados

---

## 👤 Autor

**[Luisen Hernandez](https://github.com/Luisen1)**  
8vo Semestre - Sistemas Operativos  
Universidad Pedagogica y Tecnologica de Colombia (UPTC)
Noviembre 2025

[![GitHub](https://img.shields.io/badge/GitHub-Luisen1-181717?logo=github)](https://github.com/Luisen1)



## 📚 Referencias

- [Linux Ext4 Documentation](https://www.kernel.org/doc/html/latest/filesystems/ext4/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/)

---

⭐ **Si este proyecto te fue útil, considera darle una estrella en GitHub**

---

*Última actualización: 21 de noviembre de 2025*