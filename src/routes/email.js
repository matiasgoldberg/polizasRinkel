//src/routes/email.js
'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
// src/routes/email.ts
const express_1 = __importDefault(require('express'));
const express_validator_1 = require('express-validator');
const nodemailer_1 = __importDefault(require('nodemailer'));
const pdfGenerator_1 = require('../utils/pdfGenerator');
const router = express_1.default.Router();
// Validaciones
const validateEmail = [
  (0, express_validator_1.body)('polizaNumber')
    .notEmpty()
    .withMessage('Número de póliza es requerido'),
  (0, express_validator_1.body)('cuponNumber')
    .notEmpty()
    .withMessage('Número de cupón es requerido'),
  (0, express_validator_1.body)('clientName')
    .notEmpty()
    .withMessage('Nombre del cliente es requerido'),
  (0, express_validator_1.body)('clientEmail')
    .isEmail()
    .withMessage('Email válido es requerido'),
  (0, express_validator_1.body)('dni')
    .notEmpty()
    .withMessage('DNI es requerido'),
  (0, express_validator_1.body)('telefono')
    .notEmpty()
    .withMessage('Teléfono es requerido'),
  (0, express_validator_1.body)('direccion')
    .notEmpty()
    .withMessage('Dirección es requerida'),
  (0, express_validator_1.body)('cp')
    .notEmpty()
    .withMessage('Código postal es requerido'),
  (0, express_validator_1.body)('localidad')
    .notEmpty()
    .withMessage('Localidad es requerida'),
  (0, express_validator_1.body)('provincia')
    .notEmpty()
    .withMessage('Provincia es requerida'),
  (0, express_validator_1.body)('vehicle')
    .isObject()
    .withMessage('Datos del vehículo son requeridos'),
  (0, express_validator_1.body)('vehicle.patente')
    .notEmpty()
    .withMessage('Patente es requerida'),
  (0, express_validator_1.body)('vehicle.marca')
    .notEmpty()
    .withMessage('Marca es requerida'),
  (0, express_validator_1.body)('vehicle.modelo')
    .notEmpty()
    .withMessage('Modelo es requerido'),
];
// Endpoint para enviar email
router.post('/send-policy-email', validateEmail, (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const errors = (0, express_validator_1.validationResult)(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        polizaNumber,
        cuponNumber,
        clientName,
        clientEmail,
        dni,
        telefono,
        direccion,
        cp,
        localidad,
        provincia,
        vehicle,
      } = req.body;
      // Generar PDF
      const pdfData = {
        id: polizaNumber,
        plan: 'AUTO - R FULL',
        beneficiario: {
          nombre: clientName,
          dni: dni,
          celular: telefono,
          email: clientEmail,
          fechaEmision: new Date().toLocaleDateString(),
          condicion: 'Cons. Final',
        },
        domicilio: {
          direccion: direccion,
          cp: cp,
          localidad: localidad,
          provincia: provincia,
        },
        vehiculo: {
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          color: vehicle.color || '-',
          patente: vehicle.patente,
        },
        medioPago: 'CBU',
      };
      const pdfBuffer = yield (0, pdfGenerator_1.generatePolicyPDF)(pdfData);
      // Configurar email con PDF adjunto
      const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: clientEmail,
        subject: `Póliza de Seguro #${polizaNumber}`,
        html: `
        <h1>¡Bienvenido a nuestro servicio de grúas!</h1>
        <p>Estimado/a ${clientName},</p>
        <p>Adjunto encontrará su póliza de seguro.</p>
        <p>Ante cualquier emergencia, contacte a nuestra línea de asistencia.</p>
      `,
        attachments: [
          {
            filename: `poliza-${polizaNumber}.pdf`,
            content: pdfBuffer,
          },
        ],
      };
      yield transporter.sendMail(mailOptions);
      res.status(200).json({
        message: 'Email enviado exitosamente con la póliza adjunta',
        success: true,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        message: 'Error al procesar la solicitud',
        error: error.message,
      });
    }
  })
);
exports.default = router;
