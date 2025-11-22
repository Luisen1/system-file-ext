import React, { useState } from 'react';
import { MAX_FILE_SIZE, BLOCK_SIZE } from '../config/constants';

interface FileCreatorProps {
  onCreateFile: (nombre: string, tamano_bytes: number) => number;
  disabled: boolean;
}

interface Mensaje {
  tipo: 'success' | 'error';
  texto: string;
}

const FileCreator: React.FC<FileCreatorProps> = ({ onCreateFile, disabled }) => {
  const [nombre, setNombre] = useState<string>('');
  const [tamano, setTamano] = useState<string>('');
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!nombre.trim() || !tamano) {
      setMensaje({ tipo: 'error', texto: 'Completa ambos campos para continuar' });
      return;
    }

    const tamanoBytes = parseInt(tamano) * BLOCK_SIZE;
    
    if (tamanoBytes <= 0) {
      setMensaje({ tipo: 'error', texto: 'El tamaño debe ser mayor a 0 KB' });
      return;
    }

    if (tamanoBytes > MAX_FILE_SIZE) {
      setMensaje({ tipo: 'error', texto: `El tamaño máximo es ${MAX_FILE_SIZE / BLOCK_SIZE} KB` });
      return;
    }

    const resultado = onCreateFile(nombre.trim(), tamanoBytes);
    
    if (resultado !== -1) {
      setMensaje({ 
        tipo: 'success', 
        texto: `Archivo "${nombre}" creado exitosamente (ID: ${resultado})` 
      });
      setNombre('');
      setTamano('');
    } else {
      setMensaje({ 
        tipo: 'error', 
        texto: 'No se pudo crear el archivo. Revisa el espacio disponible.' 
      });
    }

    setTimeout(() => setMensaje(null), 5000);
  };

  return (
    <div className="card">
      <h3>Crear Archivo</h3>
      
      {mensaje && (
        <div className={`alert alert-${mensaje.tipo === 'success' ? 'success' : 'error'}`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="documento.txt"
            maxLength={32}
            disabled={disabled}
          />
          <small style={{ color: '#888', fontSize: '0.85rem' }}>
            Máx. 32 caracteres
          </small>
        </div>

        <div className="form-group">
          <label>Tamaño (en KB):</label>
          <input
            type="number"
            value={tamano}
            onChange={(e) => setTamano(e.target.value)}
            placeholder="10"
            min="1"
            max="268"
            disabled={disabled}
          />
          <small style={{ color: '#888', fontSize: '0.85rem' }}>
            Máx. 268 KB
          </small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={disabled}>
          Crear Archivo
        </button>
      </form>
    </div>
  );
};

export default FileCreator;
