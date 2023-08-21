FROM node:14

WORKDIR /usr/app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

EXPOSE 4002

CMD ['yarn', 'start']
