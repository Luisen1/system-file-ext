import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SistemaArchivosExt, Snapshot } from '../services/FileSystem';
import * as XLSX from 'xlsx-js-style';
import LimitationsAnalysis from './LimitationsAnalysis';

interface StressTestProps {
  fileSystem: SistemaArchivosExt;
}

interface Operacion {
  op: number;
  tipo: 'crear' | 'eliminar';
  nombre: string;
  tamano: number;
}

interface DatosFragmentacion {
  snapshot: string;
  operacion: number;
  fragmentacion: number;
  archivos: number;
  bloques: number;
}

/**
 * Tabla de operaciones para la prueba de estrés
 */
const operacionesPrueba: Operacion[] = [
  // Op 1-10: Crear archivo_01 a archivo_10, 5 KB c/u
  ...Array.from({ length: 10 }, (_, i) => ({
    op: i + 1,
    tipo: 'crear' as const,
    nombre: `archivo_${String(i + 1).padStart(2, '0')}`,
    tamano: 5
  })),
  // Op 11-20: Crear archivo_11 a archivo_20, 10 KB c/u
  ...Array.from({ length: 10 }, (_, i) => ({
    op: i + 11,
    tipo: 'crear' as const,
    nombre: `archivo_${String(i + 11).padStart(2, '0')}`,
    tamano: 10
  })),
  // Op 21-25: Eliminar archivo_02, 05, 08, 12, 15
  ...[2, 5, 8, 12, 15].map((num, i) => ({
    op: i + 21,
    tipo: 'eliminar' as const,
    nombre: `archivo_${String(num).padStart(2, '0')}`,
    tamano: 0
  })),
  // Op 26-35: Crear archivo_21 a archivo_30, 3 KB c/u
  ...Array.from({ length: 10 }, (_, i) => ({
    op: i + 26,
    tipo: 'crear' as const,
    nombre: `archivo_${String(i + 21).padStart(2, '0')}`,
    tamano: 3
  })),
  // Op 36-40: Eliminar archivo_03, 07, 11, 18, 22
  ...[3, 7, 11, 18, 22].map((num, i) => ({
    op: i + 36,
    tipo: 'eliminar' as const,
    nombre: `archivo_${String(num).padStart(2, '0')}`,
    tamano: 0
  })),
  // Op 41-50: Crear archivo_31 a archivo_40, 8 KB c/u
  ...Array.from({ length: 10 }, (_, i) => ({
    op: i + 41,
    tipo: 'crear' as const,
    nombre: `archivo_${String(i + 31).padStart(2, '0')}`,
    tamano: 8
  })),
  // Op 51-55: Eliminar archivo_01, 06, 13, 25, 32
  ...[1, 6, 13, 25, 32].map((num, i) => ({
    op: i + 51,
    tipo: 'eliminar' as const,
    nombre: `archivo_${String(num).padStart(2, '0')}`,
    tamano: 0
  })),
  // Op 56-70: Crear archivo_41 a archivo_55, 2 KB c/u
  ...Array.from({ length: 15 }, (_, i) => ({
    op: i + 56,
    tipo: 'crear' as const,
    nombre: `archivo_${String(i + 41).padStart(2, '0')}`,
    tamano: 2
  })),
  // Op 71-80: Eliminar 10 archivos aleatorios
  ...[4, 9, 10, 14, 16, 17, 19, 20, 23, 24].map((num, i) => ({
    op: i + 71,
    tipo: 'eliminar' as const,
    nombre: `archivo_${String(num).padStart(2, '0')}`,
    tamano: 0
  })),
  // Op 81-100: Crear archivo_56 a archivo_75, tamaños variables 1-15 KB
  ...Array.from({ length: 20 }, (_, i) => ({
    op: i + 81,
    tipo: 'crear' as const,
    nombre: `archivo_${String(i + 56).padStart(2, '0')}`,
    tamano: (i % 15) + 1
  }))
];

/**
 * Componente de Prueba de Estrés
 */
