# Dev

1. Clone project

2. Copy `env.template` and rename it to `.env`
3. Set the environment variables in the `.env` file
4. Run install command

```
npm ci
```

4. (Docker desktop) Start the docker containers

```
docker-compose up -d
```

5. Run the development server

```
yarn start:dev
```

6. Go to the graphql playground

```
localhost:3000/graphql
```

7. Execute the seed mutation to create the initial data
