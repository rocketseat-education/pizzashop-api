# 🍕 pizza.shop API

Food delivery app (aka. iFood/Uber Eats) back-end built with TypeScript, Drizzle a ElysiaJS.

> 🔥 This project aims to keep runtime agnostic, this means it should work on Bun, Node, Cloudflare Workers or any Web Standard API compatible runtime.

## Running

This project depends on Docker to setup database. With Docker installed, clone the project, install  dependencies, setup Docker containers and run the application.

> You must also run migrations to create database tables and run the seed to populate the database with fake data.

```sh
bun i
docker compose up -d
bun migrate
bun seed
bun dev
```

## Features

> The **summary** of the features are listed below. All the features contains E2E tests.

- it should be able to register a new restaurant
- it should be able to sign in as a restaurant manager
- it should be able to register as a new customer
- it should be able to crete an order to the restaurant
- it should be able to manage the restaurant menu
- it should be able to manage the restaurant evaluations
- it should be able to leave an evaluation
- it should be able to manage the restaurant orders
- it should be able to update the restaurant public profile
- it should be able to open/close the restaurant
- it should be able to list metrics from the restaurant