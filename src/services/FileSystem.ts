import { Superbloque, Inodo, Bloque, BloqueIndirecto } from '../models/structures';
import { NUM_INODOS, NUM_BLOQUES, BLOCK_SIZE, MAX_FILENAME_LENGTH } from '../config/constants';

/**
 * Interfaces para tipos del sistema
 */
export interface ArchivoInfo {
  id: number;
  nombre: string;
  tamano_kb: string;
  tamano_bytes: number;
  bloques: string;
  num_bloques: number;
  fragmentado: boolean;
  fecha_creacion: string;
}

export interface EstadoDisco {
  id: number;
  tipo: 'libre' | 'ocupado' | 'indirecto';
  archivo: string | null;
}

export interface Estadisticas {
  inodos_libres: number;
  inodos_usados: number;
  bloques_libres: number;
  bloques_usados: number;
  fragmentacion: number;
  archivos_activos: number;
}

export interface OperacionHistorial {
  op: number;
  tipo: 'crear' | 'eliminar';
  nombre: string;
  tamano: number;
  inodo_id: number;
  timestamp: Date;
}

export interface Snapshot {
  operacion: number;
  archivos_activos: number;
  bloques_ocupados: number;
  fragmentacion: number;
  inodos_libres: number;
  bloques_libres: number;
  archivos: ArchivoInfo[];
  timestamp: Date;
}

/**
 * Sistema de Archivos Ext - Clase Principal
 */
export class SistemaArchivosExt {
  superbloque: Superbloque;
  inodos: Inodo[];
  bloques: Bloque[];
  bitmap_inodos: boolean[];
  bitmap_bloques: boolean[];
  historial: OperacionHistorial[];
  operacionActual: number;

  constructor() {
    this.superbloque = new Superbloque();
    this.inodos = Array.from({ length: NUM_INODOS }, (_, i) => new Inodo(i));
    this.bloques = Array.from({ length: NUM_BLOQUES }, (_, i) => new Bloque(i));
    
    // Bitmap para gestión de recursos
    this.bitmap_inodos = new Array(NUM_INODOS).fill(false);
    this.bitmap_bloques = new Array(NUM_BLOQUES).fill(false);
    
    // Historial de operaciones
    this.historial = [];
    this.operacionActual = 0;
  }

  /**
   * a) Función crear_archivo
   * Crea un nuevo archivo en el sistema
   */
  crear_archivo(nombre: string, tamano_bytes: number): number {
    try {
      // Validaciones
      if (!nombre || nombre.length === 0) {
        throw new Error('El nombre del archivo no puede estar vacío');
      }
      
      if (nombre.length > MAX_FILENAME_LENGTH) {
        throw new Error(`El nombre no puede exceder ${MAX_FILENAME_LENGTH} caracteres`);
      }
      
      if (this.existeArchivo(nombre)) {
        throw new Error(`Ya existe un archivo con el nombre: ${nombre}`);
      }

      // 1. Buscar inodo libre
      const inodo_id = this.buscarInodoLibre();
      if (inodo_id === -1) {
        throw new Error('No hay inodos disponibles');
      }

      // 2. Calcular bloques necesarios: ceil(tamano_bytes / 1024)
      const bloques_necesarios = Math.ceil(tamano_bytes / BLOCK_SIZE);
      
      if (bloques_necesarios > 268) {
        throw new Error('El archivo excede el tamaño máximo soportado (268 bloques)');
      }

      // 3. Buscar bloques libres consecutivos o fragmentados
      const bloques_asignados = this.buscarBloquesLibres(bloques_necesarios);
      
      if (bloques_asignados.length < bloques_necesarios) {
        throw new Error(`No hay suficientes bloques libres. Necesarios: ${bloques_necesarios}, Disponibles: ${bloques_asignados.length}`);
      }

      // 4. Asignar bloques al inodo
      const inodo = this.inodos[inodo_id];
      inodo.asignar(nombre);
      inodo.tamano = tamano_bytes;
      
      let bloque_indirecto: Bloque | null = null;
      
      for (let i = 0; i < bloques_asignados.length; i++) {
        const bloque_id = bloques_asignados[i];
        
        // Primero usar punteros directos (0-11)
        if (i < 12) {
          inodo.punteros_directos[i] = bloque_id;
        } else {
          // Usar puntero indirecto
          if (!bloque_indirecto) {
            // Necesitamos crear el bloque indirecto
            const bloque_ind_id = this.buscarBloqueLibre();
            if (bloque_ind_id === -1) {
              throw new Error('No hay bloques disponibles para puntero indirecto');
            }
            inodo.puntero_indirecto = bloque_ind_id;
            bloque_indirecto = this.bloques[bloque_ind_id];
            bloque_indirecto.ocupado = true;
            this.bitmap_bloques[bloque_ind_id] = true;
          }
          
          // Agregar al bloque indirecto
          if (!bloque_indirecto.punteros) {
            bloque_indirecto.punteros = new Array(256).fill(-1);
          }
          bloque_indirecto.punteros[i - 12] = bloque_id;
        }
        
        // Marcar bloque como ocupado
        this.bloques[bloque_id].ocupar();
        this.bitmap_bloques[bloque_id] = true;
        inodo.bloques_usados++;
      }

      // 5. Actualizar bitmaps y superbloque
      this.bitmap_inodos[inodo_id] = true;
      this.actualizarSuperbloque();
      
      // Registrar operación
      this.registrarOperacion('crear', nombre, tamano_bytes, inodo_id);

      // 6. Retornar ID del inodo o -1 si falla
      return inodo_id;
      
    } catch (error) {
      console.error('Error al crear archivo:', (error as Error).message);
      return -1;
    }
  }

