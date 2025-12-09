QuickPay Backend (Node.js + MongoDB + Razorpay)

QuickPay Backend is a secure REST API built for a wallet-based payment system.
It supports authentication, password reset via email, Razorpay payments, wallet management, and transaction history.
API documentation is provided using Swagger UI.

 Features

JWT Authentication & Authorization

Razorpay Payment Gateway Integration

Wallet Balance + Transaction Storage

Forgot/Reset Password with Email

Swagger Documentation (OpenAPI)

 Tech Stack

Node.js, Express.js

MongoDB + Mongoose

Razorpay API

JWT, bcrypt

Swagger UI (API Docs)

 Key API Endpoints
Method	Endpoint	Description
POST	/auth/signup	User registration
POST	/auth/login	Login + JWT
POST	/auth/forgot-password	Send reset email
POST	/auth/reset-password/:token	Reset password
GET	/wallet/balance	Get wallet balance
POST	/api/payment/create-order	Create Razorpay order
GET	/api/payment/history	Get transaction history
 Swagger Docs

Browse API documentation at:

/api-docs

<p align="center"> <img src="https://raw.githubusercontent.com/vathsala333/quickpaybackend/main/screenshot/swagger.png" width="500px"> </p>
 Run Locally
git clone https://github.com/vathsala333/quickpaybackend.git


