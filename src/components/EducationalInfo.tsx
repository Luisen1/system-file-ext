import React, { useState } from 'react';

/**
 * Componente educativo que explica el funcionamiento del sistema de archivos Ext
 * Muestra información teórica y práctica para entender mejor el sistema
 */
const EducationalInfo: React.FC = () => {
  // Estado para controlar qué sección está expandida
  const [expandedSection, setExpandedSection] = useState<string | null>('intro');

  /**
   * Alterna la visibilidad de una sección
   * @param section - Identificador de la sección a expandir/colapsar
   */
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Introducción al Sistema Ext */}
      <div className="card">
        <div 
          onClick={() => toggleSection('intro')}
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h3>¿Qué es el Sistema de Archivos Ext?</h3>
          <span style={{ fontSize: '1.5rem', color: '#0f4c5c' }}>
            {expandedSection === 'intro' ? '−' : '+'}
          </span>
        </div>
        
        {expandedSection === 'intro' && (
          <div style={{ marginTop: '16px', lineHeight: '1.7', color: '#4a4a4a' }}>
            <p style={{ marginBottom: '14px' }}>
              El sistema Extended, o Ext para abreviar, es básicamente la familia de sistemas de archivos 
              que se creó específicamente para Linux. Lo interesante aquí es cómo separa la información 
              del archivo (su tamaño, cuándo se creó, esas cosas) del contenido real. Esa separación se 
              hace a través de algo llamado inodos, que es lo que permite manejar el almacenamiento de 
              manera bastante eficiente.
            </p>
            
            <div style={{ background: '#f5f9fa', padding: '16px', borderRadius: '6px', marginBottom: '14px' }}>
              <h4 style={{ color: '#0f4c5c', marginBottom: '10px', fontSize: '1rem' }}>
                Bloques: la unidad básica de todo
              </h4>
              <p style={{ fontSize: '0.92rem', marginBottom: '10px' }}>
                Todo en Ext se guarda en bloques de tamaño fijo. Puedes encontrar bloques de 1 KB, 2 KB 
                o 4 KB dependiendo de la configuración. Aquí en el simulador trabajamos con bloques de 1 KB, 
                o sea 1024 bytes exactos.
              </p>
              <p style={{ fontSize: '0.92rem', margin: '0', padding: '10px', background: '#fff9e6', borderRadius: '4px' }}>
                <strong>Un detalle que vale la pena tener en mente:</strong> Los bloques son lo mínimo que se 
                puede asignar. Si tienes un archivo pequeñito de 100 bytes, igual va a ocupar un bloque entero 
                de 1 KB. Esos 924 bytes que sobran simplemente se pierden. Suena ineficiente, pero es el 
                precio que se paga por tener una estructura simple y predecible.
              </p>
            </div>

            <div style={{ background: '#e8f5e9', padding: '16px', borderRadius: '6px', marginBottom: '14px' }}>
              <h4 style={{ color: '#2e7d32', marginBottom: '10px', fontSize: '1rem' }}>
                Conceptos que necesitas conocer
              </h4>
              <ul style={{ marginLeft: '20px', lineHeight: '1.8', fontSize: '0.92rem' }}>
                <li>
                  <strong>Inodo:</strong> Piensa en esto como una ficha de datos del archivo. Guarda el tamaño, 
                  cuándo se modificó, y los punteros hacia los bloques donde está el contenido real. Eso sí, 
                  no guarda el nombre del archivo ni los datos en sí.
                </li>
                <li>
                  <strong>Bloque de Datos:</strong> Cada pedazo de 1 KB donde se almacena el contenido verdadero 
                  de tu archivo.
                </li>
                <li>
                  <strong>Punteros Directos:</strong> Son referencias que apuntan directamente a los bloques de 
                  datos. En Ext puedes tener hasta 12 de estos para los primeros bloques del archivo.
                </li>
                <li>
                  <strong>Puntero Indirecto:</strong> Cuando necesitas más espacio, este puntero apunta a un bloque 
                  especial que tiene aún más punteros. Como cada dirección ocupa 4 bytes y un bloque tiene 1024 bytes, 
                  puedes meter 256 punteros adicionales ahí (1024 dividido 4).
                </li>
              </ul>
            </div>

            <div style={{ background: '#e3f2fd', padding: '14px', borderRadius: '6px' }}>
              <h4 style={{ color: '#1565c0', marginBottom: '8px', fontSize: '0.95rem' }}>
                Configuración de este simulador
              </h4>
              <p style={{ fontSize: '0.9rem', margin: '0' }}>
                Para mantener las cosas simples, este simulador usa 32 inodos, 128 bloques de 1 KB cada uno, 
                y el esquema clásico de 12 punteros directos más 1 indirecto simple.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Cómo funciona la asignación de bloques */}
      <div className="card">
        <div 
          onClick={() => toggleSection('allocation')}
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h3>¿Cómo se asignan los bloques a un archivo?</h3>
          <span style={{ fontSize: '1.5rem', color: '#0f4c5c' }}>
            {expandedSection === 'allocation' ? '−' : '+'}
          </span>
        </div>
        
        {expandedSection === 'allocation' && (
          <div style={{ marginTop: '16px', lineHeight: '1.7', color: '#4a4a4a' }}>
            <p style={{ marginBottom: '14px' }}>
              Cuando vas a crear un archivo, el sistema tiene que hacer varios pasos en secuencia. 
              Primero busca un inodo libre, luego calcula cuántos bloques necesita, y finalmente 
              actualiza todas las estructuras internas para que todo quede registrado.
            </p>

            <div style={{ background: '#fff9e6', padding: '14px', borderRadius: '6px', marginBottom: '14px', borderLeft: '3px solid #ffd166' }}>
              <h4 style={{ color: '#8b6914', marginBottom: '8px', fontSize: '0.95rem' }}>
                Paso 1: Encontrar un inodo disponible
              </h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                El sistema usa un bitmap de inodos. Cada bit representa el estado: 
                <code style={{ background: '#f4f4f4', padding: '2px 6px', borderRadius: '3px' }}>0 = libre</code> y 
                <code style={{ background: '#f4f4f4', padding: '2px 6px', borderRadius: '3px' }}>1 = ocupado</code>.
              </p>
              <p style={{ fontSize: '0.88rem', margin: '0', color: '#6a5000' }}>
                Esta forma de representarlo es súper compacta y hace que buscar espacio disponible 
                sea mucho más rápido que recorrer toda una lista.
              </p>
            </div>

            <div style={{ background: '#e8f5e9', padding: '14px', borderRadius: '6px', marginBottom: '14px', borderLeft: '3px solid #4caf50' }}>
              <h4 style={{ color: '#2e7d32', marginBottom: '8px', fontSize: '0.95rem' }}>
                Paso 2: Calcular cuántos bloques hacen falta
              </h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
                La fórmula es directa: <code style={{ background: '#d4edda', padding: '3px 8px', borderRadius: '3px', fontWeight: 'bold' }}>
                bloques_necesarios = ⌈tamaño_bytes ÷ 1024⌉</code>
              </p>
              <p style={{ fontSize: '0.88rem', margin: '0' }}>
                <strong>Un caso concreto:</strong> Si tienes 2500 bytes, necesitas 3 bloques completos 
                porque 2500 dividido 1024 da 2.44, y redondeando hacia arriba son 3. El último bloque 
                solo usa 452 bytes, dejando 572 bytes sin usar. Eso es fragmentación interna.
              </p>
            </div>

            <div style={{ background: '#ffebee', padding: '14px', borderRadius: '6px', marginBottom: '14px', borderLeft: '3px solid #e63946' }}>
              <h4 style={{ color: '#c62828', marginBottom: '8px', fontSize: '0.95rem' }}>
                Paso 3: Decidir qué bloques asignar
              </h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
                Hay varias estrategias para esto:
              </p>
              <ul style={{ marginLeft: '20px', fontSize: '0.88rem', lineHeight: '1.6' }}>
                <li><strong>First Fit:</strong> Agarra los primeros bloques que encuentre libres. Es lo que usa este simulador.</li>
                <li><strong>Best Fit:</strong> Busca el hueco más pequeño que alcance justo para el archivo.</li>
                <li><strong>Bloques contiguos:</strong> Trata de asignar bloques que estén uno al lado del otro para que la lectura sea más rápida.</li>
              </ul>
              <p style={{ fontSize: '0.88rem', margin: '8px 0 0 0', color: '#8a2c2c' }}>
                La elección de estrategia afecta bastante la fragmentación que vas a tener después.
              </p>
            </div>

            <div style={{ background: '#e3f2fd', padding: '16px', borderRadius: '6px' }}>
              <h4 style={{ color: '#1565c0', marginBottom: '10px', fontSize: '0.95rem' }}>
                Paso 4: Punteros directos contra indirectos
              </h4>
              <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #d0e8f2' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>Primeros 12 KB</td>
                    <td style={{ padding: '8px' }}>Usan punteros directos. Acceso rápido, una sola lectura.</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #d0e8f2' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>De 13 KB a 268 KB</td>
                    <td style={{ padding: '8px' }}>Usan el puntero indirecto. Dos lecturas: primero el bloque de punteros, después el de datos.</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>Tamaño máximo</td>
                    <td style={{ padding: '8px' }}>12 KB directos más 256 KB del indirecto = 268 KB total</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: '0.85rem', marginTop: '10px', padding: '8px', background: 'rgba(21, 101, 192, 0.05)', borderRadius: '4px', margin: '10px 0 0 0' }}>
                Cuando un archivo pasa de los 12 KB, tiene que usar ese puntero indirecto, 
                lo que añade una capa extra. No es dramático, pero sí ralentiza un poco las cosas.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fragmentación */}
      <div className="card">
        <div 
          onClick={() => toggleSection('fragmentation')}
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h3>¿Qué es la fragmentación y por qué importa?</h3>
          <span style={{ fontSize: '1.5rem', color: '#0f4c5c' }}>
            {expandedSection === 'fragmentation' ? '−' : '+'}
          </span>
        </div>
        
        {expandedSection === 'fragmentation' && (
          <div style={{ marginTop: '16px', lineHeight: '1.7', color: '#4a4a4a' }}>
            <p style={{ marginBottom: '14px' }}>
              La fragmentación es probablemente uno de los dolores de cabeza más grandes cuando hablamos 
              de almacenamiento. Pasa cuando los bloques de un archivo quedan desperdigados por el disco 
              en lugar de estar todos juntitos, y eso afecta bastante el rendimiento.
            </p>

            <div style={{ background: '#fff3e0', padding: '16px', borderRadius: '6px', marginBottom: '14px' }}>
              <h4 style={{ color: '#e65100', marginBottom: '10px', fontSize: '1rem' }}>
                Hay dos tipos de fragmentación
              </h4>
              
              <div style={{ marginBottom: '14px', padding: '12px', background: '#fff9f0', borderRadius: '4px', borderLeft: '3px solid #ff9800' }}>
                <strong style={{ color: '#0f4c5c', fontSize: '0.95rem' }}>Fragmentación Interna</strong>
                <p style={{ fontSize: '0.9rem', marginTop: '6px', marginBottom: '8px' }}>
                  Esta pasa cuando un archivo no llena completamente el último bloque que le asignaron. 
                  Básicamente es espacio que se desperdicia dentro del bloque mismo.
                </p>
                <div style={{ background: '#fffbf0', padding: '10px', borderRadius: '4px', fontSize: '0.88rem' }}>
                  <strong>Veámoslo con números:</strong> Tienes un archivo de 2.5 KB en un sistema donde cada bloque es de 1 KB:
                  <ul style={{ marginLeft: '20px', marginTop: '6px', marginBottom: '0' }}>
                    <li>Van a necesitarse 3 bloques completos (porque 2.5 dividido 1 es 2.5, redondeado a 3)</li>
                    <li>Ocupación real: 1 KB + 1 KB + 0.5 KB = 2.5 KB</li>
                    <li><strong style={{ color: '#e65100' }}>Se pierden 0.5 KB</strong> en ese tercer bloque</li>
                  </ul>
                </div>
              </div>

              <div style={{ padding: '12px', background: '#ffebee', borderRadius: '4px', borderLeft: '3px solid #e63946' }}>
                <strong style={{ color: '#0f4c5c', fontSize: '0.95rem' }}>Fragmentación Externa (esta es la peor)</strong>
                <p style={{ fontSize: '0.9rem', marginTop: '6px', marginBottom: '8px' }}>
                  Aquí es cuando los bloques libres están por todo el disco en pedacitos, no continuos. 
                  Esto suele pasar cuando creas y borras archivos muchas veces.
                </p>
                <p style={{ fontSize: '0.88rem', margin: '0', padding: '10px', background: '#fff5f5', borderRadius: '4px' }}>
                  <strong>El problema de fondo:</strong> Aunque tengas suficiente espacio libre en total, 
                  si está todo fragmentado en grupitos chicos que no están juntos, se complica asignar 
                  archivos grandes y el rendimiento se va al piso.
                </p>
              </div>
            </div>

            <div style={{ background: '#e3f2fd', padding: '16px', borderRadius: '6px', marginBottom: '14px' }}>
              <h4 style={{ color: '#1565c0', marginBottom: '10px', fontSize: '1rem' }}>
                Cómo se mide la fragmentación
              </h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
                La fórmula para sacar el porcentaje es:
              </p>
              <div style={{ background: '#f0f8ff', padding: '12px', borderRadius: '4px', textAlign: 'center', marginBottom: '10px' }}>
                <code style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#1565c0' }}>
                  Fragmentación = (segmentos no contiguos ÷ bloques totales ocupados) × 100
                </code>
              </div>
              <p style={{ fontSize: '0.88rem', margin: '0' }}>
                Si tienes 0% de fragmentación, significa que todos los archivos están guardados en bloques 
                perfectamente consecutivos. Mientras más alto el porcentaje, peor anda el sistema.
              </p>
            </div>

            <div style={{ background: '#ffebee', padding: '14px', borderRadius: '6px' }}>
              <h4 style={{ color: '#c62828', marginBottom: '8px', fontSize: '0.95rem' }}>
                Por qué te debería importar el rendimiento
              </h4>
              <ul style={{ marginLeft: '20px', fontSize: '0.9rem', lineHeight: '1.7' }}>
                <li>
                  <strong>Lectura lenta:</strong> El disco tiene que andar buscando en varios lugares diferentes para leer un solo archivo
                </li>
                <li>
                  <strong>Movimientos constantes:</strong> En discos duros tradicionales, el cabezal tiene que estar moviéndose de un lado a otro entre bloques que no están juntos
                </li>
                <li>
                  <strong>Desgaste del hardware:</strong> Tanto movimiento significa que las piezas mecánicas se gastan más rápido
                </li>
                <li>
                  <strong>Búsquedas complicadas:</strong> Encontrar espacios libres contiguos se vuelve cada vez más difícil
                </li>
              </ul>
              <p style={{ fontSize: '0.88rem', marginTop: '10px', padding: '10px', background: '#fff5f5', borderRadius: '4px', margin: '10px 0 0 0' }}>
                <strong>Nota sobre SSDs:</strong> En discos de estado sólido la fragmentación no afecta tanto 
                la velocidad de lectura porque no hay piezas móviles, pero igual sigue siendo un problema 
                para la asignación eficiente de espacio.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Limitaciones del sistema */}
      <div className="card">
        <div 
          onClick={() => toggleSection('limitations')}
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h3>Limitaciones de este Sistema</h3>
          <span style={{ fontSize: '1.5rem', color: '#0f4c5c' }}>
            {expandedSection === 'limitations' ? '−' : '+'}
          </span>
        </div>
        
        {expandedSection === 'limitations' && (
          <div style={{ marginTop: '16px', lineHeight: '1.7', color: '#4a4a4a' }}>
            <p style={{ marginBottom: '14px' }}>
              Este simulador es una versión bastante simplificada de cómo funciona Ext en la vida real. 
              Está pensado para que se entiendan los conceptos básicos, pero tiene diferencias importantes 
              comparado con lo que verías en un sistema Linux con Ext4 de verdad.
            </p>

            <div style={{ background: '#fff3e0', padding: '16px', borderRadius: '6px', marginBottom: '14px' }}>
              <h4 style={{ color: '#e65100', marginBottom: '12px', fontSize: '1rem' }}>
                Comparando el simulador con Ext4 real
              </h4>
              
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: '0.88rem',
                background: 'white',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <thead>
                  <tr style={{ background: '#ff9800', color: 'white' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #f57c00' }}>Característica</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #f57c00' }}>Simulador (Educativo)</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #f57c00' }}>Ext4 Real (Producción)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#fff9f0' }}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ffe0b2', fontWeight: '500' }}>Cantidad de Inodos</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ffe0b2', textAlign: 'center' }}>32</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ffe0b2', textAlign: 'center' }}>Millones (configurable)</td>
                  </tr>
                  <tr style={{ background: 'white' }}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ffe0b2', fontWeight: '500' }}>Bloques Totales</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ffe0b2', textAlign: 'center' }}>128 bloques (128 KB)</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ffe0b2', textAlign: 'center' }}>Hasta 1 EB (exabyte)</td>
                  </tr>
                  <tr style={{ background: '#fff9f0' }}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ffe0b2', fontWeight: '500' }}>Tamaño Máximo de Archivo</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ffe0b2', textAlign: 'center' }}>268 KB<br/><span style={{ fontSize: '0.8rem', color: '#666' }}>(12 directos + 256 indirectos)</span></td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ffe0b2', textAlign: 'center' }}>16 TB<br/><span style={{ fontSize: '0.8rem', color: '#666' }}>(usando extents)</span></td>
                  </tr>
                  <tr style={{ background: 'white' }}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ffe0b2', fontWeight: '500' }}>Niveles de Indirección</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ffe0b2', textAlign: 'center' }}>1 nivel (simple)</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ffe0b2', textAlign: 'center' }}>3 niveles (triple indirección)</td>
                  </tr>
                  <tr style={{ background: '#fff9f0' }}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ffe0b2', fontWeight: '500' }}>Esquema de Punteros</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ffe0b2', textAlign: 'center' }}>12 directos + 1 indirecto</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ffe0b2', textAlign: 'center' }}>Extents (rangos contiguos)</td>
                  </tr>
                  <tr style={{ background: 'white' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>Optimizaciones</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>Sin optimizaciones</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>Block groups, delayed allocation,<br/>journaling, htree indexes</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ background: '#e3f2fd', padding: '16px', borderRadius: '6px', marginBottom: '14px' }}>
              <h4 style={{ color: '#1565c0', marginBottom: '10px', fontSize: '1rem' }}>
                Qué se simplificó en el simulador
              </h4>
              <div style={{ fontSize: '0.9rem' }}>
                <div style={{ marginBottom: '12px', padding: '10px', background: '#f0f8ff', borderRadius: '4px', borderLeft: '3px solid #2196f3' }}>
                  <strong style={{ color: '#0f4c5c' }}>1. No hay grupos de bloques</strong>
                  <p style={{ fontSize: '0.88rem', marginTop: '4px', marginBottom: '0' }}>
                    En Ext4 real, el disco se organiza en block groups para reducir la fragmentación y 
                    mantener las cosas cerca unas de otras. Cada grupo maneja sus propios inodos, bloques 
                    y bitmaps. Acá usamos una estructura plana mucho más simple.
                  </p>
                </div>

                <div style={{ marginBottom: '12px', padding: '10px', background: '#f0f8ff', borderRadius: '4px', borderLeft: '3px solid #2196f3' }}>
                  <strong style={{ color: '#0f4c5c' }}>2. No implementamos journaling</strong>
                  <p style={{ fontSize: '0.88rem', marginTop: '4px', marginBottom: '0' }}>
                    Ext4 tiene un journal que es como un registro de todos los cambios antes de aplicarlos. 
                    Si algo falla, se puede recuperar. Esa capa de seguridad no está en este simulador.
                  </p>
                </div>

                <div style={{ marginBottom: '12px', padding: '10px', background: '#f0f8ff', borderRadius: '4px', borderLeft: '3px solid #2196f3' }}>
                  <strong style={{ color: '#0f4c5c' }}>3. Usamos punteros, no extents</strong>
                  <p style={{ fontSize: '0.88rem', marginTop: '4px', marginBottom: '6px' }}>
                    El Ext4 moderno usa extents, que son rangos de bloques contiguos. Un extent puede 
                    representar millones de bloques consecutivos con una sola entrada, lo cual es muchísimo 
                    más eficiente.
                  </p>
                  <div style={{ background: 'white', padding: '8px', borderRadius: '4px', fontSize: '0.82rem' }}>
                    Simulador: 12 punteros directos + 1 indirecto = máximo 268 bloques<br/>
                    Ext4 real: Un extent puede representar 128 MB de datos contiguos ocupando solo 12 bytes
                  </div>
                </div>

                <div style={{ padding: '10px', background: '#f0f8ff', borderRadius: '4px', borderLeft: '3px solid #2196f3' }}>
                  <strong style={{ color: '#0f4c5c' }}>4. Cero caché ni optimizaciones de entrada/salida</strong>
                  <p style={{ fontSize: '0.88rem', marginTop: '4px', marginBottom: '0' }}>
                    Los sistemas reales usan page cache, read-ahead y delayed allocation para hacer todo 
                    más rápido. El simulador ejecuta las operaciones directamente sin ningún tipo de buffering.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ background: '#f1f8e9', padding: '14px', borderRadius: '6px' }}>
              <h4 style={{ color: '#558b2f', marginBottom: '8px', fontSize: '0.95rem' }}>
                Para qué sirve todo esto
              </h4>
              <p style={{ fontSize: '0.88rem', lineHeight: '1.7', marginBottom: '8px' }}>
                El objetivo de este simulador es enseñar los conceptos fundamentales de cómo funciona Ext 
                sin meterle toda la complejidad que tiene una implementación de producción:
              </p>
              <ul style={{ marginLeft: '20px', fontSize: '0.88rem', lineHeight: '1.7', marginBottom: '0' }}>
                <li>Puedes ver claramente los inodos, bloques y bitmaps</li>
                <li>El cálculo de fragmentación es directo, sin optimizaciones que oculten lo que pasa</li>
                <li>Las estrategias de asignación son fáciles de entender (First Fit, Best Fit)</li>
                <li>Los límites chicos te dejan experimentar rápido</li>
                <li>Todo lo que hace el sistema es transparente y lo puedes revisar</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationalInfo;
