import React from 'react';
import { Estadisticas } from '../services/FileSystem';

interface StatisticsProps {
  stats: Estadisticas;
}

/**
 * Componente que muestra las estadísticas del sistema
 */
const Statistics: React.FC<StatisticsProps> = ({ stats }) => {
  const porcentajeInodosUsados = ((stats.inodos_usados / 32) * 100).toFixed(1);
  const porcentajeBloquesUsados = ((stats.bloques_usados / 128) * 100).toFixed(1);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Inodos Libres</div>
        <div className="stat-value">{stats.inodos_libres}/32</div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${porcentajeInodosUsados}%` }}
          >
            {porcentajeInodosUsados}%
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Bloques Libres</div>
        <div className="stat-value">{stats.bloques_libres}/128</div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${porcentajeBloquesUsados}%` }}
          >
            {porcentajeBloquesUsados}%
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Fragmentación</div>
        <div className="stat-value">{stats.fragmentacion}%</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Archivos Activos</div>
        <div className="stat-value">{stats.archivos_activos}</div>
      </div>
    </div>
  );
};

export default Statistics;
