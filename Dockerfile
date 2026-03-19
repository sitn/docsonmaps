FROM node:24-slim as builder
WORKDIR /usr/app
COPY package.json package-lock.json ./
RUN npm install --loglevel=error --no-audit
COPY . .
RUN npm run build -- --mode prod

### Run apache server ###
FROM httpd:alpine
RUN rm -r /usr/local/apache2/htdocs/*
COPY --from=builder /usr/app/src/dist/ /usr/local/apache2/htdocs/
COPY ./httpd.conf /usr/local/apache2/conf/
