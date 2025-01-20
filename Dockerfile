FROM node:18-slim

# Install Chrome and dependencies
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Bundle app source
COPY . .

# Build TypeScript
RUN npm run build

# Copiar templates al directorio dist
RUN cp -r src/templates dist/

# Environment variables
ENV PORT=3000
ENV CHROME_PATH=/usr/bin/google-chrome

# Start the server
CMD ["npm", "start"]