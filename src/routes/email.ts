// src/routes/email.ts
import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import { generatePolicyPDF } from '../utils/pdfGenerator';

const router = express.Router();

// Validaciones
const validateEmail = [
  body('polizaNumber').notEmpty().withMessage('Número de póliza es requerido'),
  body('cuponNumber').notEmpty().withMessage('Número de cupón es requerido'),
  body('clientName').notEmpty().withMessage('Nombre del cliente es requerido'),
  body('clientEmail').isEmail().withMessage('Email válido es requerido'),
  body('dni').notEmpty().withMessage('DNI es requerido'),
  body('telefono').notEmpty().withMessage('Teléfono es requerido'),
  body('direccion').notEmpty().withMessage('Dirección es requerida'),
  body('cp').notEmpty().withMessage('Código postal es requerido'),
  body('localidad').notEmpty().withMessage('Localidad es requerida'),
  body('provincia').notEmpty().withMessage('Provincia es requerida'),
  body('vehicle').isObject().withMessage('Datos del vehículo son requeridos'),
  body('vehicle.patente').notEmpty().withMessage('Patente es requerida'),
  body('vehicle.marca').notEmpty().withMessage('Marca es requerida'),
  body('vehicle.modelo').notEmpty().withMessage('Modelo es requerido'),
];

// Endpoint para enviar email
router.post(
  '/send-policy-email',
  validateEmail,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
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

      const pdfBuffer = await generatePolicyPDF(pdfData);

      // Configurar email con PDF adjunto
      const transporter = nodemailer.createTransport({
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

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        message: 'Email enviado exitosamente con la póliza adjunta',
        success: true,
      });
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({
        message: 'Error al procesar la solicitud',
        error: error.message,
      });
    }
  }
);

export default router;
