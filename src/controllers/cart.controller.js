import Cart from '../models/cart.model.js';
import { getProductById, checkProductStock } from '../services/product.service.js';

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { productId, quantity = 1 } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // Find or create cart first
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    // Calculate total quantity needed
    const currentQuantityInCart = existingItemIndex > -1 
      ? cart.items[existingItemIndex].quantity 
      : 0;
    const newTotalQuantity = currentQuantityInCart + quantity;

    // Check stock with total quantity
    const stockCheck = await checkProductStock(productId, newTotalQuantity, token);
    
    if (!stockCheck.available) {
      return res.status(400).json({ 
        success: false, 
        message: stockCheck.message || 'Product out of stock or insufficient quantity'
      });
    }

    const product = stockCheck.product;

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity = newTotalQuantity;
      cart.items[existingItemIndex].price = product.price;
    } else {
      // Add new item
      cart.items.push({
        productId: product._id || productId,
        quantity,
        price: product.price,
        productName: product.title || product.name,
        productImage: product.images?.[0] || product.image
      });
    }

    await cart.save();

    res.json({ 
      success: true, 
      message: 'Product added to cart', 
      cart 
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quantity must be at least 1' 
      });
    }

    // Check stock availability
    const stockCheck = await checkProductStock(productId, quantity, token);
    
    if (!stockCheck.available) {
      return res.status(400).json({ 
        success: false, 
        message: stockCheck.message || 'Insufficient stock available'
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found in cart' 
      });
    }

    const product = stockCheck.product;
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price;
    await cart.save();

    res.json({ 
      success: true, 
      message: 'Cart updated successfully', 
      cart 
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );
    await cart.save();

    res.json({ 
      success: true, 
      message: 'Product removed from cart', 
      cart 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ 
      success: true, 
      message: 'Cart cleared successfully', 
      cart 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all carts
export const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find();
    res.json({ success: true, count: carts.length, carts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get specific user's cart
export const getUserCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
