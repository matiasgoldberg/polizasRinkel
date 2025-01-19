// src/types/chrome-aws-lambda.d.ts
declare module 'chrome-aws-lambda' {
  import { ChromeArgOptions, LaunchOptions } from 'puppeteer-core';

  export const args: ChromeArgOptions[];
  export const defaultViewport: LaunchOptions['defaultViewport'];
  export const executablePath: Promise<string>;
  export const headless: boolean;
}
