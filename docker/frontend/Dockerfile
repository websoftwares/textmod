# Stage 1: Build the app
FROM node:18-alpine AS build

WORKDIR /app

COPY frontend/package.json ./

RUN npm install

COPY frontend ./

RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:1.21.5-alpine

RUN rm /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/public/index.html /usr/share/nginx/html/index.html


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
