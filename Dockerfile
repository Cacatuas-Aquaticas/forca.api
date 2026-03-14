FROM node:22
WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
# Verifica se a API está respondendo a cada 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/metrics', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1
CMD ["npm", "start"]
