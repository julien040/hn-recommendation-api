FROM node:lts-bullseye-slim

WORKDIR /app

RUN npm install -g pnpm

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install  --prod

COPY . .

RUN pnpm build

ENV NODE_ENV=production

CMD pnpm start