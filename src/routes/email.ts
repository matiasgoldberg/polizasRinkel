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

// Template del email
const getEmailTemplate = (clientName: string, provisorio: boolean) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 25px;">
      <img 
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image003-lQUo6M0y8FjldKudsUzMZXPEtTT9Ig.png" 
        alt="Rescate Logo" 
        style="width: 200px; max-width: 100%; height: auto;"
      />
    </div>
    <div style="background-color: #ffffff; padding: 20px; border-radius: 5px;">
      <h1 style="color: #E0251B; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Bienvenido a nuestro servicio de grúas!</h1>
      <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">Estimado/a ${clientName},</p>
      <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">Adjunto encontrará su póliza de seguro${
        provisorio ? ' provisoria' : ''
      }.</p>
      <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">Ante cualquier emergencia, contacte a nuestra línea de asistencia:</p>
      <p style="text-align: center; font-weight: bold; color: #E0251B; font-size: 20px; margin: 25px 0;">
        0800 - 122 - 0498
      </p>
    </div>
  </div>
`;

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
        plan: 'R -ILIMITADO',
        provisorio: req.body.provisorio || false,
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
          patente: vehicle.patente.toUpperCase(), // Aseguramos que la patente esté en mayúsculas
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
        html: getEmailTemplate(clientName, req.body.provisorio || false),
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
