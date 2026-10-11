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
 * Generate a prefilled WhatsApp direct ordering URL
 * @param {Object} product
 * @returns {string}
 */
export function getWhatsAppOrderUrl(product) {
  const message =
    `Hello Theethrealpalatte! 🌸\n\n` +
    `I would like to place an order for:\n` +
    `• Product: ${product.name}\n` +
    `• Category: ${product.type}\n` +
    `• Price: ₹${product.price.toLocaleString("en-IN")}\n\n` +
    `Please let me know how I can proceed with payment and delivery. Thank you! ♡`;

  return `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
