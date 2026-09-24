FROM node:24-slim AS builder
WORKDIR /usr/app
COPY package.json package-lock.json ./
RUN npm install --loglevel=error --no-audit
COPY . .
RUN npm run build

### Run apache server ###
FROM httpd:alpine
RUN apk add --no-cache jq \
  && rm -r /usr/local/apache2/htdocs/*
COPY --from=builder /usr/app/src/dist/ /usr/local/apache2/htdocs/
COPY ./httpd.conf /usr/local/apache2/conf/
COPY --chmod=755 ./docker-entrypoint.sh /usr/local/bin/

# Switch to www-data
RUN chown -R 33:33 /usr/local/apache2/htdocs /usr/local/apache2/logs
USER 33

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["httpd-foreground"]
