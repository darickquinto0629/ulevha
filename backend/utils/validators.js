/**
 * Centralized validation utilities
 */

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate age from date of birth
 * @param {string|Date} dateOfBirth 
 * @returns {number}
 */
export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Validate password strength
 * @param {string} password 
 * @returns {{valid: boolean, message?: string}}
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true };
}

/**
 * Sanitize string input (trim and handle null/undefined)
 * @param {any} value 
 * @returns {string}
 */
export function sanitizeString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

/**
 * Get age range SQL condition for filtering
 * @param {string} ageGroup 
 * @returns {string|null}
 */
export function getAgeRangeCondition(ageGroup) {
  const ageCalc = "CAST((julianday('now') - julianday(date_of_birth)) / 365.25 AS INTEGER)";
  const ageRanges = {
    '0-17': `(${ageCalc} >= 0 AND ${ageCalc} <= 17)`,
    '18-30': `(${ageCalc} >= 18 AND ${ageCalc} <= 30)`,
    '31-45': `(${ageCalc} >= 31 AND ${ageCalc} <= 45)`,
    '46-59': `(${ageCalc} >= 46 AND ${ageCalc} <= 59)`,
    '60+': `(${ageCalc} >= 60)`,
  };
  return ageRanges[ageGroup] || null;
}
