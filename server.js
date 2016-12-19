import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import schema from './data/schema';
import resolvers from './data/resolvers';

const GRAPHQL_PORT = 8080;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, 'client')));

app.use('/graphql', graphqlExpress(() =>
  ({
    schema: makeExecutableSchema({
      typeDefs: schema,
      resolvers,
    }),
  })
));

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

app.listen(GRAPHQL_PORT);
