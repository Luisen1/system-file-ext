import React from 'react';
import { ArchivoInfo } from '../services/FileSystem';

interface FileListProps {
  archivos: ArchivoInfo[];
  onDeleteFile: (id: number, nombre: string) => void;
}

/**
 * Componente para listar archivos del sistema
 */
const FileList: React.FC<FileListProps> = ({ archivos, onDeleteFile }) => {
  if (archivos.length === 0) {
    return (
      <div className="card">
        <h3>Lista de Archivos</h3>
        <div className="alert alert-info">
          📂 No hay archivos en el sistema. Crea uno para comenzar.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Lista de Archivos</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tamaño (KB)</th>
              <th>Bloques</th>
              <th>Fragmentado</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {archivos.map((archivo) => (
              <tr key={archivo.id}>
                <td>{archivo.id}</td>
                <td>
                  <strong>{archivo.nombre}</strong>
                </td>
                <td>{archivo.tamano_kb}</td>
                <td>
                  <small style={{ color: '#666' }}>{archivo.bloques}</small>
                </td>
                <td>
                  <span className={`badge ${archivo.fragmentado ? 'badge-warning' : 'badge-success'}`}>
                    {archivo.fragmentado ? '⚠️ Sí' : '✓ No'}
                  </span>
                </td>
                <td>
                  <small>{archivo.fecha_creacion}</small>
                </td>
                <td>
                  <button
                    onClick={() => onDeleteFile(archivo.id, archivo.nombre)}
                    className="btn btn-danger"
                    style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileList;
