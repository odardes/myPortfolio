/**
 * Application-wide constants
 */

export const STORAGE_KEYS = {
  INVESTMENTS: 'portfolio-investments',
  FUND_VALUES: 'portfolio-fund-current-values',
} as const;

export const DELAYS = {
  SPINNER_MINIMUM: 500,
  DEBOUNCE_SEARCH: 300,
  SAVE_OPERATION: 500,
} as const;

export const VALIDATION_LIMITS = {
  FUND_NAME_MIN: 2,
  FUND_NAME_MAX: 100,
  NOTES_MAX: 500,
  AMOUNT_MIN: 0.01,
  AMOUNT_MAX: 999999999,
  PRICE_MAX: 999999999,
  CURRENT_VALUE_MAX: 999999999,
} as const;

export const DATE_FORMAT = {
  DISPLAY: 'dd MMM yyyy',
  INPUT: 'yyyy-MM-dd',
} as const;
