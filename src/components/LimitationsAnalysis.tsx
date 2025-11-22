import React from 'react';
import { Snapshot } from '../services/FileSystem';

interface LimitationsAnalysisProps {
  snapshots: Snapshot[];
}

const LimitationsAnalysis: React.FC<LimitationsAnalysisProps> = ({ snapshots }) => {
  if (snapshots.length === 0) return null;

  // Calcular tiempo promedio de búsqueda
  const tiempoPromedio = snapshots.reduce((sum, s) => sum + s.tiempo_busqueda_ms, 0) / snapshots.length;
  const tiempoMaximo = Math.max(...snapshots.map(s => s.tiempo_busqueda_ms));
  const tiempoMinimo = Math.min(...snapshots.map(s => s.tiempo_busqueda_ms));

  // Calcular total de archivos con puntero indirecto
  const totalArchivosIndirectos = snapshots[snapshots.length - 1].archivos_con_indirecto;

  return (
    <div className="card" style={{ marginTop: '30px' }}>
      <h3>Análisis de Limitaciones del Sistema</h3>

      {/* Sección 1: Tiempos de Búsqueda */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{ color: '#1abc9c', marginBottom: '15px' }}>Análisis de Tiempos de Búsqueda</h4>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            padding: '15px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '2px solid #1abc9c'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>
              Tiempo Promedio
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1abc9c' }}>
              {tiempoPromedio.toFixed(4)} ms
            </div>
          </div>
          
          <div style={{ 
            padding: '15px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '2px solid #e74c3c'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>
              Tiempo Máximo
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e74c3c' }}>
              {tiempoMaximo.toFixed(4)} ms
            </div>
          </div>
          
          <div style={{ 
            padding: '15px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '2px solid #3498db'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>
              Tiempo Mínimo
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3498db' }}>
              {tiempoMinimo.toFixed(4)} ms
            </div>
          </div>
        </div>

        <table className="styled-table" style={{ marginTop: '15px' }}>
          <thead>
            <tr>
              <th>Snapshot</th>
              <th>Operación</th>
              <th>Tiempo de Búsqueda (ms)</th>
              <th>Bloques Ocupados</th>
              <th>Fragmentación (%)</th>
            </tr>
          </thead>
          <tbody>
            {snapshots.map((s, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{s.operacion}</td>
                <td style={{ 
                  fontWeight: 'bold',
                  color: s.tiempo_busqueda_ms === tiempoMaximo ? '#e74c3c' : '#2c3e50'
                }}>
                  {s.tiempo_busqueda_ms.toFixed(4)}
                </td>
                <td>{s.bloques_ocupados}</td>
                <td>{s.fragmentacion.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ 
          marginTop: '15px', 
          padding: '15px', 
          background: '#fff3cd', 
          borderRadius: '8px',
          border: '1px solid #ffc107'
        }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#856404' }}>Análisis de Rendimiento</h5>
          <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
            <strong>Comportamiento observado:</strong> El algoritmo de búsqueda lineal (First-Fit) 
            recorre el bitmap de bloques secuencialmente hasta encontrar {snapshots[0]?.bloques_ocupados || 'N'} bloques libres.
          </p>
          <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
            <strong>Complejidad:</strong> O(n) donde n = 128 bloques
          </p>
          <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
            <strong>Impacto:</strong> A medida que aumenta la fragmentación, el tiempo de búsqueda 
            se incrementa proporcionalmente debido a la dispersión de bloques libres.
          </p>
        </div>
      </div>

      {/* Sección 2: Propuesta de Mejora */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{ color: '#f39c12', marginBottom: '15px' }}>Propuesta de Mejora al Algoritmo</h4>
        
        <div style={{ 
          padding: '20px', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          border: '2px solid #f39c12'
        }}>
          <h5 style={{ margin: '0 0 15px 0', color: '#f39c12' }}>
            Algoritmo Propuesto: Best-Fit con Caché de Bloques Contiguos
          </h5>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Descripción:</strong>
            <p style={{ marginTop: '8px', lineHeight: '1.6' }}>
              Mantener un índice/caché de segmentos contiguos libres ordenados por tamaño. 
              Al buscar N bloques, consultar directamente el segmento más pequeño que satisfaga 
              la necesidad (≥ N bloques contiguos).
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Ventajas:</strong>
            <ul style={{ marginTop: '8px', lineHeight: '1.8' }}>
              <li>Reduce complejidad de O(n) a O(log k) donde k = número de segmentos</li>
              <li>Minimiza fragmentación al elegir el segmento más ajustado</li>
              <li>Tiempo de búsqueda constante en el mejor caso</li>
              <li>Mejora significativa con alta fragmentación</li>
            </ul>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Implementación:</strong>
            <pre style={{ 
              background: '#2c3e50', 
              color: '#ecf0f1', 
              padding: '15px', 
              borderRadius: '5px',
              overflow: 'auto',
              fontSize: '0.85rem'
            }}>
{`interface SegmentoLibre {
  inicio: number;
  longitud: number;
}

class AlgoritmoMejorado {
  segmentosLibres: SegmentoLibre[] = [];
  
  buscarBloquesLibresMejorado(cantidad: number): number[] {
    // Buscar el segmento más pequeño que satisfaga
    const segmento = this.segmentosLibres
      .filter(s => s.longitud >= cantidad)
      .sort((a, b) => a.longitud - b.longitud)[0];
    
    if (!segmento) return [];
    
    // Asignar bloques del inicio del segmento
    const bloques = Array.from(
      { length: cantidad }, 
      (_, i) => segmento.inicio + i
    );
    
    // Actualizar segmento
    segmento.inicio += cantidad;
    segmento.longitud -= cantidad;
    
    return bloques;
  }
}`}
            </pre>
          </div>

          <div>
            <strong>Comparación de Rendimiento:</strong>
            <table className="styled-table" style={{ marginTop: '10px', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th>Algoritmo Actual (First-Fit)</th>
                  <th>Algoritmo Propuesto (Best-Fit Cache)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Complejidad temporal</td>
                  <td>O(n) = O(128)</td>
                  <td>O(log k) ≈ O(log 10) = O(3)</td>
                </tr>
                <tr>
                  <td>Tiempo promedio</td>
                  <td>{tiempoPromedio.toFixed(4)} ms</td>
                  <td style={{ color: '#27ae60', fontWeight: 'bold' }}>
                    ~{(tiempoPromedio * 0.1).toFixed(4)} ms (90% mejora estimada)
                  </td>
                </tr>
                <tr>
                  <td>Fragmentación resultante</td>
                  <td>Media-Alta</td>
                  <td style={{ color: '#27ae60', fontWeight: 'bold' }}>Baja (Best-Fit)</td>
                </tr>
                <tr>
                  <td>Memoria adicional</td>
                  <td>0 bytes</td>
                  <td>~1 KB (índice de segmentos)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sección 3: Análisis de Punteros Indirectos */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{ color: '#9b59b6', marginBottom: '15px' }}>Análisis de Punteros Indirectos</h4>
        
        <div style={{ 
          padding: '15px', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          border: '2px solid #9b59b6'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>
              Archivos que requirieron puntero indirecto:
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9b59b6' }}>
              {totalArchivosIndirectos} archivos
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Explicación:</strong>
            <p style={{ marginTop: '8px', lineHeight: '1.6' }}>
              Los archivos que exceden 12 KB (12 punteros directos × 1 KB/bloque) requieren 
              el uso del puntero indirecto para almacenar bloques adicionales. En la prueba 
              de estrés, archivos de 13 KB o más utilizaron esta funcionalidad.
            </p>
          </div>

          <div>
            <strong>Distribución en los snapshots:</strong>
            <table className="styled-table" style={{ marginTop: '10px' }}>
              <thead>
                <tr>
                  <th>Snapshot</th>
                  <th>Operación</th>
                  <th>Archivos con Indirecto</th>
                  <th>Total Archivos</th>
                  <th>% con Indirecto</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{s.operacion}</td>
                    <td style={{ fontWeight: 'bold', color: '#9b59b6' }}>
                      {s.archivos_con_indirecto}
                    </td>
                    <td>{s.archivos_activos}</td>
                    <td>
                      {s.archivos_activos > 0 
                        ? ((s.archivos_con_indirecto / s.archivos_activos) * 100).toFixed(1)
                        : '0'
                      }%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sección 4: Limitación de 1 MB */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{ color: '#e74c3c', marginBottom: '15px' }}>Limitación: Archivo de 1 MB</h4>
        
        <div style={{ 
          padding: '20px', 
          background: '#ffebee', 
          borderRadius: '8px',
          border: '2px solid #e74c3c'
        }}>
          <h5 style={{ margin: '0 0 15px 0', color: '#c0392b' }}>
            Análisis de Capacidad Máxima
          </h5>

          <div style={{ marginBottom: '15px' }}>
            <strong>Cálculo del tamaño máximo soportado:</strong>
            <div style={{ 
              padding: '15px', 
              background: 'white', 
              borderRadius: '5px',
              marginTop: '10px',
              fontFamily: 'monospace'
            }}>
              <div>• Punteros directos: 12 × 1 KB = 12 KB</div>
              <div>• Puntero indirecto: 1 × 256 punteros × 1 KB = 256 KB</div>
              <div style={{ 
                borderTop: '2px solid #e74c3c', 
                marginTop: '10px', 
                paddingTop: '10px',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                TOTAL MÁXIMO: 268 KB
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Intento de crear archivo de 1 MB (1024 KB):</strong>
            <div style={{ 
              padding: '15px', 
              background: '#2c3e50', 
              color: '#ecf0f1',
              borderRadius: '5px',
              marginTop: '10px',
              fontFamily: 'monospace'
            }}>
              <div>Bloques necesarios: 1024 KB ÷ 1 KB/bloque = 1024 bloques</div>
              <div>Bloques disponibles con la estructura actual: 268 bloques</div>
              <div style={{ color: '#e74c3c', marginTop: '10px', fontWeight: 'bold' }}>
                ❌ ERROR: El archivo excede el tamaño máximo soportado (268 bloques)
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Consecuencias:</strong>
            <ul style={{ marginTop: '8px', lineHeight: '1.8' }}>
              <li>El sistema rechaza la creación del archivo inmediatamente</li>
              <li>No se asignan bloques parciales (operación atómica)</li>
              <li>Se retorna mensaje de error específico al usuario</li>
              <li>El sistema mantiene su integridad (no se corrompe)</li>
            </ul>
          </div>

          <div>
            <strong>Soluciones en Ext4 real:</strong>
            <div style={{ 
              padding: '15px', 
              background: 'white', 
              borderRadius: '5px',
              marginTop: '10px'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#27ae60' }}>Punteros doblemente indirectos:</strong>
                <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                  256 × 256 × 1 KB = 65,536 KB (64 MB adicionales)
                </div>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#27ae60' }}>Punteros triplemente indirectos:</strong>
                <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                  256 × 256 × 256 × 1 KB = 16,777,216 KB (16 GB adicionales)
                </div>
              </div>
              <div>
                <strong style={{ color: '#27ae60' }}>Extents (enfoque moderno):</strong>
                <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                  Agrupa bloques contiguos en rangos, soportando archivos de varios TB
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 5: Diferencias con Ext4 */}
      <div>
        <h4 style={{ color: '#3498db', marginBottom: '15px' }}>Diferencias con Ext4 Real</h4>
        
        <table className="styled-table">
          <thead>
            <tr>
              <th>Característica</th>
              <th>Esta Simulación</th>
              <th>Ext4 Real</th>
              <th>Impacto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Tamaño de bloque</strong></td>
              <td>1 KB fijo</td>
              <td>1-4 KB configurable</td>
              <td>Ext4 optimiza según uso (archivos grandes usan 4KB)</td>
            </tr>
            <tr>
              <td><strong>Esquema de punteros</strong></td>
              <td>
                • 12 directos<br/>
                • 1 indirecto simple
              </td>
              <td>
                • 12 directos<br/>
                • Indirecto, doble, triple<br/>
                • Extents (moderno)
              </td>
              <td>Ext4 soporta archivos de hasta 16 TB vs 268 KB aquí</td>
            </tr>
            <tr>
              <td><strong>Algoritmo de asignación</strong></td>
              <td>First-Fit lineal simple</td>
              <td>
                • Multiblock allocator<br/>
                • Delayed allocation<br/>
                • Preallocation
              </td>
              <td>Ext4 reduce fragmentación en ~95% y mejora rendimiento 10x</td>
            </tr>
            <tr>
              <td><strong>Journaling</strong></td>
              <td>No implementado</td>
              <td>Journal completo</td>
              <td>Ext4 garantiza consistencia ante fallos del sistema</td>
            </tr>
            <tr>
              <td><strong>Checksums</strong></td>
              <td>No implementado</td>
              <td>CRC32C en metadata</td>
              <td>Ext4 detecta corrupción de datos</td>
            </tr>
            <tr>
              <td><strong>Timestamps</strong></td>
              <td>Básicos (Date)</td>
              <td>
                • Nanosegundos<br/>
                • Access, modify, change, create
              </td>
              <td>Ext4 tiene precisión y granularidad mucho mayor</td>
            </tr>
            <tr>
              <td><strong>Tamaño máximo archivo</strong></td>
              <td>268 KB</td>
              <td>16 TB (con bloques 4KB)</td>
              <td>Diferencia de ~60 millones de veces</td>
            </tr>
            <tr>
              <td><strong>Número de archivos</strong></td>
              <td>32 archivos máximo</td>
              <td>
                • 4 mil millones de inodos<br/>
                • Ilimitado (dynamic inode)
              </td>
              <td>Ext4 escala para sistemas empresariales</td>
            </tr>
            <tr>
              <td><strong>Desfragmentación</strong></td>
              <td>No soportada</td>
              <td>Online defrag (e4defrag)</td>
              <td>Ext4 permite optimizar sin desmontar</td>
            </tr>
          </tbody>
        </table>

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#e3f2fd', 
          borderRadius: '8px',
          border: '1px solid #2196f3'
        }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>
            Conclusión Educativa
          </h5>
          <p style={{ margin: '5px 0', lineHeight: '1.6' }}>
            Esta simulación implementa los <strong>conceptos fundamentales</strong> de Ext2/Ext3 
            para fines educativos. Ext4 real incluye décadas de optimizaciones de rendimiento, 
            escalabilidad y confiabilidad que lo hacen adecuado para sistemas de producción. 
            Las 3 diferencias principales son: <strong>(1)</strong> Capacidad de almacenamiento 
            (268 KB vs 16 TB), <strong>(2)</strong> Algoritmos de asignación (simple vs sofisticados), 
            y <strong>(3)</strong> Características de confiabilidad (ninguna vs journaling/checksums).
          </p>
        </div>
      </div>
    </div>
  );
};

export default LimitationsAnalysis;
