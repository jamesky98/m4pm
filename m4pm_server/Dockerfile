FROM node:16-alpine
WORKDIR /m4pm_sever
COPY *.* /m4pm_sever/
COPY /src /m4pm_sever/src
COPY /prisma /m4pm_sever/prisma
RUN yarn install
RUN npm install cross-env
RUN npm i -g npm
#ENV DATABASE_URL mysql://root:Nlsc!1234567@127.0.0.1:3306/sicl_db
RUN npx prisma generate
# CMD ["node", "src/index.js"]
CMD npx cross-env NODE_ENV=production node src/index.js
EXPOSE 4100