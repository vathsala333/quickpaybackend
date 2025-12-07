const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "QuickPay API Documentation",
      version: "1.0.0",
      description: "API Documentation for QuickPay MERN Wallet & Payment System",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://quickpay-backend.onrender.com"
            : "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },

  // 🔥 Important: Read API docs from route files
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUI, swaggerSpec };
