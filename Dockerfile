# syntax=docker/dockerfile:1
FROM node:20-alpine
LABEL app=tv-dashboard

WORKDIR /app

ENV NODE_ENV=production PORT=3006

COPY package*.json ./
RUN npm ci --omit=dev

COPY . ./

EXPOSE 3006

CMD ["npm", "run", "serve"]
