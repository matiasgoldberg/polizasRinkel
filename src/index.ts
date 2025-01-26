//src/index.ts
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import emailRoutes from './routes/email';
import { swaggerDocument } from './config/swagger';
import cors from 'cors';

// Configurar variables de entorno
dotenv.config();

const app = express();

// Configurar CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas
app.use('/api', emailRoutes);

// Puerto
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send({
    message: 'API de Emails para Pólizas',
    docs: '/api-docs',
    version: '1.0.0',
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
});
