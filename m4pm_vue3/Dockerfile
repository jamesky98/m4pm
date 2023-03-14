FROM node:16-alpine
RUN yarn create vite m4pm_vue3 --template vue
COPY vite* /m4pm_vue3/
WORKDIR /m4pm_vue3
RUN yarn install
RUN npm i -g npm
COPY /dist /m4pm_vue3/dist
CMD npx vite preview --port 5173
# CMD npm run preivew
EXPOSE 5173