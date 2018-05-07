# Googol REST API

Atenção: Esse projeto foi baseado nesse maravilhoso [boilerplate](https://github.com/kunalkapadia/express-mongoose-es6-rest-api)  


## Overview
REST API do Googol, contruida utilizando Node + Express + MongoDB.

## Getting Started

Install yarn:
```sh
npm install -g yarn
# you may need sudo for this
```

Install dependencies:
```sh
yarn
```

Set environment (vars):
```sh
get .env file on #dev channel of our slack.
```

Start server:
```sh
# Start server
yarn start
```

## Docker

#### Using Docker Compose for Development
```sh
# service restarts on file change
bash bin/development.sh
```

#### Building and running without Docker Compose
```bash
# To use this option you need to make sure mongodb is listening on port 27017

# Build docker 
docker build -t express-mongoose-es6-rest-api .

# Run docker
docker run -p 4040:4040 express-mongoose-es6-rest-api
```
