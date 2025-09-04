/**
 * Comprehensive card data validation utilities
 */

export const CARD_TYPES = {
  TEXT: 'text',
  STATUS: 'status',
  INFO: 'info',
  CHART: 'chart',
  METRIC: 'metric',
  IMAGE: 'image'
};

export const REQUIRED_FIELDS = {
  BASE: ['id', 'type'],
  TEXT: ['title', 'content'],
  STATUS: ['title', 'status'],
  INFO: ['title'],
  CHART: ['title', 'data'],
  METRIC: ['title', 'value'],
  IMAGE: ['title', 'imageUrl']
};

export const OPTIONAL_FIELDS = {
  TEXT: ['description'],
  STATUS: ['message'],
  INFO: ['content', 'items'],
  CHART: ['chartType'],
  METRIC: ['unit', 'description'],
  IMAGE: ['alt', 'description']
};

/**
 * Validates a card object structure
 * @param {Object} card - The card object to validate
 * @returns {Object} Validation result with isValid, errors, and warnings
 */
export function validateCard(card) {
  console.log('🔍 VALIDATION: Starting card validation for:', card);
  
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    cardType: null,
    missingFields: [],
    extraFields: [],
    fieldTypes: {}
  };

  // Basic null/undefined check
  if (!card) {
    result.isValid = false;
    result.errors.push('Card is null or undefined');
    console.error('❌ VALIDATION: Card is null or undefined');
    return result;
  }

  // Type check
  if (typeof card !== 'object' || Array.isArray(card)) {
    result.isValid = false;
    result.errors.push(`Card must be an object, got ${Array.isArray(card) ? 'array' : typeof card}`);
    console.error('❌ VALIDATION: Card is not a plain object:', typeof card, Array.isArray(card));
    return result;
  }

  // Check required base fields
  REQUIRED_FIELDS.BASE.forEach(field => {
    if (!(field in card)) {
      result.isValid = false;
      result.errors.push(`Missing required base field: ${field}`);
      result.missingFields.push(field);
    } else if (card[field] === null || card[field] === undefined) {
      result.isValid = false;
      result.errors.push(`Base field ${field} is null or undefined`);
    } else {
      result.fieldTypes[field] = typeof card[field];
    }
  });

  // If no type, can't continue with type-specific validation
  if (!card.type) {
    console.error('❌ VALIDATION: No type field, cannot continue validation');
    return result;
  }

  // Normalize and validate card type
  const cardType = card.type.toLowerCase();
  result.cardType = cardType;

  if (!Object.values(CARD_TYPES).includes(cardType)) {
    result.isValid = false;
    result.errors.push(`Unknown card type: ${card.type}. Valid types: ${Object.values(CARD_TYPES).join(', ')}`);
    console.error('❌ VALIDATION: Unknown card type:', card.type);
    return result;
  }

  // Type-specific validation
  const typeKey = cardType.toUpperCase();
  const requiredFields = REQUIRED_FIELDS[typeKey] || [];
  const optionalFields = OPTIONAL_FIELDS[typeKey] || [];

  console.log('🔍 VALIDATION: Validating type-specific fields for', cardType);
  console.log('🔍 VALIDATION: Required fields:', requiredFields);
  console.log('🔍 VALIDATION: Optional fields:', optionalFields);

  // Check required type-specific fields
  requiredFields.forEach(field => {
    if (!(field in card)) {
      result.isValid = false;
      result.errors.push(`Missing required field for ${cardType} card: ${field}`);
      result.missingFields.push(field);
    } else if (card[field] === null || card[field] === undefined) {
      result.warnings.push(`Field ${field} is null or undefined for ${cardType} card`);
    } else {
      result.fieldTypes[field] = typeof card[field];
    }
  });

  // Log all available fields vs expected
  const allExpectedFields = [...REQUIRED_FIELDS.BASE, ...requiredFields, ...optionalFields];
  const cardFields = Object.keys(card);
  
  result.extraFields = cardFields.filter(field => !allExpectedFields.includes(field));
  
  if (result.extraFields.length > 0) {
    result.warnings.push(`Extra fields found: ${result.extraFields.join(', ')}`);
  }

  // Type-specific content validation
  switch (cardType) {
    case CARD_TYPES.TEXT:
      if (card.content && typeof card.content !== 'string') {
        result.warnings.push('Text card content should be a string');
      }
      break;
      
    case CARD_TYPES.INFO:
      if (card.items && !Array.isArray(card.items)) {
        result.warnings.push('Info card items should be an array');
      }
      break;
      
    case CARD_TYPES.CHART:
      if (card.data && !Array.isArray(card.data)) {
        result.errors.push('Chart card data must be an array');
        result.isValid = false;
      } else if (card.data && card.data.some(item => typeof item !== 'number')) {
        result.warnings.push('Chart data should contain only numbers');
      }
      break;
      
    case CARD_TYPES.METRIC:
      if (card.value !== undefined && typeof card.value !== 'number' && typeof card.value !== 'string') {
        result.warnings.push('Metric card value should be a number or string');
      }
      break;
      
    case CARD_TYPES.STATUS:
      const validStatuses = ['online', 'offline', 'active', 'inactive', 'success', 'error', 'warning', 'pending'];
      if (card.status && !validStatuses.includes(card.status.toLowerCase())) {
        result.warnings.push(`Status "${card.status}" is not a common status value. Common values: ${validStatuses.join(', ')}`);
      }
      break;
      
    case CARD_TYPES.IMAGE:
      if (card.imageUrl && typeof card.imageUrl !== 'string') {
        result.errors.push('Image card imageUrl must be a string');
        result.isValid = false;
      }
      break;
  }

  console.log('🔍 VALIDATION: Validation complete. Result:', result);
  
  return result;
}

/**
 * Logs detailed card analysis
 */
export function logCardAnalysis(card, context = '') {
  console.log(`🔍 ANALYSIS: ${context} Card Analysis:`, {
    card: card,
    type: typeof card,
    isNull: card === null,
    isUndefined: card === undefined,
    isArray: Array.isArray(card),
    keys: card ? Object.keys(card) : null,
    values: card ? Object.values(card) : null,
    stringified: JSON.stringify(card),
    validation: validateCard(card)
  });
}

/**
 * Creates a detailed props report
 */
export function logPropsFlow(componentName, props, additionalContext = {}) {
  console.log(`📡 PROPS: ========== ${componentName} Props Flow ==========`);
  console.log(`📡 PROPS: Component: ${componentName}`);
  console.log(`📡 PROPS: Props object:`, props);
  console.log(`📡 PROPS: Props keys:`, Object.keys(props || {}));
  console.log(`📡 PROPS: Additional context:`, additionalContext);
  
  if (props && props.card) {
    logCardAnalysis(props.card, `${componentName} card prop`);
  }
  
  console.log(`📡 PROPS: ========== End ${componentName} Props Flow ==========`);
}

export default {
  validateCard,
  logCardAnalysis,
  logPropsFlow,
  CARD_TYPES,
  REQUIRED_FIELDS,
  OPTIONAL_FIELDS
};