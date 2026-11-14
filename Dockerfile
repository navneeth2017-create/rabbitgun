# Rabbitgun — deterministic build. Nixpacks' Node guess breaks the build
# (Tailwind v4 needs require(esm), which only landed in Node >=20.19/22.12),
# so we pin the same Node the code is developed and verified on.
FROM node:24-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
