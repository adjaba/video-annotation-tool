FROM node:10.15.2

RUN apt-get -y update && apt-get -y upgrade

WORKDIR /app
COPY . .
WORKDIR /app/server
RUN yarn install

WORKDIR /app/client
RUN yarn install

WORKDIR /app
RUN yarn install

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["yarn", "start"]