  /**
   * b) Función eliminar_archivo
   * Elimina un archivo del sistema
   */
  eliminar_archivo(inodo_id: number): number {
    try {
      // 1. Verificar que inodo existe y está en uso
      if (inodo_id < 0 || inodo_id >= NUM_INODOS) {
        throw new Error('ID de inodo inválido');
      }

      const inodo = this.inodos[inodo_id];
      
      if (!inodo.en_uso) {
        throw new Error('El inodo no está en uso');
      }

      const nombre = inodo.nombre;

      // 2. Liberar todos los bloques asignados (directos e indirectos)
      // Liberar bloques directos
      for (let i = 0; i < inodo.punteros_directos.length; i++) {
        const bloque_id = inodo.punteros_directos[i];
        if (bloque_id !== -1) {
          this.bloques[bloque_id].liberar();
          this.bitmap_bloques[bloque_id] = false;
        }
      }

      // Liberar bloques indirectos
      if (inodo.puntero_indirecto !== -1) {
        const bloque_ind = this.bloques[inodo.puntero_indirecto];
        
        if (bloque_ind.punteros) {
          for (let i = 0; i < bloque_ind.punteros.length; i++) {
            const bloque_id = bloque_ind.punteros[i];
            if (bloque_id !== -1) {
              this.bloques[bloque_id].liberar();
              this.bitmap_bloques[bloque_id] = false;
            }
          }
        }
        
        // Liberar el bloque indirecto también
        bloque_ind.liberar();
        this.bitmap_bloques[inodo.puntero_indirecto] = false;
      }

      // 3. Marcar inodo como libre
      inodo.liberar();
      this.bitmap_inodos[inodo_id] = false;

      // 4. Actualizar bitmaps y superbloque
      this.actualizarSuperbloque();
      
      // Registrar operación
      this.registrarOperacion('eliminar', nombre, 0, inodo_id);

      // 5. Retornar 0 si éxito, -1 si falla
      return 0;
      
    } catch (error) {
      console.error('Error al eliminar archivo:', (error as Error).message);
      return -1;
    }
  }

  /**
   * c) Función listar_archivos
   * Muestra tabla con información de todos los archivos
   */
  listar_archivos(): ArchivoInfo[] {
    const archivos: ArchivoInfo[] = [];
    
    for (let i = 0; i < this.inodos.length; i++) {
      const inodo = this.inodos[i];
      if (inodo.en_uso) {
        const bloqueIndirecto = inodo.puntero_indirecto !== -1 
          ? this.bloques[inodo.puntero_indirecto] as any as BloqueIndirecto
          : null;
        
        const bloques = inodo.obtenerBloques(bloqueIndirecto);
        
        // Calcular fragmentación (bloques no contiguos)
        let fragmentado = false;
        if (bloques.length > 1) {
          for (let j = 1; j < bloques.length; j++) {
            if (bloques[j] !== bloques[j-1] + 1) {
              fragmentado = true;
              break;
            }
          }
        }
        
        archivos.push({
          id: inodo.id,
          nombre: inodo.nombre,
          tamano_kb: (inodo.tamano / 1024).toFixed(2),
          tamano_bytes: inodo.tamano,
          bloques: bloques.join(', '),
          num_bloques: inodo.bloques_usados,
          fragmentado: fragmentado,
          fecha_creacion: inodo.fecha_creacion ? inodo.fecha_creacion.toLocaleString('es-ES') : 'N/A'
        });
      }
    }
    
    return archivos;
  }

  /**
   * d) Función calcular_fragmentacion
   * Retorna porcentaje de fragmentación del disco
   */
  calcular_fragmentacion(): number {
    let bloques_no_contiguos = 0;
    let bloques_totales_usados = 0;

    for (let i = 0; i < this.inodos.length; i++) {
      const inodo = this.inodos[i];
      
      if (inodo.en_uso && inodo.bloques_usados > 1) {
        const bloqueIndirecto = inodo.puntero_indirecto !== -1 
          ? this.bloques[inodo.puntero_indirecto] as any as BloqueIndirecto
          : null;
        
        const bloques = inodo.obtenerBloques(bloqueIndirecto);
        
        bloques_totales_usados += bloques.length;
        
        // Contar bloques no contiguos
        for (let j = 1; j < bloques.length; j++) {
          if (bloques[j] !== bloques[j-1] + 1) {
            bloques_no_contiguos++;
          }
        }
      }
    }

    if (bloques_totales_usados === 0) {
      return 0;
    }

    // Fragmentación = (bloques no contiguos / bloques totales usados) * 100
    const fragmentacion = (bloques_no_contiguos / bloques_totales_usados) * 100;
    return parseFloat(fragmentacion.toFixed(2));
  }

