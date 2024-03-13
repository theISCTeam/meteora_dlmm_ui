FROM node:alpine

WORKDIR /app

COPY ./ui/package*.json .

RUN yarn install
COPY ./ui .
RUN yarn build

CMD npx http-serve ./build -a 0.0.0.0 -p 8081