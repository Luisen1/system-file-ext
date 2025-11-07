import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SistemaArchivosExt, Snapshot } from '../services/FileSystem';

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
        log = `Op ${operacion.op}: CREAR "${operacion.nombre}" (${operacion.tamano} KB) - ${resultado !== -1 ? '✓ Éxito' : '✗ Fallo'}`;
      } else {
        // Buscar el inodo del archivo a eliminar
        const inodo = fileSystem.inodos.find(i => i.en_uso && i.nombre === operacion.nombre);
        if (inodo) {
          resultado = fileSystem.eliminar_archivo(inodo.id);
          log = `Op ${operacion.op}: ELIMINAR "${operacion.nombre}" - ${resultado === 0 ? '✓ Éxito' : '✗ Fallo'}`;
        } else {
          log = `Op ${operacion.op}: ELIMINAR "${operacion.nombre}" - ✗ No encontrado`;
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

  // Preparar datos para la gráfica de fragmentación
  const datosFragmentacion: DatosFragmentacion[] = snapshots.map((s, i) => ({
    snapshot: `Snapshot ${i + 1}`,
    operacion: s.operacion,
    fragmentacion: s.fragmentacion,
    archivos: s.archivos_activos,
    bloques: s.bloques_ocupados
  }));

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

        <button
          onClick={ejecutarPrueba}
          className="btn btn-primary"
          disabled={ejecutando}
        >
          {ejecutando ? `⏳ Ejecutando... (${operacionActual}/100)` : '▶️ Iniciar Prueba'}
        </button>

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
            
            <div style={{ marginTop: '20px' }}>
              <h4>Análisis:</h4>
              {(() => {
                const maxFragmentacion = Math.max(...snapshots.map(s => s.fragmentacion));
                const snapshotMax = snapshots.find(s => s.fragmentacion === maxFragmentacion);
                const indexMax = snapshots.indexOf(snapshotMax!);
                
                return (
                  <ul style={{ lineHeight: '1.8' }}>
                    <li>
                      <strong>Pico máximo:</strong> {maxFragmentacion}% en Snapshot {indexMax + 1} (Operación {snapshotMax!.operacion})
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
                );
              })()}
            </div>
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
        </>
      )}
    </div>
  );
};

export default StressTest;
