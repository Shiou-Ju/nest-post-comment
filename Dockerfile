
# Stage 1: build app 
FROM node:16.16 AS builder
WORKDIR /usr/src/app

COPY package.json yarn.lock /usr/src/app/
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build


# Stage 2: build production dependencies
FROM node:16.16 AS package
WORKDIR /usr/src/app

COPY package.json yarn.lock /usr/src/app/
RUN yarn install --frozen-lockfile --production


# Stage 3: run app
FROM node:16.16-slim AS execution
WORKDIR /usr/src/app

COPY --from=package /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

COPY package.json yarn.lock /usr/src/app/
COPY .env.example /usr/src/app/.env

EXPOSE 3558

CMD [ "yarn", "start:prod" ]
