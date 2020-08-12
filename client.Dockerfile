### Install stage
FROM node:12.9.1-alpine AS base

ENV YARN_VERSION 1.19.2
RUN yarn policies set-version $YARN_VERSION

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile

### Build stage

FROM base as build

COPY . .
RUN yarn build
RUN npm prune --production --no-audit
RUN yarn cache clean

### Run stage

FROM node:12-alpine AS runtime

ENV NODE_ENV 'production'
WORKDIR /app

COPY --from=build /node_modules /app/node_modules
COPY --from=build /package.json /app/package.json
COPY --from=build /index.html /app/index.html
COPY --from=build /index.css /app/index.css
COPY --from=build /mazebot.png /app/mazebot.png
COPY --from=build /js /app/js
COPY --from=build /dist /app/dist

EXPOSE 3000
CMD ["npm", "start"]
