/**
 * Configuración y constantes del sistema de archivos Ext
 */

// Parámetros del sistema
export const BLOCK_SIZE: number = 1024; // 1 KB en bytes
export const NUM_INODOS: number = 32;
export const NUM_BLOQUES: number = 128;
export const PUNTEROS_DIRECTOS: number = 12;
export const PUNTEROS_POR_BLOQUE_INDIRECTO: number = 256;

// Tamaños máximos
export const MAX_FILENAME_LENGTH: number = 32;
export const MAX_BLOQUES_POR_ARCHIVO: number = PUNTEROS_DIRECTOS + PUNTEROS_POR_BLOQUE_INDIRECTO; // 268 bloques
export const MAX_FILE_SIZE: number = MAX_BLOQUES_POR_ARCHIVO * BLOCK_SIZE; // 274,432 bytes (~268 KB)
