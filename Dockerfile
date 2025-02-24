FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3014
CMD [ "npm", "run", "start:dev" ]
