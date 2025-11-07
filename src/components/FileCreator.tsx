import React, { useState } from 'react';

interface FileCreatorProps {
  onCreateFile: (nombre: string, tamano_bytes: number) => number;
  disabled: boolean;
}

interface Mensaje {
  tipo: 'success' | 'error';
  texto: string;
}

/**
 * Componente para crear archivos
 */
const FileCreator: React.FC<FileCreatorProps> = ({ onCreateFile, disabled }) => {
  const [nombre, setNombre] = useState<string>('');
  const [tamano, setTamano] = useState<string>('');
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!nombre || !tamano) {
      setMensaje({ tipo: 'error', texto: 'Por favor complete todos los campos' });
      return;
    }

    const tamanoBytes = parseInt(tamano) * 1024; // Convertir KB a bytes
    
    if (tamanoBytes <= 0) {
      setMensaje({ tipo: 'error', texto: 'El tamaño debe ser mayor a 0' });
      return;
    }

    const resultado = onCreateFile(nombre, tamanoBytes);
    
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
        texto: 'Error al crear el archivo. Verifique los recursos disponibles.' 
      });
    }

    // Limpiar mensaje después de 5 segundos
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
          <label>Nombre del archivo:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="ejemplo.txt"
            maxLength={32}
            disabled={disabled}
          />
          <small style={{ color: '#888', fontSize: '0.85rem' }}>
            Máximo 32 caracteres
          </small>
        </div>

        <div className="form-group">
          <label>Tamaño (KB):</label>
          <input
            type="number"
            value={tamano}
            onChange={(e) => setTamano(e.target.value)}
            placeholder="5"
            min="1"
            max="268"
            disabled={disabled}
          />
          <small style={{ color: '#888', fontSize: '0.85rem' }}>
            Máximo 268 KB (268 bloques)
          </small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={disabled}>
          ➕ Crear Archivo
        </button>
      </form>
    </div>
  );
};

export default FileCreator;
