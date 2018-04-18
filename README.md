# blog-server

> a express api server for blog-demo project

## Features
- [x] User authentications using jwt
- [x] Blogs CRUD
- [x] Including socketio for real-time chat
- [x] Video danmaku support, using redis/mongodb for storage

## Setup

```bash
# start server
npm run server

# restart server after starting
rs

# setup redis server first for danmaku support 

# nginx configuration sample for proxying
# for apis
location /api {
    proxy_redirect off;
    proxy_set_header HOST $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_pass http://127.0.0.1:3001/api;
    #for socket, add following configuration
    proxy_http_version 1.1;
	proxy_set_header Upgrade $http_upgrade;
	proxy_set_header Connection "upgrade";
}

```