FROM oven/bun:alpine
WORKDIR /app
RUN apk add --no-cache git
COPY package*.json ./
RUN bun install
COPY . .
EXPOSE 9010
CMD ["bun", "start"]
