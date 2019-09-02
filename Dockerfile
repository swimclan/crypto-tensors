FROM node:latest
WORKDIR /opt/node/crypto-tensors
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "node", "index.js" ]