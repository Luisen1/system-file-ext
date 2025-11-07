import React from 'react';
import { EstadoDisco } from '../services/FileSystem';

interface DiskVisualizationProps {
  bloques: EstadoDisco[];
}

/**
 * Componente para visualizar el estado del disco
 */
const DiskVisualization: React.FC<DiskVisualizationProps> = ({ bloques }) => {
  // Contar bloques por tipo
  const libres = bloques.filter(b => b.tipo === 'libre').length;
  const ocupados = bloques.filter(b => b.tipo === 'ocupado').length;
  const indirectos = bloques.filter(b => b.tipo === 'indirecto').length;

  return (
    <div className="card">
      <h3>Estado del Disco (128 Bloques)</h3>
      
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color block-libre"></div>
          <span>Libre ({libres})</span>
        </div>
        <div className="legend-item">
          <div className="legend-color block-ocupado"></div>
          <span>Ocupado ({ocupados})</span>
        </div>
        <div className="legend-item">
          <div className="legend-color block-indirecto"></div>
          <span>Indirecto ({indirectos})</span>
        </div>
      </div>

      <div className="disk-grid">
        {bloques.map((bloque) => (
          <div
            key={bloque.id}
            className={`block block-${bloque.tipo}`}
            title={`Bloque ${bloque.id}${bloque.archivo ? ` - ${bloque.archivo}` : ''}`}
          >
            {bloque.id}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiskVisualization;
