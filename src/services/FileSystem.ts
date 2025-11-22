import { Superbloque, Inodo, Bloque, BloqueIndirecto } from '../models/structures';
import { NUM_INODOS, NUM_BLOQUES, BLOCK_SIZE, MAX_FILENAME_LENGTH } from '../config/constants';

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
  tiempo_busqueda_ms: number;
  archivos_con_indirecto: number;
}
export class SistemaArchivosExt {
  superbloque: Superbloque;
  inodos: Inodo[];
  bloques: Bloque[];
  bitmap_inodos: boolean[];
  bitmap_bloques: boolean[];
  historial: OperacionHistorial[];
  operacionActual: number;
  ultimoTiempoBusqueda: number;

  constructor() {
    this.superbloque = new Superbloque();
    this.inodos = Array.from({ length: NUM_INODOS }, (_, i) => new Inodo(i));
    this.bloques = Array.from({ length: NUM_BLOQUES }, (_, i) => new Bloque(i));
    this.bitmap_inodos = new Array(NUM_INODOS).fill(false);
    this.bitmap_bloques = new Array(NUM_BLOQUES).fill(false);
    this.historial = [];
    this.operacionActual = 0;
    this.ultimoTiempoBusqueda = 0;
  }

  crear_archivo(nombre: string, tamano_bytes: number): number {
    try {
      if (!nombre || nombre.length === 0) {
        throw new Error('El nombre del archivo no puede estar vacío');
      }
      
      if (nombre.length > MAX_FILENAME_LENGTH) {
        throw new Error(`El nombre no puede exceder ${MAX_FILENAME_LENGTH} caracteres`);
      }
      
      if (this.existeArchivo(nombre)) {
        throw new Error(`Ya existe un archivo con el nombre: ${nombre}`);
      }

      const inodo_id = this.buscarInodoLibre();
      if (inodo_id === -1) {
        throw new Error('No hay inodos disponibles');
      }

      const bloques_necesarios = Math.ceil(tamano_bytes / BLOCK_SIZE);
      
      if (bloques_necesarios > 268) {
        throw new Error('El archivo excede el tamaño máximo soportado (268 bloques)');
      }

      const bloques_asignados = this.buscarBloquesLibres(bloques_necesarios);
      
      if (bloques_asignados.length < bloques_necesarios) {
        throw new Error(`No hay suficientes bloques libres. Necesarios: ${bloques_necesarios}, Disponibles: ${bloques_asignados.length}`);
      }

      const inodo = this.inodos[inodo_id];
      inodo.asignar(nombre);
      inodo.tamano = tamano_bytes;
      
      let bloque_indirecto: Bloque | null = null;
      
      for (let i = 0; i < bloques_asignados.length; i++) {
        const bloque_id = bloques_asignados[i];
        
        if (i < 12) {
          inodo.punteros_directos[i] = bloque_id;
        } else {
          if (!bloque_indirecto) {
            const bloque_ind_id = this.buscarBloqueLibre();
            if (bloque_ind_id === -1) {
              throw new Error('No hay bloques disponibles para puntero indirecto');
            }
            
            inodo.puntero_indirecto = bloque_ind_id;
            bloque_indirecto = this.bloques[bloque_ind_id];
            bloque_indirecto.ocupado = true;
            this.bitmap_bloques[bloque_ind_id] = true;
          }
          
          if (!bloque_indirecto.punteros) {
            bloque_indirecto.punteros = new Array(256).fill(-1);
          }
          bloque_indirecto.punteros[i - 12] = bloque_id;
        }
        
        this.bloques[bloque_id].ocupar();
        this.bitmap_bloques[bloque_id] = true;
        inodo.bloques_usados++;
      }

      this.bitmap_inodos[inodo_id] = true;
      this.actualizarSuperbloque();
      this.registrarOperacion('crear', nombre, tamano_bytes, inodo_id);

      return inodo_id;
      
    } catch (error) {
      console.error('Error al crear archivo:', (error as Error).message);
      return -1;
    }
  }

