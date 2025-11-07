import { NUM_INODOS, NUM_BLOQUES, PUNTEROS_DIRECTOS, BLOCK_SIZE } from '../config/constants';

/**
 * Estructura del Superbloque
 */
export class Superbloque {
  num_inodos: number;
  num_bloques: number;
  inodos_libres: number;
  bloques_libres: number;
  tamano_bloque: number;

  constructor() {
    this.num_inodos = NUM_INODOS;          // 32
    this.num_bloques = NUM_BLOQUES;        // 128
    this.inodos_libres = NUM_INODOS;       // Contador dinámico
    this.bloques_libres = NUM_BLOQUES;     // Contador dinámico
    this.tamano_bloque = BLOCK_SIZE;       // 1024 bytes
  }

  /**
   * Actualiza los contadores de recursos libres
   */
  actualizarContadores(inodos_usados: number, bloques_usados: number): void {
    this.inodos_libres = this.num_inodos - inodos_usados;
    this.bloques_libres = this.num_bloques - bloques_usados;
  }
}

/**
 * Estructura del Inodo
 */
export class Inodo {
  id: number;
  nombre: string;
  tamano: number;
  bloques_usados: number;
  punteros_directos: number[];
  puntero_indirecto: number;
  en_uso: boolean;
  fecha_creacion: Date | null;

  constructor(id: number = 0) {
    this.id = id;                                    // 0-31
    this.nombre = '';                                // Nombre del archivo (máx 32 caracteres)
    this.tamano = 0;                                 // Tamaño en bytes
    this.bloques_usados = 0;                         // Número de bloques asignados
    this.punteros_directos = new Array(PUNTEROS_DIRECTOS).fill(-1); // 12 punteros (0-127)
    this.puntero_indirecto = -1;                     // Bloque con más punteros
    this.en_uso = false;                             // true/false
    this.fecha_creacion = null;                      // Timestamp
  }

  /**
   * Verifica si el inodo está libre
   */
  estaLibre(): boolean {
    return !this.en_uso;
  }

  /**
   * Marca el inodo como usado y asigna nombre
   */
  asignar(nombre: string): void {
    this.en_uso = true;
    this.nombre = nombre;
    this.fecha_creacion = new Date();
  }

  /**
   * Libera el inodo y resetea sus valores
   */
  liberar(): void {
    this.nombre = '';
    this.tamano = 0;
    this.bloques_usados = 0;
    this.punteros_directos = new Array(PUNTEROS_DIRECTOS).fill(-1);
    this.puntero_indirecto = -1;
    this.en_uso = false;
    this.fecha_creacion = null;
  }

  /**
   * Agrega un bloque al inodo
   */
  agregarBloque(bloque_id: number): boolean {
    // Primero intentar usar punteros directos
    for (let i = 0; i < PUNTEROS_DIRECTOS; i++) {
      if (this.punteros_directos[i] === -1) {
        this.punteros_directos[i] = bloque_id;
        this.bloques_usados++;
        return true;
      }
    }
    // Si no hay espacio en directos, retornar false (indirecto se maneja aparte)
    return false;
  }

  /**
   * Obtiene todos los bloques asignados (directos + indirectos)
   */
  obtenerBloques(bloqueIndirecto: BloqueIndirecto | null = null): number[] {
    const bloques = this.punteros_directos.filter(b => b !== -1);
    
    if (this.puntero_indirecto !== -1 && bloqueIndirecto) {
      const bloquesIndirectos = bloqueIndirecto.punteros.filter(b => b !== -1);
      bloques.push(...bloquesIndirectos);
    }
    
    return bloques;
  }
}

/**
 * Estructura del Bloque de Datos
 */
export class Bloque {
  id: number;
  datos: number[];
  ocupado: boolean;
  punteros?: number[]; // Para bloques indirectos

  constructor(id: number = 0) {
    this.id = id;
    this.datos = new Array(BLOCK_SIZE).fill(0);  // 1024 bytes
    this.ocupado = false;                         // true/false
  }

  /**
   * Marca el bloque como ocupado
   */
  ocupar(): void {
    this.ocupado = true;
  }

  /**
   * Libera el bloque
   */
  liberar(): void {
    this.datos = new Array(BLOCK_SIZE).fill(0);
    this.ocupado = false;
    if (this.punteros) {
      delete this.punteros;
    }
  }

  /**
   * Escribe datos en el bloque
   */
  escribir(datos: number[]): void {
    this.datos = datos;
    this.ocupado = true;
  }
}

/**
 * Bloque Indirecto - contiene punteros a otros bloques
 */
export class BloqueIndirecto {
  id: number;
  punteros: number[];
  ocupado: boolean;

  constructor(id: number = 0) {
    this.id = id;
    this.punteros = new Array(256).fill(-1); // 256 punteros adicionales
    this.ocupado = false;
  }

  /**
   * Agrega un puntero al bloque indirecto
   */
  agregarPuntero(bloque_id: number): boolean {
    for (let i = 0; i < this.punteros.length; i++) {
      if (this.punteros[i] === -1) {
        this.punteros[i] = bloque_id;
        return true;
      }
    }
    return false; // No hay espacio
  }

  /**
   * Libera el bloque indirecto
   */
  liberar(): void {
    this.punteros = new Array(256).fill(-1);
    this.ocupado = false;
  }
}
