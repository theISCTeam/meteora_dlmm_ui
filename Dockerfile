FROM node:alpine

WORKDIR /app

COPY ./package*.json .

RUN npm install

COPY . .

RUN npm run build-docker

CMD npx http-serve ./build -a 0.0.0.0 -p 8082