const StressTest: React.FC<StressTestProps> = ({ fileSystem }) => {
  const [ejecutando, setEjecutando] = useState<boolean>(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [operacionActual, setOperacionActual] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);

  const ejecutarPrueba = async () => {
    setEjecutando(true);
    setSnapshots([]);
    setLogs([]);
    setOperacionActual(0);

    // Resetear sistema
    fileSystem.resetear();
    
    const nuevosSnapshots: Snapshot[] = [];
    const nuevosLogs: string[] = [];

    // Ejecutar operaciones
    for (let i = 0; i < operacionesPrueba.length; i++) {
      const operacion = operacionesPrueba[i];
      setOperacionActual(i + 1);

      let resultado: number;
      let log: string;

      if (operacion.tipo === 'crear') {
        resultado = fileSystem.crear_archivo(operacion.nombre, operacion.tamano * 1024);
        log = `Op ${operacion.op}: CREAR "${operacion.nombre}" (${operacion.tamano} KB) - ${resultado !== -1 ? 'Éxito' : 'Fallo'}`;
      } else {
        const inodo = fileSystem.inodos.find(i => i.en_uso && i.nombre === operacion.nombre);
        if (inodo) {
          resultado = fileSystem.eliminar_archivo(inodo.id);
          log = `Op ${operacion.op}: ELIMINAR "${operacion.nombre}" - ${resultado === 0 ? 'Éxito' : 'Fallo'}`;
        } else {
          log = `Op ${operacion.op}: ELIMINAR "${operacion.nombre}" - No encontrado`;
        }
      }

      nuevosLogs.push(log);

      // Tomar snapshots en los momentos clave (op 20, 40, 60, 80, 100)
      if ([20, 40, 60, 80, 100].includes(operacion.op)) {
        const snapshot = fileSystem.crearSnapshot();
        nuevosSnapshots.push(snapshot);
      }

      // Pequeña pausa para visualización
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setSnapshots(nuevosSnapshots);
    setLogs(nuevosLogs);
    setEjecutando(false);
  };

  const datosFragmentacion = useMemo<DatosFragmentacion[]>(
    () => snapshots.map((s, i) => ({
      snapshot: `Snapshot ${i + 1}`,
      operacion: s.operacion,
      fragmentacion: s.fragmentacion,
      archivos: s.archivos_activos,
      bloques: s.bloques_ocupados
    })),
    [snapshots]
  );

  const analisisFragmentacion = useMemo(() => {
    if (snapshots.length === 0) return null;
    
    const maxFragmentacion = Math.max(...snapshots.map(s => s.fragmentacion));
    const snapshotMax = snapshots.find(s => s.fragmentacion === maxFragmentacion);
    const indexMax = snapshots.indexOf(snapshotMax!);
    
    return {
      maxFragmentacion,
      snapshotMax,
      indexMax
    };
  }, [snapshots]);

  const exportarExcel = () => {
    if (snapshots.length === 0) {
      alert('Primero debes ejecutar la prueba de estrés');
      return;
    }

    try {
      const wb = XLSX.utils.book_new();

      // Estilo para encabezados
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1ABC9C" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      // 1. HOJA: Tabla de Evolución del Sistema
      const datosTabla = [
        ['Snapshot', 'Operación', 'Archivos Activos', 'Bloques Ocupados', 'Fragmentación (%)', 'Inodos Libres', 'Bloques Libres']
      ];

      snapshots.forEach((s, i) => {
        datosTabla.push([
          String(i + 1),
          String(s.operacion),
          String(s.archivos_activos),
          String(s.bloques_ocupados),
          String(s.fragmentacion),
          String(s.inodos_libres),
          String(s.bloques_libres)
        ]);
      });

      const wsTabla = XLSX.utils.aoa_to_sheet(datosTabla);
      wsTabla['!cols'] = [
        { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 18 },
        { wch: 18 }, { wch: 15 }, { wch: 15 }
      ];

      // Aplicar estilos a los encabezados
      ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'].forEach(cell => {
        if (wsTabla[cell]) wsTabla[cell].s = headerStyle;
      });

      XLSX.utils.book_append_sheet(wb, wsTabla, 'Evolución del Sistema');

      // 3. HOJA: Datos para Gráficos (Formato Optimizado)
      const datosGrafico = [
        ['Snapshot', 'Operación', 'Fragmentación (%)', 'Archivos Activos', 'Bloques Ocupados']
      ];

      datosFragmentacion.forEach((dato) => {
        datosGrafico.push([
          String(dato.snapshot),
          String(dato.operacion),
          String(dato.fragmentacion),
          String(dato.archivos),
          String(dato.bloques)
        ]);
      });

      const wsGrafico = XLSX.utils.aoa_to_sheet(datosGrafico);
      wsGrafico['!cols'] = [
        { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 }
      ];

      const headerStyleOrange = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "FF8C42" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      ['A1', 'B1', 'C1', 'D1', 'E1'].forEach(cell => {
        if (wsGrafico[cell]) wsGrafico[cell].s = headerStyleOrange;
      });

      XLSX.utils.book_append_sheet(wb, wsGrafico, 'Datos para Gráficos');

      // 4. HOJA: Análisis Detallado
      if (analisisFragmentacion) {
        // Calcular métricas de tiempo
        const tiempoPromedio = snapshots.reduce((sum, s) => sum + s.tiempo_busqueda_ms, 0) / snapshots.length;
        const tiempoMaximo = Math.max(...snapshots.map(s => s.tiempo_busqueda_ms));
        const tiempoMinimo = Math.min(...snapshots.map(s => s.tiempo_busqueda_ms));
        const totalArchivosIndirectos = snapshots[snapshots.length - 1].archivos_con_indirecto;

        const datosAnalisis = [
          ['Métrica', 'Valor'],
          ['Fragmentación Máxima (%)', analisisFragmentacion.maxFragmentacion],
          ['Snapshot con Max Fragmentación', analisisFragmentacion.indexMax + 1],
          ['Operación del Pico', analisisFragmentacion.snapshotMax!.operacion],
          ['Archivos en ese momento', analisisFragmentacion.snapshotMax!.archivos_activos],
          ['Bloques ocupados', analisisFragmentacion.snapshotMax!.bloques_ocupados],
          ['Inodos libres', analisisFragmentacion.snapshotMax!.inodos_libres],
          ['Bloques libres', analisisFragmentacion.snapshotMax!.bloques_libres],
          [''],
          ['📊 ESTADÍSTICAS GENERALES'],
          ['Promedio Fragmentación (%)', (datosFragmentacion.reduce((sum, d) => sum + d.fragmentacion, 0) / datosFragmentacion.length).toFixed(2)],
          ['Promedio Archivos Activos', Math.round(datosFragmentacion.reduce((sum, d) => sum + d.archivos, 0) / datosFragmentacion.length)],
          ['Promedio Bloques Ocupados', Math.round(datosFragmentacion.reduce((sum, d) => sum + d.bloques, 0) / datosFragmentacion.length)],
          [''],
          ['⏱️ ANÁLISIS DE RENDIMIENTO'],
          ['Tiempo Promedio de Búsqueda (ms)', tiempoPromedio.toFixed(4)],
          ['Tiempo Máximo de Búsqueda (ms)', tiempoMaximo.toFixed(4)],
          ['Tiempo Mínimo de Búsqueda (ms)', tiempoMinimo.toFixed(4)],
          [''],
          ['📂 PUNTEROS INDIRECTOS'],
          ['Archivos con Puntero Indirecto', totalArchivosIndirectos],
          ['% Archivos con Indirecto', ((totalArchivosIndirectos / snapshots[snapshots.length - 1].archivos_activos) * 100).toFixed(1) + '%'],
          [''],
          ['⚠️ LIMITACIONES DEL SISTEMA'],
          ['Tamaño Máximo de Archivo (KB)', '268'],
          ['Número Máximo de Inodos', '32'],
          ['Bloques Totales Disponibles', '128'],
          ['Algoritmo de Asignación', 'First-Fit Lineal'],
          [''],
          ['💡 MEJORAS PROPUESTAS'],
          ['Algoritmo Sugerido', 'Best-Fit con Caché de Segmentos'],
          ['Mejora Esperada en Tiempo', '~90%'],
          ['Complejidad Actual', 'O(n) = O(128)'],
          ['Complejidad Propuesta', 'O(log k) ≈ O(3)']
        ];

        const wsAnalisis = XLSX.utils.aoa_to_sheet(datosAnalisis);
        wsAnalisis['!cols'] = [{ wch: 35 }, { wch: 20 }];

        const headerStyleGold = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "F39C12" } },
          alignment: { horizontal: "center", vertical: "center" }
        };

        if (wsAnalisis['A1']) wsAnalisis['A1'].s = headerStyleGold;
        if (wsAnalisis['B1']) wsAnalisis['B1'].s = headerStyleGold;

        // Resaltar valores clave
        if (wsAnalisis['B2']) {
          wsAnalisis['B2'].s = {
            font: { bold: true, sz: 14, color: { rgb: "E63946" } },
            alignment: { horizontal: "center" }
          };
        }

        XLSX.utils.book_append_sheet(wb, wsAnalisis, 'Análisis');
      }

      // 5. HOJA: Tiempos de Búsqueda
      const datosTiempos = [
        ['Snapshot', 'Operación', 'Tiempo Búsqueda (ms)', 'Bloques Ocupados', 'Fragmentación (%)', 'Archivos con Indirecto']
      ];

      snapshots.forEach((s, i) => {
        datosTiempos.push([
          String(i + 1),
          String(s.operacion),
          String(s.tiempo_busqueda_ms.toFixed(4)),
          String(s.bloques_ocupados),
          String(s.fragmentacion.toFixed(2)),
          String(s.archivos_con_indirecto)
        ]);
      });

      const wsTiempos = XLSX.utils.aoa_to_sheet(datosTiempos);
      wsTiempos['!cols'] = [
        { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 22 }
      ];

      const headerStylePurple = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "9B59B6" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      ['A1', 'B1', 'C1', 'D1', 'E1', 'F1'].forEach(cell => {
        if (wsTiempos[cell]) wsTiempos[cell].s = headerStylePurple;
      });

      XLSX.utils.book_append_sheet(wb, wsTiempos, 'Tiempos de Búsqueda');

      // 6. HOJA: Logs de Operaciones
      const datosLogs = [['N°', 'Log de Operación']];
      logs.slice(0, 100).forEach((log, i) => {
        datosLogs.push([String(i + 1), log]);
      });

      const wsLogs = XLSX.utils.aoa_to_sheet(datosLogs);
      wsLogs['!cols'] = [{ wch: 8 }, { wch: 85 }];

      const headerStyleBlue = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "3498DB" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      if (wsLogs['A1']) wsLogs['A1'].s = headerStyleBlue;
      if (wsLogs['B1']) wsLogs['B1'].s = headerStyleBlue;

      XLSX.utils.book_append_sheet(wb, wsLogs, 'Logs de Operaciones');

      // Generar y descargar el archivo
      XLSX.writeFile(wb, 'resultados_ext.xlsx');

      alert('✅ Archivo Excel generado con éxito!');
    } catch (error) {
      console.error('Error al generar Excel:', error);
      alert('❌ Error al generar el archivo Excel. Ver consola para detalles.');
    }
  };

  return (
    <div>
      <div className="card">
        <h3>Prueba de Estrés (100 Operaciones)</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <p>
            Esta prueba ejecuta una secuencia de 100 operaciones de creación y eliminación
            de archivos para evaluar el comportamiento del sistema bajo carga.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={ejecutarPrueba}
            className="btn btn-primary"
            disabled={ejecutando}
          >
            {ejecutando ? `Ejecutando... (${operacionActual}/100)` : 'Iniciar Prueba'}
          </button>

          {snapshots.length > 0 && (
            <button
              onClick={exportarExcel}
              className="btn btn-secondary"
              style={{ 
                background: '#1abc9c', 
                color: 'white',
                border: 'none'
              }}
            >
              📊 Exportar a Excel
            </button>
          )}
        </div>

        {ejecutando && (
          <div className="progress-bar" style={{ marginTop: '20px' }}>
            <div 
              className="progress-fill" 
              style={{ width: `${(operacionActual / 100) * 100}%` }}
            >
              {operacionActual}%
            </div>
          </div>
        )}
      </div>

      {snapshots.length > 0 && (
        <>
          {/* Tabla de Snapshots */}
          <div className="card">
            <h3>Tabla de Evolución del Sistema</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Snapshot</th>
                    <th>Op#</th>
                    <th>Archivos Activos</th>
                    <th>Bloques Ocupados</th>
                    <th>Fragmentación %</th>
                    <th>Inodos Libres</th>
                    <th>Bloques Libres</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((snapshot, i) => (
                    <tr key={i}>
                      <td><strong>Snapshot {i + 1}</strong></td>
                      <td>{snapshot.operacion}</td>
                      <td>{snapshot.archivos_activos}</td>
                      <td>{snapshot.bloques_ocupados}</td>
                      <td>
                        <span className={`badge ${snapshot.fragmentacion > 30 ? 'badge-warning' : 'badge-success'}`}>
                          {snapshot.fragmentacion}%
                        </span>
                      </td>
                      <td>{snapshot.inodos_libres}</td>
                      <td>{snapshot.bloques_libres}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gráfica de Fragmentación */}
          <div className="card">
            <h3>Evolución de la Fragmentación</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosFragmentacion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="snapshot" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="fragmentacion" 
                  stroke="#f5576c" 
                  strokeWidth={3}
                  name="Fragmentación (%)" 
                />
              </LineChart>
            </ResponsiveContainer>
            
            {analisisFragmentacion && (
              <div style={{ marginTop: '20px' }}>
                <h4>Análisis:</h4>
                <ul style={{ lineHeight: '1.8' }}>
                  <li>
                    <strong>Pico máximo:</strong> {analisisFragmentacion.maxFragmentacion}% en Snapshot {analisisFragmentacion.indexMax + 1} (Operación {analisisFragmentacion.snapshotMax!.operacion})
                  </li>
                  <li>
                    <strong>Razón:</strong> La fragmentación ocurre cuando se eliminan archivos 
                    y se crean nuevos que no pueden ocupar bloques contiguos, dejando "huecos" en el disco.
                  </li>
                  <li>
                    <strong>Momento crítico:</strong> Entre las operaciones 21-80, donde se alternan 
                    creaciones y eliminaciones, causando máxima fragmentación.
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Logs de Operaciones */}
          <div className="card">
            <h3>Registro de Operaciones</h3>
            <div style={{ 
              maxHeight: '400px', 
              overflowY: 'auto', 
              background: '#f8f9fa', 
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}>
              {logs.map((log, i) => (
                <div key={i} style={{ padding: '4px 0' }}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Análisis Completo de Limitaciones */}
          <LimitationsAnalysis snapshots={snapshots} />
        </>
      )}
    </div>
  );
};

export default StressTest;
