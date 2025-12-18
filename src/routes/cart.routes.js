import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart,
  getAllCarts,
  getUserCart
} from '../controllers/cart.controller.js';
import { authenticateUser, authenticateRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// User routes
router.get('/', authenticateUser, getCart);
router.post('/add', authenticateUser, addToCart);
router.put('/update/:productId', authenticateUser, updateCartItem);
router.delete('/remove/:productId', authenticateUser, removeFromCart);
router.delete('/clear', authenticateUser, clearCart);

// Admin routes
router.get('/all', authenticateRole(['admin']), getAllCarts);
router.get('/user/:userId', authenticateRole(['admin']), getUserCart);

export default router;
