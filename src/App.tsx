import React, { useState, useMemo, useCallback } from 'react';
import { SistemaArchivosExt } from './services/FileSystem';
import Statistics from './components/Statistics';
import FileCreator from './components/FileCreator';
import FileList from './components/FileList';
import DiskVisualization from './components/DiskVisualization';
import StressTest from './components/StressTest';
import Analysis from './components/Analysis';
import EducationalInfo from './components/EducationalInfo';
import './styles/App.css';

type TabType = 'teoria' | 'operaciones' | 'prueba' | 'analisis';

const App: React.FC = () => {
  const [fileSystem] = useState<SistemaArchivosExt>(() => new SistemaArchivosExt());
  const [updateTrigger, setUpdateTrigger] = useState<number>(0);
  const [tabActiva, setTabActiva] = useState<TabType>('teoria');

  const handleUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  const handleCreateFile = useCallback((nombre: string, tamano_bytes: number): number => {
    const resultado = fileSystem.crear_archivo(nombre, tamano_bytes);
    handleUpdate();
    return resultado;
  }, [fileSystem, handleUpdate]);

  const handleDeleteFile = useCallback((id: number): void => {
    fileSystem.eliminar_archivo(id);
    handleUpdate();
  }, [fileSystem, handleUpdate]);

  const stats = useMemo(() => fileSystem.obtenerEstadisticas(), [fileSystem, updateTrigger]);
  const archivos = useMemo(() => fileSystem.listar_archivos(), [fileSystem, updateTrigger]);
  const bloques = useMemo(() => fileSystem.mostrar_estado_disco(), [fileSystem, updateTrigger]);

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>Sistema de Archivos Ext - Simulador</h1>
          <p>Simulación práctica del sistema Ext con gestión de punteros directos e indirectos</p>
        </div>
      </header>

      <main className="container">
        <div className="tabs">
          <button
            className={`tab ${tabActiva === 'teoria' ? 'active' : ''}`}
            onClick={() => setTabActiva('teoria')}
          >
            Teoría
          </button>
          <button
            className={`tab ${tabActiva === 'operaciones' ? 'active' : ''}`}
            onClick={() => setTabActiva('operaciones')}
          >
            Operaciones
          </button>
          <button
            className={`tab ${tabActiva === 'prueba' ? 'active' : ''}`}
            onClick={() => setTabActiva('prueba')}
          >
            Test de Estrés
          </button>
          <button
            className={`tab ${tabActiva === 'analisis' ? 'active' : ''}`}
            onClick={() => setTabActiva('analisis')}
          >
            Comparativa
          </button>
        </div>

        {tabActiva === 'teoria' && <EducationalInfo />}

        {tabActiva === 'operaciones' && (
          <>
            <Statistics stats={stats} />
            
            <div className="two-columns">
              <FileCreator 
                onCreateFile={handleCreateFile} 
                disabled={stats.inodos_libres === 0} 
              />
              <FileList 
                archivos={archivos} 
                onDeleteFile={handleDeleteFile} 
              />
            </div>

            <DiskVisualization bloques={bloques} />
          </>
        )}

        {tabActiva === 'prueba' && <StressTest fileSystem={fileSystem} />}

        {tabActiva === 'analisis' && <Analysis />}
      </main>

      <footer className="footer">
        <div className="container">
          <p>
            Sistema Ext simplificado - 32 inodos - 128 bloques de 1KB - 12 punteros directos + 1 indirecto (256 entradas)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
