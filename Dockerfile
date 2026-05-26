FROM node:20-alpine
WORKDIR /usr/src/app

# Install dependencies first (cache)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build TypeScript sources
RUN npm run build

# Run app
ENV NODE_ENV=development
EXPOSE 4800
CMD ["npm", "start"]