  eliminar_archivo(inodo_id: number): number {
    try {
      if (inodo_id < 0 || inodo_id >= NUM_INODOS) {
        throw new Error('ID de inodo inválido');
      }

      const inodo = this.inodos[inodo_id];
      
      if (!inodo.en_uso) {
        throw new Error('El inodo no está en uso');
      }

      const nombre = inodo.nombre;

      for (let i = 0; i < inodo.punteros_directos.length; i++) {
        const bloque_id = inodo.punteros_directos[i];
        if (bloque_id !== -1) {
          this.bloques[bloque_id].liberar();
          this.bitmap_bloques[bloque_id] = false;
        }
      }

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
        
        bloque_ind.liberar();
        this.bitmap_bloques[inodo.puntero_indirecto] = false;
      }

      inodo.liberar();
      this.bitmap_inodos[inodo_id] = false;
      this.actualizarSuperbloque();
      this.registrarOperacion('eliminar', nombre, 0, inodo_id);

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
    return this.inodos
      .filter(inodo => inodo.en_uso)
      .map(inodo => {
        const bloqueIndirecto = inodo.puntero_indirecto !== -1 
          ? this.bloques[inodo.puntero_indirecto] as any as BloqueIndirecto
          : null;
        
        const bloques = inodo.obtenerBloques(bloqueIndirecto);
        const fragmentado = bloques.length > 1 && bloques.some((b, i) => i > 0 && b !== bloques[i-1] + 1);
        
        return {
          id: inodo.id,
          nombre: inodo.nombre,
          tamano_kb: (inodo.tamano / 1024).toFixed(2),
          tamano_bytes: inodo.tamano,
          bloques: bloques.join(', '),
          num_bloques: inodo.bloques_usados,
          fragmentado,
          fecha_creacion: inodo.fecha_creacion?.toLocaleString('es-ES') ?? 'N/A'
        };
      });
  }

  /**
   * d) Función calcular_fragmentacion
   * Retorna porcentaje de fragmentación del disco
   */
  calcular_fragmentacion(): number {
    const archivosConBloques = this.inodos
      .filter(inodo => inodo.en_uso && inodo.bloques_usados > 1)
      .map(inodo => {
        const bloqueIndirecto = inodo.puntero_indirecto !== -1 
          ? this.bloques[inodo.puntero_indirecto] as any as BloqueIndirecto
          : null;
        return inodo.obtenerBloques(bloqueIndirecto);
      });

    if (archivosConBloques.length === 0) return 0;

    const bloques_totales_usados = archivosConBloques.reduce((sum, bloques) => sum + bloques.length, 0);
    const bloques_no_contiguos = archivosConBloques.reduce((sum, bloques) => {
      return sum + bloques.filter((b, i) => i > 0 && b !== bloques[i-1] + 1).length;
    }, 0);

    return parseFloat(((bloques_no_contiguos / bloques_totales_usados) * 100).toFixed(2));
  }

  /**
   * e) Función mostrar_estado_disco
   * Visualización gráfica del disco
   */
  mostrar_estado_disco(): EstadoDisco[] {
    return this.bloques.map((bloque, i) => {
      if (!bloque.ocupado) {
        return { id: i, tipo: 'libre' as const, archivo: null };
      }

      for (const inodo of this.inodos) {
        if (!inodo.en_uso) continue;

        if (inodo.punteros_directos.includes(i)) {
          return { id: i, tipo: 'ocupado' as const, archivo: inodo.nombre };
        }

        if (inodo.puntero_indirecto === i) {
          return { id: i, tipo: 'indirecto' as const, archivo: inodo.nombre };
        }

        if (inodo.puntero_indirecto !== -1) {
          const bloque_ind = this.bloques[inodo.puntero_indirecto];
          if (bloque_ind.punteros?.includes(i)) {
            return { id: i, tipo: 'ocupado' as const, archivo: inodo.nombre };
          }
        }
      }

      return { id: i, tipo: 'ocupado' as const, archivo: 'Sistema' };
    });
  }

  /**
   * Métodos auxiliares
   */
  
  buscarInodoLibre(): number {
    return this.bitmap_inodos.findIndex(ocupado => !ocupado);
  }

  buscarBloqueLibre(): number {
    return this.bitmap_bloques.findIndex(ocupado => !ocupado);
  }

  buscarBloquesLibres(cantidad: number): number[] {
    const inicio = performance.now();
    const bloques: number[] = [];
    
    for (let i = 0; i < this.bitmap_bloques.length && bloques.length < cantidad; i++) {
      if (!this.bitmap_bloques[i]) {
        bloques.push(i);
      }
    }
    
    const fin = performance.now();
    this.ultimoTiempoBusqueda = fin - inicio;
    
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
    
    // Contar archivos que usan puntero indirecto
    const archivosConIndirecto = this.inodos.filter(i => i.en_uso && i.puntero_indirecto !== -1).length;
    
    return {
      operacion: this.operacionActual,
      archivos_activos: archivos.length,
      bloques_ocupados: stats.bloques_usados,
      fragmentacion: stats.fragmentacion,
      inodos_libres: stats.inodos_libres,
      bloques_libres: stats.bloques_libres,
      archivos: archivos,
      timestamp: new Date(),
      tiempo_busqueda_ms: this.ultimoTiempoBusqueda,
      archivos_con_indirecto: archivosConIndirecto
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
    this.ultimoTiempoBusqueda = 0;
  }
}
