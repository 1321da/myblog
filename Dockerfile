FROM node:24-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV NODE_ENV=production
RUN npm run build

EXPOSE 3000

# 首次启动初始化数据库（建表 + 管理员），再启动服务
CMD ["sh", "-c", "node scripts/seed.mjs && npm start"]
