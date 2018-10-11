FROM node:8-alpine
WORKDIR /app
COPY package*.json ./

RUN apk add python make g++
RUN npm install

COPY . .

EXPOSE 8080
CMD ["npm", "start"]