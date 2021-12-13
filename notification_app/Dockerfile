FROM node:14.17.0-alpine

# Create app directory
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json /usr/src/app/

RUN npm install -g nodemon && npm install

COPY . /usr/src/app

EXPOSE 3000