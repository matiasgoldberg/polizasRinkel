//src/index.js
'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const swagger_ui_express_1 = __importDefault(require('swagger-ui-express'));
const dotenv_1 = __importDefault(require('dotenv'));
const email_1 = __importDefault(require('./routes/email'));
const swagger_1 = require('./config/swagger');
// Configurar variables de entorno
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Documentación Swagger
app.use(
  '/api-docs',
  swagger_ui_express_1.default.serve,
  swagger_ui_express_1.default.setup(swagger_1.swaggerDocument)
);
// Rutas
app.use('/api', email_1.default);
// Puerto
const PORT = process.env.PORT || 3000;
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
});
