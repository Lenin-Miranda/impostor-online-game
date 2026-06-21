# Imagen de desarrollo para el backend NestJS
FROM node:20-alpine

WORKDIR /app

# Instala dependencias primero para aprovechar la cache de Docker
COPY package*.json ./
RUN npm install

# Copia el resto del código (en dev se sobrescribe con el volumen de compose)
COPY . .

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
