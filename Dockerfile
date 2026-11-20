FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist ./dist
COPY server ./server
ENV PORT=3001
ENV DATA_DIR=/app/data
ENV NODE_ENV=production
VOLUME ["/app/data"]
EXPOSE 3001
CMD ["node", "server/index.js"]
