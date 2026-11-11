# FROM node:lts-alpine AS build-stage
# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install --legacy-peer-deps

# COPY ./dist ./dist
# COPY ./node_modules ./node_modules
# COPY ./src ./src
# COPY .env.* .
# COPY tsconfig.json ./

# RUN npm run build

# EXPOSE 3005

# CMD ["npm", "run", "start-dev"]

FROM node:18-slim
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxrender1 \
    libxshmfence1 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    chromium \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

RUN npm install pm2 -g
RUN npm install puppeteer --unsafe-perm=tru

# COPY . .
COPY ./dist ./dist
COPY ./node_modules ./node_modules
COPY ./src ./src
COPY .env.* .
COPY tsconfig.json ./
COPY ecosystem.config.js ./

RUN npm run build

EXPOSE 3003

CMD ["pm2-runtime", "start", "ecosystem.config.js"]