import React from 'react';

/**
 * Componente de Análisis de Limitaciones
 */
const Analysis: React.FC = () => {
  return (
    <div>
      <div className="card">
        <h3>a) Fragmentación Externa</h3>
        <p style={{ marginBottom: '15px' }}>
          La fragmentación externa ocurre cuando hay bloques libres en el disco pero no son
          contiguos, lo que impide la asignación eficiente de archivos grandes.
        </p>
        
        <h4>Análisis de resultados:</h4>
        <ul style={{ lineHeight: '1.8', color: '#555' }}>
          <li>
            <strong>Evolución:</strong> La fragmentación aumenta progresivamente a medida que
            se alternan operaciones de creación y eliminación de archivos.
          </li>
          <li>
            <strong>Pico máximo:</strong> Se alcanza típicamente después de múltiples ciclos
            de creación/eliminación (operaciones 40-80).
          </li>
          <li>
            <strong>Causa principal:</strong> Cuando se eliminan archivos, se liberan bloques
            en diferentes posiciones del disco. Al crear nuevos archivos, estos ocupan los
            bloques disponibles de manera no contigua.
          </li>
          <li>
            <strong>Impacto:</strong> Mayor tiempo de búsqueda de bloques libres y acceso
            no secuencial a datos, reduciendo el rendimiento del sistema.
          </li>
        </ul>
      </div>

      <div className="card">
        <h3>b) Eficiencia de Búsqueda</h3>
        <p style={{ marginBottom: '15px' }}>
          El algoritmo actual utiliza búsqueda lineal para encontrar bloques libres.
        </p>
        
        <h4>Análisis:</h4>
        <ul style={{ lineHeight: '1.8', color: '#555' }}>
          <li>
            <strong>Tiempo promedio actual:</strong> O(n) donde n es el número de bloques (128).
            En el peor caso, debe recorrer todos los bloques.
          </li>
          <li>
            <strong>Esquema ideal:</strong> Bloques contiguos organizados secuencialmente.
            Esto minimiza la fragmentación y optimiza el acceso a disco.
          </li>
          <li>
            <strong>Comparación:</strong> Con bloques contiguos, el tiempo de búsqueda sería
            O(1) usando un puntero al primer bloque libre. El sistema actual es O(n).
          </li>
        </ul>

        <h4>Propuesta de mejora:</h4>
        <ul style={{ lineHeight: '1.8', color: '#555' }}>
          <li>
            <strong>Bitmap indexado:</strong> Usar índices de bloques libres para búsqueda O(1)
          </li>
          <li>
            <strong>First-fit optimizado:</strong> Mantener puntero al último bloque asignado
          </li>
          <li>
            <strong>Best-fit:</strong> Buscar el grupo contiguo más pequeño que satisfaga la petición
          </li>
          <li>
            <strong>Buddy system:</strong> Agrupar bloques en potencias de 2 para asignación eficiente
          </li>
        </ul>
      </div>

      <div className="card">
        <h3>c) Limitaciones del Esquema de Punteros</h3>
        
        <h4>Tamaño máximo de archivo soportado:</h4>
        <div style={{ 
          background: '#f0f4ff', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px',
          borderLeft: '4px solid #667eea'
        }}>
          <p style={{ marginBottom: '10px' }}>
            <strong>Cálculo:</strong>
          </p>
          <ul style={{ lineHeight: '1.8' }}>
            <li>Punteros directos: 12 bloques × 1024 bytes = 12,288 bytes</li>
            <li>Puntero indirecto: 256 bloques × 1024 bytes = 262,144 bytes</li>
            <li><strong>Total: 268 bloques = 274,432 bytes (~268 KB)</strong></li>
          </ul>
        </div>

        <h4>Porcentaje de archivos que requirieron puntero indirecto:</h4>
        <p style={{ marginBottom: '15px' }}>
          En la prueba de estrés, los archivos mayores a 12 KB (12 bloques) requieren
          puntero indirecto. Esto representa aproximadamente el 25-30% de los archivos
          según la distribución de tamaños.
        </p>

        <h4>¿Qué pasaría si se intenta crear un archivo de 1 MB?</h4>
        <div style={{ 
          background: '#fff3cd', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px',
          borderLeft: '4px solid #ffc107'
        }}>
          <p><strong>Resultado: ERROR - Archivo excede el tamaño máximo</strong></p>
          <ul style={{ lineHeight: '1.8', marginTop: '10px' }}>
            <li>1 MB = 1,048,576 bytes</li>
            <li>Bloques necesarios: 1,048,576 / 1024 = 1,024 bloques</li>
            <li>Bloques disponibles en esquema: 268 bloques máximo</li>
            <li><strong>Déficit: 756 bloques (no se puede crear)</strong></li>
          </ul>
        </div>

        <h4>Soluciones posibles:</h4>
        <ul style={{ lineHeight: '1.8', color: '#555' }}>
          <li>
            <strong>Punteros doblemente indirectos:</strong> Un bloque de punteros que apunta
            a otros bloques de punteros (256 × 256 = 65,536 bloques adicionales)
          </li>
          <li>
            <strong>Punteros triplemente indirectos:</strong> Para archivos aún más grandes
            (256 × 256 × 256 = 16,777,216 bloques)
          </li>
          <li>
            <strong>Extents:</strong> Grupos contiguos de bloques especificados por
            (inicio, longitud), más eficiente para archivos grandes
          </li>
        </ul>
      </div>

      <div className="card">
        <h3>d) Comparación con Ext4 Moderno</h3>
        
        <h4>3 Diferencias principales:</h4>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            background: '#e8f5e9', 
            padding: '15px', 
            borderRadius: '8px',
            marginBottom: '15px',
            borderLeft: '4px solid #4caf50'
          }}>
            <h5>1. Extents vs Punteros de Bloques</h5>
            <ul style={{ lineHeight: '1.8' }}>
              <li><strong>Esta simulación:</strong> Usa punteros individuales a cada bloque</li>
              <li><strong>Ext4:</strong> Usa extents (rangos contiguos de bloques)</li>
              <li><strong>Ventaja Ext4:</strong> Reduce metadata y mejora rendimiento para archivos grandes</li>
            </ul>
          </div>

          <div style={{ 
            background: '#e8f5e9', 
            padding: '15px', 
            borderRadius: '8px',
            marginBottom: '15px',
            borderLeft: '4px solid #4caf50'
          }}>
            <h5>2. Journaling</h5>
            <ul style={{ lineHeight: '1.8' }}>
              <li><strong>Esta simulación:</strong> No tiene journaling (registro de transacciones)</li>
              <li><strong>Ext4:</strong> Mantiene un journal de cambios antes de aplicarlos</li>
              <li><strong>Ventaja Ext4:</strong> Recuperación rápida ante fallos, consistencia garantizada</li>
            </ul>
          </div>

          <div style={{ 
            background: '#e8f5e9', 
            padding: '15px', 
            borderRadius: '8px',
            borderLeft: '4px solid #4caf50'
          }}>
            <h5>3. Allocación Retrasada (Delayed Allocation)</h5>
            <ul style={{ lineHeight: '1.8' }}>
              <li><strong>Esta simulación:</strong> Asigna bloques inmediatamente al crear archivo</li>
              <li><strong>Ext4:</strong> Retrasa la asignación de bloques hasta el flush a disco</li>
              <li><strong>Ventaja Ext4:</strong> Optimiza asignación, reduce fragmentación</li>
            </ul>
          </div>
        </div>

        <h4>Optimizaciones de Ext4 no presentes en esta simulación:</h4>
        <ul style={{ lineHeight: '1.8', color: '#555' }}>
          <li>
            <strong>Multiblock allocation:</strong> Asigna múltiples bloques en una sola operación
          </li>
          <li>
            <strong>Preallocación persistente:</strong> Reserva espacio para archivos futuros
          </li>
          <li>
            <strong>Online defragmentation:</strong> Desfragmentación sin desmontar el sistema
          </li>
          <li>
            <strong>HTree indexing:</strong> Índices B-tree para directorios grandes
          </li>
          <li>
            <strong>Flex block groups:</strong> Agrupa metadata para mejor localidad
          </li>
          <li>
            <strong>Checksums:</strong> Verificación de integridad de metadata
          </li>
          <li>
            <strong>Timestamps nanosegundos:</strong> Mayor precisión temporal
          </li>
          <li>
            <strong>Soporte para archivos de hasta 16 TB:</strong> vs 268 KB en esta simulación
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Analysis;
