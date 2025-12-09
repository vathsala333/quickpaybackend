# **QuickPay Backend (Node.js + MongoDB + Razorpay)**

QuickPay Backend is a secure and scalable **REST API** designed for a **wallet-based payment system**.  
It includes authentication, wallet management, Razorpay payment integration, password reset flow, and transaction history. API documentation is available through **Swagger UI**.

---

## **Features**

- **JWT Authentication & Authorization**  
- **Razorpay Payment Gateway Integration**  
- **Wallet Balance & Transaction Storage**  
- **Email-based Forgot & Reset Password**  
- **Swagger Documentation (OpenAPI)**

---

## **Tech Stack**

- **Node.js**, **Express.js**  
- **MongoDB + Mongoose**  
- **JWT**, **bcrypt**  
- **Razorpay API**  
- **Swagger UI**

---

## **Key API Endpoints**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| **POST** | `/auth/signup` | User registration |
| **POST** | `/auth/login` | Login & generate JWT |
| **POST** | `/auth/forgot-password` | Send password reset link |
| **POST** | `/auth/reset-password/:token` | Reset password using token |
| **GET** | `/wallet/balance` | Get wallet balance |
| **POST** | `/api/payment/create-order` | Create Razorpay order |
| **GET** | `/api/payment/history` | Fetch transaction history |

---

## **Swagger Docs**

Browse API docs at:  
`/api-docs`

<p align="center">
  <img src="https://raw.githubusercontent.com/vathsala333/quickpaybackend/main/screenshot/swagger.png" width="500px">
</p>

---

## **Run Locally**

```bash
git clone https://github.com/vathsala333/quickpaybackend.git
cd quickpaybackend
npm install
# create .env with required keys
npm run dev
