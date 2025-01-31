FROM oven/bun:alpine
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git build-base python3

# Copy package files
COPY package*.json ./

# Install dependencies with Bun
RUN bun install --frozen-lockfile

# Copy rest of the application
COPY . .

EXPOSE 9010

CMD ["bun", "start"]
