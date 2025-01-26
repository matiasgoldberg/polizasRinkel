//src/config/swagger.js
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.swaggerDocument = void 0;
// src/config/swagger.ts
exports.swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API de Envío de Emails para Pólizas',
    version: '1.0.0',
    description: 'API para enviar emails con información de pólizas a clientes',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desarrollo',
    },
  ],
  paths: {
    '/api/send-policy-email': {
      post: {
        summary: 'Envía email con información de la póliza al cliente',
        tags: ['Email'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: [
                  'polizaNumber',
                  'cuponNumber',
                  'clientName',
                  'clientEmail',
                  'dni',
                  'telefono',
                  'direccion',
                  'cp',
                  'localidad',
                  'provincia',
                  'vehicle',
                ],
                properties: {
                  polizaNumber: {
                    type: 'string',
                    description: 'Número de póliza asignado',
                  },
                  cuponNumber: {
                    type: 'string',
                    description: 'Número de cupón de pago',
                  },
                  clientName: {
                    type: 'string',
                    description: 'Nombre completo del cliente',
                  },
                  clientEmail: {
                    type: 'string',
                    format: 'email',
                    description: 'Email del cliente',
                  },
                  dni: {
                    type: 'string',
                    description: 'DNI del cliente',
                  },
                  telefono: {
                    type: 'string',
                    description: 'Teléfono del cliente',
                  },
                  direccion: {
                    type: 'string',
                    description: 'Dirección del cliente',
                  },
                  cp: {
                    type: 'string',
                    description: 'Código postal',
                  },
                  localidad: {
                    type: 'string',
                    description: 'Localidad',
                  },
                  provincia: {
                    type: 'string',
                    description: 'Provincia',
                  },
                  vehicle: {
                    type: 'object',
                    required: ['patente', 'marca', 'modelo'],
                    properties: {
                      patente: {
                        type: 'string',
                        description: 'Patente del vehículo',
                      },
                      marca: {
                        type: 'string',
                        description: 'Marca del vehículo',
                      },
                      modelo: {
                        type: 'string',
                        description: 'Modelo del vehículo',
                      },
                      color: {
                        type: 'string',
                        description: 'Color del vehículo',
                      },
                    },
                  },
                },
              },
              example: {
                polizaNumber: 'POL-123456',
                cuponNumber: 'CUP-789012',
                clientName: 'Juan Pérez',
                clientEmail: 'juan@ejemplo.com',
                dni: '12345678',
                telefono: '1123456789',
                direccion: 'Av. Ejemplo 123',
                cp: '1234',
                localidad: 'Ciudad Ejemplo',
                provincia: 'Provincia Ejemplo',
                vehicle: {
                  patente: 'ABC123',
                  marca: 'Toyota',
                  modelo: 'Corolla',
                  color: 'Rojo',
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Email enviado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                    success: {
                      type: 'boolean',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos inválidos',
          },
          500: {
            description: 'Error del servidor',
          },
        },
      },
    },
  },
};
