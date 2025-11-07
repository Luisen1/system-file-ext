import React, { useState } from 'react';
import { SistemaArchivosExt } from './services/FileSystem';
import Statistics from './components/Statistics';
import FileCreator from './components/FileCreator';
import FileList from './components/FileList';
import DiskVisualization from './components/DiskVisualization';
import StressTest from './components/StressTest';
import Analysis from './components/Analysis';
import './styles/App.css';

type TabType = 'operaciones' | 'prueba' | 'analisis';

const App: React.FC = () => {
  const [fileSystem] = useState<SistemaArchivosExt>(() => new SistemaArchivosExt());
  const [, setUpdateTrigger] = useState<number>(0);
  const [tabActiva, setTabActiva] = useState<TabType>('operaciones');

  const handleUpdate = () => {
    setUpdateTrigger(prev => prev + 1);
  };

  const handleCreateFile = (nombre: string, tamano_bytes: number): number => {
    const resultado = fileSystem.crear_archivo(nombre, tamano_bytes);
    handleUpdate();
    return resultado;
  };

  const handleDeleteFile = (id: number, _nombre: string): void => {
    fileSystem.eliminar_archivo(id);
    handleUpdate();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>🗂️ Simulador Sistema de Archivos Ext</h1>
          <p>Implementación educativa con punteros directos e indirectos</p>
        </div>
      </header>

      <main className="container">
        {/* Tabs Navigation */}
        <div className="tabs">
          <button
            className={`tab ${tabActiva === 'operaciones' ? 'active' : ''}`}
            onClick={() => setTabActiva('operaciones')}
          >
            📁 Operaciones
          </button>
          <button
            className={`tab ${tabActiva === 'prueba' ? 'active' : ''}`}
            onClick={() => setTabActiva('prueba')}
          >
            🧪 Prueba de Estrés
          </button>
          <button
            className={`tab ${tabActiva === 'analisis' ? 'active' : ''}`}
            onClick={() => setTabActiva('analisis')}
          >
            📊 Análisis
          </button>
        </div>

        {/* Tab Content */}
        {tabActiva === 'operaciones' && (
          <>
            <Statistics stats={fileSystem.obtenerEstadisticas()} />
            
            <div className="two-columns">
              <FileCreator 
                onCreateFile={handleCreateFile} 
                disabled={fileSystem.obtenerEstadisticas().inodos_libres === 0} 
              />
              <FileList 
                archivos={fileSystem.listar_archivos()} 
                onDeleteFile={handleDeleteFile} 
              />
            </div>

            <DiskVisualization bloques={fileSystem.mostrar_estado_disco()} />
          </>
        )}

        {tabActiva === 'prueba' && (
          <StressTest fileSystem={fileSystem} />
        )}

        {tabActiva === 'analisis' && (
          <Analysis />
        )}
      </main>

      <footer className="footer">
        <div className="container">
          <p>
            Sistema de archivos educativo basado en Ext • 
            32 Inodos • 128 Bloques (1 KB) • 
            12 Punteros Directos + 1 Indirecto (256 entradas)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
