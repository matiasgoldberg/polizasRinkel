// src/utils/excelGenerator.ts
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

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

const CELL_MAPPINGS = {
  B6: (data: PolicyData) => data.beneficiario.nombre,
  B7: (data: PolicyData) => data.beneficiario.dni,
  B8: (data: PolicyData) => data.beneficiario.celular,
  B9: (data: PolicyData) => data.beneficiario.email,
  B10: (data: PolicyData) => data.domicilio.direccion,
  B11: (data: PolicyData) => data.domicilio.localidad,
  B12: (data: PolicyData) => data.domicilio.cp,
  B13: (data: PolicyData) => data.domicilio.provincia,
  B15: (data: PolicyData) => data.vehiculo.marca,
  B16: (data: PolicyData) => data.vehiculo.modelo,
  B17: (data: PolicyData) => data.vehiculo.patente,
  B18: (data: PolicyData) => data.vehiculo.color,
  A2: (data: PolicyData) => data.id,
  H2: (data: PolicyData) => data.plan,
  B20: (data: PolicyData) => data.medioPago,
  B4: (data: PolicyData) => data.beneficiario.fechaEmision,
};

export const generatePolicyPDF = async (data: PolicyData): Promise<Buffer> => {
  try {
    // Leer el template Excel
    const templatePath = path.join(
      __dirname,
      '../templates/Tarjeta Web 1.xlsx'
    );
    const templateContent = await fs.promises.readFile(templatePath);

    // Cargar el workbook
    const workbook = XLSX.read(templateContent, {
      cellStyles: true,
      cellFormula: true, // <-- Corregido de cellFormulas a cellFormula
      cellDates: true,
      cellNF: true,
      sheetStubs: true,
    });

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Actualizar las celdas con los nuevos datos
    for (const [cell, getValue] of Object.entries(CELL_MAPPINGS)) {
      if (worksheet[cell]) {
        worksheet[cell].v = getValue(data);
      }
    }

    // Convertir a HTML manteniendo estilos
    const html = XLSX.utils.sheet_to_html(worksheet, {
      header:
        '<html><head><style>table { border-collapse: collapse; } td { padding: 5px; border: 1px solid #ccc; }</style></head><body>',
      footer: '</body></html>',
    });

    // Usar Puppeteer para convertir HTML a PDF
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath:
        process.env.CHROME_PATH ||
        (process.platform === 'win32'
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
          : '/usr/bin/google-chrome'),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      printBackground: true,
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generando PDF desde Excel:', error);
    throw error;
  }
};
