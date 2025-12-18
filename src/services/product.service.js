import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const getProductById = async (productId, token) => {
  try {
    const response = await axios.get(
      `${process.env.PRODUCT_SERVICE_URL}/${productId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    // Handle response structure: { success: true, data: [...] }
    if (response.data && response.data.success && response.data.data) {
      // If data is an array, return the first item
      if (Array.isArray(response.data.data)) {
        return response.data.data[0];
      }
      // If data is an object, return it directly
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Product not found');
  }
};

export const validateProducts = async (productIds, token) => {
  try {
    const promises = productIds.map(id => getProductById(id, token));
    return await Promise.all(promises);
  } catch (error) {
    throw error;
  }
};

/**
 * Checks if a product has enough stock to fulfill an order
 * @param {string} productId - The ID of the product to check
 * @param {number} quantity - The quantity of the product to order
 * @param {string} token - The authentication token to use when making the request
 * @returns {Promise<Object>} A promise that resolves to an object containing a boolean indicating if the product is available and the product itself
 */
export const checkProductStock = async (productId, quantity, token) => {
  try {
    const product = await getProductById(productId, token);
    
    if (!product) {
      return { 
        available: false, 
        product: null,
        message: 'Product not found'
      };
    }
    
    // Check stock field (not inStock boolean)
    if (!product.stock || product.stock < quantity) {
      return { 
        available: false, 
        product,
        message: `Insufficient stock. Available: ${product.stock || 0}, Requested: ${quantity}`
      };
    }
    
    return { 
      available: true, 
      product,
      message: 'Stock available'
    };
  } catch (error) {
    throw error;
  }
};