  /**
   * e) Función mostrar_estado_disco
   * Visualización gráfica del disco
   */
  mostrar_estado_disco(): EstadoDisco[] {
    const estado: EstadoDisco[] = [];
    
    for (let i = 0; i < NUM_BLOQUES; i++) {
      const bloque = this.bloques[i];
      let tipo: 'libre' | 'ocupado' | 'indirecto' = 'libre';
      let archivo: string | null = null;
      
      if (bloque.ocupado) {
        // Buscar a qué archivo pertenece
        for (let j = 0; j < this.inodos.length; j++) {
          const inodo = this.inodos[j];
          if (inodo.en_uso) {
            if (inodo.punteros_directos.includes(i)) {
              tipo = 'ocupado';
              archivo = inodo.nombre;
              break;
            } else if (inodo.puntero_indirecto !== -1) {
              const bloque_ind = this.bloques[inodo.puntero_indirecto];
              if (bloque_ind.punteros && bloque_ind.punteros.includes(i)) {
                tipo = 'ocupado';
                archivo = inodo.nombre;
                break;
              } else if (i === inodo.puntero_indirecto) {
                tipo = 'indirecto';
                archivo = inodo.nombre;
                break;
              }
            }
          }
        }
        
        if (!archivo) {
          tipo = 'ocupado';
          archivo = 'Sistema';
        }
      }
      
      estado.push({
        id: i,
        tipo,
        archivo
      });
    }
    
    return estado;
  }

  /**
   * Métodos auxiliares
   */
  
  buscarInodoLibre(): number {
    for (let i = 0; i < this.bitmap_inodos.length; i++) {
      if (!this.bitmap_inodos[i]) {
        return i;
      }
    }
    return -1;
  }

  buscarBloqueLibre(): number {
    for (let i = 0; i < this.bitmap_bloques.length; i++) {
      if (!this.bitmap_bloques[i]) {
        return i;
      }
    }
    return -1;
  }

  buscarBloquesLibres(cantidad: number): number[] {
    const bloques: number[] = [];
    
    for (let i = 0; i < this.bitmap_bloques.length && bloques.length < cantidad; i++) {
      if (!this.bitmap_bloques[i]) {
        bloques.push(i);
      }
    }
    
    return bloques;
  }

  existeArchivo(nombre: string): boolean {
    return this.inodos.some(inodo => inodo.en_uso && inodo.nombre === nombre);
  }

  actualizarSuperbloque(): void {
    const inodos_usados = this.bitmap_inodos.filter(Boolean).length;
    const bloques_usados = this.bitmap_bloques.filter(Boolean).length;
    this.superbloque.actualizarContadores(inodos_usados, bloques_usados);
  }

  registrarOperacion(tipo: 'crear' | 'eliminar', nombre: string, tamano: number, inodo_id: number): void {
    this.operacionActual++;
    this.historial.push({
      op: this.operacionActual,
      tipo,
      nombre,
      tamano,
      inodo_id,
      timestamp: new Date()
    });
  }

  obtenerEstadisticas(): Estadisticas {
    return {
      inodos_libres: this.superbloque.inodos_libres,
      inodos_usados: this.superbloque.num_inodos - this.superbloque.inodos_libres,
      bloques_libres: this.superbloque.bloques_libres,
      bloques_usados: this.superbloque.num_bloques - this.superbloque.bloques_libres,
      fragmentacion: this.calcular_fragmentacion(),
      archivos_activos: this.inodos.filter(i => i.en_uso).length
    };
  }

  // Métodos para la prueba de estrés
  crearSnapshot(): Snapshot {
    const stats = this.obtenerEstadisticas();
    const archivos = this.listar_archivos();
    
    return {
      operacion: this.operacionActual,
      archivos_activos: archivos.length,
      bloques_ocupados: stats.bloques_usados,
      fragmentacion: stats.fragmentacion,
      inodos_libres: stats.inodos_libres,
      bloques_libres: stats.bloques_libres,
      archivos: archivos,
      timestamp: new Date()
    };
  }

  resetear(): void {
    this.superbloque = new Superbloque();
    this.inodos = Array.from({ length: NUM_INODOS }, (_, i) => new Inodo(i));
    this.bloques = Array.from({ length: NUM_BLOQUES }, (_, i) => new Bloque(i));
    this.bitmap_inodos = new Array(NUM_INODOS).fill(false);
    this.bitmap_bloques = new Array(NUM_BLOQUES).fill(false);
    this.historial = [];
    this.operacionActual = 0;
  }
}
