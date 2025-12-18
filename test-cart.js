// test-cart.js
import axios from 'axios';

const BASE_URL = 'http://localhost:3003/api/cart';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDJjM2MwZDQxMzRhNWUxMzEzZWQ2NSIsImVtYWlsIjoiam9vYUBnbWFpbC5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjU5ODM1NDMsImV4cCI6MTc2NjA2OTk0M30.Bwe9Ck1Oxrif-2K6toqSPWPZQBLQ3Q9t9mb5o1u3Wdk';
const PRODUCT_ID = '693cada6a3e069fe8f1bbe9a';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

async function testCart() {
  try {
    // 1. Get Cart
    console.log('1. Getting cart...');
    let res = await axios.get(BASE_URL, { headers });
    console.log('Cart:', res.data);

    // 2. Add Product
    console.log('\n2. Adding product...');
    res = await axios.post(`${BASE_URL}/add`, {
      productId: PRODUCT_ID,
      quantity: 2
    }, { headers });
    console.log('Added:', res.data);

    // 3. Update Quantity
    console.log('\n3. Updating quantity...');
    res = await axios.put(`${BASE_URL}/update/${PRODUCT_ID}`, {
      quantity: 5
    }, { headers });
    console.log('Updated:', res.data);

    // 4. Clear Cart
    console.log('\n4. Clearing cart...');
    res = await axios.delete(`${BASE_URL}/clear`, { headers });
    console.log('Cleared:', res.data);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testCart();