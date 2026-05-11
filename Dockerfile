FROM node:20-alpine

WORKDIR /app

# Copy only production deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy built app
COPY dist ./dist

# Expose port
EXPOSE 4800

# Run app
CMD ["node", "dist/index.js"]