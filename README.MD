# Cart Service

A microservice for managing shopping carts in an e-commerce application. Built with Node.js, Express, and MongoDB.

## Features

- ✅ Add products to cart
- ✅ Update product quantities
- ✅ Remove products from cart
- ✅ Clear entire cart
- ✅ Stock validation before adding items
- ✅ Automatic total calculation
- ✅ User-specific cart management
- ✅ Admin endpoints for viewing all carts
- ✅ JWT authentication integration
- ✅ Integration with Auth Service and Product Service

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Axios** - HTTP client for service communication
- **JWT** - Authentication

## Prerequisites

- Node.js v18+
- MongoDB
- Auth Service running
- Product Service running

## Installation

### 1. Clone and Install Dependencies

```bash
cd cart-service
npm install
```

### 2. Environment Variables

Create `.env` file:

```env
PORT=3003
MONGODB_URI=mongodb://localhost:27017/cart-service
AUTH_SERVICE_URL=http://localhost:5000/api/auth
PRODUCT_SERVICE_URL=http://localhost:3000/api/products
NODE_ENV=development
```

### 3. Run the Service

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### User Endpoints

#### Get Cart
```http
GET /api/cart
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "cart": {
    "_id": "cart_id",
    "userId": "user_id",
    "items": [
      {
        "productId": "product_id",
        "productName": "Product Name",
        "quantity": 2,
        "price": 1000
      }
    ],
    "totalAmount": 2000,
    "totalItems": 2
  }
}
```

#### Add Product to Cart
```http
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product added to cart",
  "cart": { ... }
}
```

#### Update Cart Item
```http
PUT /api/cart/update/:productId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 5
}
```

#### Remove Product from Cart
```http
DELETE /api/cart/remove/:productId
Authorization: Bearer <token>
```

#### Clear Cart
```http
DELETE /api/cart/clear
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get All Carts
```http
GET /api/cart/all
Authorization: Bearer <admin_token>
```

#### Get User Cart
```http
GET /api/cart/user/:userId
Authorization: Bearer <admin_token>
```

## Service Integration

### Authentication Flow

1. Client sends request with JWT token
2. Cart Service validates token with Auth Service
3. If valid, processes the cart operation

### Product Validation Flow

1. When adding/updating items, Cart Service calls Product Service
2. Validates product exists and has sufficient stock
3. Stores product details (name, price, image) for quick access

## Data Models

### Cart Schema

```javascript
{
  userId: String (required, unique),
  items: [
    {
      productId: String (required),
      quantity: Number (required, min: 1),
      price: Number (required),
      productName: String,
      productImage: String
    }
  ],
  totalAmount: Number (calculated),
  totalItems: Number (calculated),
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

| Error | Status Code | Description |
|-------|-------------|-------------|
| No token provided | 401 | Missing authentication token |
| Invalid token | 401 | Token verification failed |
| Access denied | 403 | Insufficient role permissions |
| Product ID required | 400 | Missing required field |
| Product not found | 500 | Product doesn't exist |
| Insufficient stock | 400 | Not enough stock available |
| Cart not found | 404 | Cart doesn't exist |

## Testing

### Manual Testing with cURL

```bash
TOKEN="your_jwt_token"

# Get cart
curl -X GET http://localhost:3003/api/cart \
  -H "Authorization: Bearer $TOKEN"

# Add product
curl -X POST http://localhost:3003/api/cart/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"product_id","quantity":2}'

# Update quantity
curl -X PUT http://localhost:3003/api/cart/update/product_id \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity":5}'

# Remove item
curl -X DELETE http://localhost:3003/api/cart/remove/product_id \
  -H "Authorization: Bearer $TOKEN"

# Clear cart
curl -X DELETE http://localhost:3003/api/cart/clear \
  -H "Authorization: Bearer $TOKEN"
```

## Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3003

CMD ["node", "src/server.js"]
```

### Docker Compose Integration

```yaml
cart-service:
  build: ./cart-service
  container_name: cart-service
  ports:
    - "3003:3003"
  environment:
    - MONGODB_URI=mongodb://mongo-cart:27017/cart-db
    - AUTH_SERVICE_URL=http://auth-service:5000/api/auth
    - PRODUCT_SERVICE_URL=http://products-service:3000/api/products
  depends_on:
    - mongo-cart
    - auth-service
    - products-service
  networks:
    - microservices-net
```

## Project Structure

```
cart-service/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   └── cart.model.js
│   ├── controllers/
│   │   └── cart.controller.js
│   ├── routes/
│   │   └── cart.routes.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── services/
│   │   └── product.service.js
│   └── server.js
├── .env
├── .dockerignore
├── Dockerfile
├── package.json
└── README.md
```

## Best Practices

1. **Stock Validation**: Always check product availability before adding to cart
2. **Price Storage**: Store product price at time of adding to cart
3. **Auto Calculation**: Totals are calculated automatically via Mongoose middleware
4. **Error Logging**: All errors are logged for debugging
5. **Cart Persistence**: Carts persist across sessions using MongoDB

## Common Issues

### Issue: "Product not found"
- Ensure Product Service is running
- Verify product ID is correct
- Check Product Service URL in environment variables

### Issue: "Insufficient stock"
- Product stock is validated in real-time
- Check product stock in Product Service
- Reduce quantity or wait for restock

### Issue: "Unauthorized"
- Ensure JWT token is valid
- Check Auth Service is running
- Verify token hasn't expired

## Health Check

```bash
curl http://localhost:3003/health
```

**Response:**
```json
{
  "status": "OK",
  "service": "Cart Service",
  "timestamp": "2025-12-18T10:30:00.000Z"
}
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT

## Contact

For issues and questions, please open an issue in the repository.