# Use Node.js LTS
FROM node:18

# Install Chrome
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Chrome path
ENV CHROME_PATH=/usr/bin/google-chrome

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install TypeScript globally
RUN npm install -g typescript

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3000

# Start the server
CMD [ "npm", "start" ]