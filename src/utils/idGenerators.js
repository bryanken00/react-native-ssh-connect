/**
 * ID Generation Utilities
 * Generates business identifiers for various entities
 */

/**
 * Generate a Z-Session ID
 * Format: Z-{timestamp}-{random}
 * @returns {string} Z-Session ID
 */
export const generateZId = () => {
  return `Z-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate an X-Reading ID
 * Format: X-{timestamp}-{random}
 * @returns {string} X-Reading ID
 */
export const generateXId = () => {
  return `X-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate a Transaction ID
 * Format: TX-{timestamp}-{random}
 * @returns {string} Transaction ID
 */
export const generateTransactionId = () => {
  return `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate a generic ID with custom prefix
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Generated ID
 */
export const generateId = (prefix = "ID") => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
