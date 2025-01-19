// src/utils/pdfGenerator.ts
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

interface PolicyData {
  id: string;
  plan: string;
  beneficiario: {
    nombre: string;
    dni: string;
    celular: string;
    email: string;
    fechaEmision: string;
    condicion: string;
  };
  domicilio: {
    direccion: string;
    cp: string;
    localidad: string;
    provincia: string;
  };
  vehiculo: {
    marca: string;
    modelo: string;
    color: string;
    patente: string;
  };
  medioPago: string;
}

export const generatePolicyPDF = async (data: PolicyData): Promise<Buffer> => {
  try {
    // Leer el template HTML
    const templatePath = path.join(__dirname, '../templates/policy.html');
    let template = fs.readFileSync(templatePath, 'utf-8');

    // Leer el logo y convertirlo a base64
    const logoPath = path.join(__dirname, '../assets/logo.png');
    const logoBase64 = fs.readFileSync(logoPath).toString('base64');

    // Reemplazar todas las variables en el template
    const replacements = {
      '{{LOGO_BASE64}}': logoBase64,
      '{{ID}}': data.id,
      '{{PLAN}}': data.plan,
      '{{NOMBRE}}': data.beneficiario.nombre,
      '{{FECHA_EMISION}}': data.beneficiario.fechaEmision,
      '{{DNI}}': data.beneficiario.dni,
      '{{CONDICION}}': data.beneficiario.condicion,
      '{{CELULAR}}': data.beneficiario.celular,
      '{{EMAIL}}': data.beneficiario.email,
      '{{DIRECCION}}': data.domicilio.direccion,
      '{{LOCALIDAD}}': data.domicilio.localidad,
      '{{CP}}': data.domicilio.cp,
      '{{PROVINCIA}}': data.domicilio.provincia,
      '{{MARCA}}': data.vehiculo.marca,
      '{{MODELO}}': data.vehiculo.modelo,
      '{{COLOR}}': data.vehiculo.color || '-',
      '{{PATENTE}}': data.vehiculo.patente,
      '{{MEDIO_PAGO}}': data.medioPago,
    };

    // Reemplazar cada variable en el template
    Object.entries(replacements).forEach(([key, value]) => {
      template = template.replace(new RegExp(key, 'g'), value);
    });

    // Iniciar Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });
    const page = await browser.newPage();

    // Cargar el HTML
    await page.setContent(template, {
      waitUntil: 'networkidle0',
    });

    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
      printBackground: true,
    });

    await browser.close();
    return Buffer.from(pdfBuffer); // Convertido explícitamente a Buffer
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
};
