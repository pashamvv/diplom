const asNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isInactiveFlag = (value) => {
  if (value === false || value === 0) return true;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'false' || normalized === '0' || normalized === 'inactive';
  }

  return false;
};

const parseDateValue = (value, endOfDay = false) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        endOfDay ? 23 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 999 : 0
      );
    }

    const ruMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
    if (ruMatch) {
      const [, day, month, year] = ruMatch;
      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        endOfDay ? 23 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 999 : 0
      );
    }

    const parsed = new Date(trimmed);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
  }

  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
};

export const toDateInputValue = (value) => {
  const parsed = parseDateValue(value);
  if (!parsed) return '';

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return [value];
  return [];
};

const firstPositiveNumber = (...values) => {
  for (const value of values) {
    const parsed = asNumber(value);
    if (parsed > 0) {
      return parsed;
    }
  }

  return 0;
};

export const isDiscountActive = (discount) => {
  if (!discount) return false;
  if (isInactiveFlag(discount.is_active)) return false;

  const now = new Date();
  const start = parseDateValue(discount.start_date, false);
  const end = parseDateValue(discount.end_date, true);

  if (start && now < start) {
    return false;
  }

  if (end && now > end) {
    return false;
  }

  return true;
};

export const getDiscountPercent = (product, discounts = []) => {
  const directDiscountCandidates = [
    product?.discount_percent,
    product?.discount,
    product?.sale_percent,
    product?.active_discount_percent,
    product?.discount?.discount_percent,
    product?.discount?.percent,
    product?.active_discount?.discount_percent,
    product?.active_discount?.percent,
  ];

  const directDiscount = Math.max(
    ...directDiscountCandidates.map((candidate) => asNumber(candidate)),
    0
  );

  if (directDiscount > 0) {
    return Math.min(directDiscount, 100);
  }

  const explicitBasePrice = firstPositiveNumber(
    product?.original_price,
    product?.old_price,
    product?.base_price,
    product?.price
  );
  const explicitFinalPrice = firstPositiveNumber(
    product?.final_price,
    product?.discounted_price,
    product?.price_with_discount,
    product?.current_price
  );

  if (explicitBasePrice > 0 && explicitFinalPrice > 0 && explicitFinalPrice < explicitBasePrice) {
    return Math.min(
      Math.round(((explicitBasePrice - explicitFinalPrice) / explicitBasePrice) * 100),
      100
    );
  }

  const productId = Number(product?.id);
  const relatedDiscounts = [
    ...asArray(product?.discounts),
    ...asArray(product?.active_discounts),
    ...asArray(product?.active_discount),
    ...asArray(product?.discount_data),
    ...asArray(product?.discount_info),
    ...discounts,
  ];

  const activeDiscounts = relatedDiscounts.filter((discount) => {
    if (!discount || !isDiscountActive(discount)) {
      return false;
    }

    if (!productId) {
      return true;
    }

    const discountProductId = Number(
      discount?.product_id ?? discount?.product?.id ?? discount?.productId
    );

    return !discountProductId || discountProductId === productId;
  });

  if (!activeDiscounts.length) {
    return 0;
  }

  return Math.min(
    Math.max(
      ...activeDiscounts.map((discount) => asNumber(discount?.discount_percent))
    ),
    100
  );
};

export const getDiscountedPrice = (price, discountPercent) => {
  const basePrice = asNumber(price);
  const safeDiscount = Math.min(Math.max(asNumber(discountPercent), 0), 100);

  if (!safeDiscount) {
    return basePrice;
  }

  return Math.max(basePrice * (1 - safeDiscount / 100), 0);
};

export const getProductPricing = (product, discounts = []) => {
  const basePrice = firstPositiveNumber(
    product?.original_price,
    product?.old_price,
    product?.base_price,
    product?.price
  );
  const explicitFinalPrice = firstPositiveNumber(
    product?.final_price,
    product?.discounted_price,
    product?.price_with_discount,
    product?.current_price
  );
  const discountPercent = getDiscountPercent(product, discounts);
  const calculatedFinalPrice = getDiscountedPrice(basePrice, discountPercent);
  const finalPrice =
    explicitFinalPrice > 0 && explicitFinalPrice < basePrice
      ? explicitFinalPrice
      : calculatedFinalPrice;

  return {
    basePrice,
    discountPercent,
    finalPrice,
    hasDiscount: discountPercent > 0 && finalPrice < basePrice,
  };
};

export const hasEmbeddedDiscountData = (product) => {
  if (!product) return false;

  if (
    firstPositiveNumber(
      product?.discount_percent,
      product?.sale_percent,
      product?.active_discount_percent,
      product?.discount?.discount_percent,
      product?.active_discount?.discount_percent
    ) > 0
  ) {
    return true;
  }

  if (
    asArray(product?.discounts).length > 0 ||
    asArray(product?.active_discounts).length > 0 ||
    asArray(product?.active_discount).length > 0
  ) {
    return true;
  }

  const basePrice = firstPositiveNumber(
    product?.original_price,
    product?.old_price,
    product?.base_price,
    product?.price
  );
  const finalPrice = firstPositiveNumber(
    product?.final_price,
    product?.discounted_price,
    product?.price_with_discount,
    product?.current_price
  );

  return basePrice > 0 && finalPrice > 0 && finalPrice < basePrice;
};
