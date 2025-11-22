import React, { useMemo } from 'react';
import { EstadoDisco } from '../services/FileSystem';
import { NUM_BLOQUES } from '../config/constants';

interface DiskVisualizationProps {
  bloques: EstadoDisco[];
}

const DiskVisualization: React.FC<DiskVisualizationProps> = ({ bloques }) => {
  const stats = useMemo(() => ({
    libres: bloques.filter(b => b.tipo === 'libre').length,
    ocupados: bloques.filter(b => b.tipo === 'ocupado').length,
    indirectos: bloques.filter(b => b.tipo === 'indirecto').length
  }), [bloques]);

  return (
    <div className="card">
      <h3>Estado del Disco ({NUM_BLOQUES} Bloques)</h3>
      
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color block-libre"></div>
          <span>Libre ({stats.libres})</span>
        </div>
        <div className="legend-item">
          <div className="legend-color block-ocupado"></div>
          <span>Ocupado ({stats.ocupados})</span>
        </div>
        <div className="legend-item">
          <div className="legend-color block-indirecto"></div>
          <span>Indirecto ({stats.indirectos})</span>
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
