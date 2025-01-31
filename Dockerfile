FROM node:alpine
WORKDIR /app
RUN apk add --no-cache git
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 9010
CMD ["npm", "start"]