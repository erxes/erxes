import path from 'path';
import express from 'express';
import { apolloServer } from 'graphql-tools';
import Schema from './data/schema';
import Resolvers from './data/resolvers';

const GRAPHQL_PORT = 8080;

const app = express();

// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, 'client')));

app.use('/graphql', apolloServer({
  graphiql: true,
  schema: Schema,
  resolvers: Resolvers,
}));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

app.listen(GRAPHQL_PORT);
