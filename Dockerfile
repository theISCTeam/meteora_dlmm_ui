FROM node:alpine

WORKDIR /app

COPY ./package*.json .
COPY ./src .
COPY ./public .
COPY ./config-overrides.js .

RUN npm install
RUN npm run build-docker

CMD npx http-serve ./build -a 0.0.0.0 -p 8082