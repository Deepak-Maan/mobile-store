/**
 * Currency utility for AURA Mobile Store
 * All product prices in db.json are stored directly in INR (Indian Rupees).
 * No conversion needed — these functions just format the raw INR value.
 */

/**
 * Formats an INR price and returns a formatted string with ₹ symbol.
 * e.g. formatINR(93415) → "₹93,415"
 * @param {number} inr - Price in INR
 * @returns {string} Formatted INR price string
 */
export const formatINR = (inr) => {
  const rounded = Math.round(Number(inr) || 0);
  return '₹' + rounded.toLocaleString('en-IN');
};

/**
 * Returns the raw INR number (for payment/UPI flows).
 * @param {number} inr
 * @returns {number}
 */
export const toINR = (inr) => Math.round(Number(inr) || 0);
