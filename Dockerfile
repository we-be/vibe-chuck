FROM node:lts-alpine AS build

   WORKDIR /app

   COPY package.json package-lock.json ./

   RUN npm i

   COPY . .

   EXPOSE 5173

   CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]