FROM node:alpine

WORKDIR /app

COPY ./package*.json .

RUN yarn install
COPY ./ .
RUN yarn build

CMD npx http-serve ./build -a 0.0.0.0 -p 8081