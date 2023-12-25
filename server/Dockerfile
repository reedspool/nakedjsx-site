FROM node:20-alpine
    MAINTAINER Reed Spool <reedwith2es@gmail.com>

WORKDIR /home/node/myApp

COPY package*.json ./

RUN npm install

COPY ./MyJSXStringImplementation.tsx ./tsconfig.json ./

RUN npm run build:jsxString

COPY compiler.tsx ./

RUN npm run build:buildCompiler

COPY src/ src/

RUN npm run build:compile

EXPOSE 3001

CMD ["node", "build/index.js"]
