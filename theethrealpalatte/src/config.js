// Business configuration for Theethrealpalatte
// Uses the existing business credentials configured in the website code
export const BUSINESS_CONFIG = {
  // Existing business WhatsApp number from codebase (India +91 8088645598)
  whatsappNumber: "918088645598",
  email: "theethrealpalatte@gmail.com",
  instagramHandle: "@_theethrealpalatte_",
  instagramUrl: "https://www.instagram.com/_theethrealpalatte_/",
};

/**
 * Generate a prefilled WhatsApp enquiry URL for a single product
 * @param {Object} product
 * @param {number} quantity
 * @returns {string}
 */
export function getWhatsAppOrderUrl(product, quantity = 1) {
  const unitPrice = Number(product.price) || 0;
  const priceText = quantity > 1 ? `₹${unitPrice.toLocaleString("en-IN")} each` : `₹${unitPrice.toLocaleString("en-IN")}`;
  const total = unitPrice * quantity;

  const message =
    `Hello Theethrealpalatte!\n\n` +
    `I would like to enquire about this product:\n\n` +
    `1. ${product.name}\n` +
    `   Quantity: ${quantity}\n` +
    `   Price: ${priceText}\n\n` +
    `Estimated total: ₹${total.toLocaleString("en-IN")}\n\n` +
    `Please let me know the availability and further details.\n\n` +
    `Thank you!`;

  return `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

