import React, { useMemo } from 'react';
import { Estadisticas } from '../services/FileSystem';
import { NUM_INODOS, NUM_BLOQUES } from '../config/constants';

interface StatisticsProps {
  stats: Estadisticas;
}

const Statistics: React.FC<StatisticsProps> = ({ stats }) => {
  const porcentajeInodosUsados = useMemo(
    () => ((stats.inodos_usados / NUM_INODOS) * 100).toFixed(1),
    [stats.inodos_usados]
  );
  
  const porcentajeBloquesUsados = useMemo(
    () => ((stats.bloques_usados / NUM_BLOQUES) * 100).toFixed(1),
    [stats.bloques_usados]
  );

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Inodos Usados</div>
        <div className="stat-value">{stats.inodos_usados}/{NUM_INODOS}</div>
        <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#666' }}>
          {porcentajeInodosUsados}% de capacidad
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${porcentajeInodosUsados}%` }}
          />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Bloques Usados</div>
        <div className="stat-value">{stats.bloques_usados}/{NUM_BLOQUES}</div>
        <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#666' }}>
          {porcentajeBloquesUsados}% de capacidad
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${porcentajeBloquesUsados}%` }}
          />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Fragmentación</div>
        <div className="stat-value">{stats.fragmentacion}%</div>
        <div className="progress-bar" style={{ marginTop: '16px' }}>
          <div 
            className="progress-fill" 
            style={{ 
              width: `${stats.fragmentacion}%`,
              background: stats.fragmentacion > 30 ? 'linear-gradient(90deg, #e74c3c 0%, #ff6b6b 100%)' : 'linear-gradient(90deg, #1abc9c 0%, #16a085 100%)'
            }}
          />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Archivos Activos</div>
        <div className="stat-value">{stats.archivos_activos}</div>
      </div>
    </div>
  );
};

export default Statistics;
