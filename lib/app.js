const express = require('express');
const app = express();
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema } = require('graphql');
const { RootQueryType } = require('../graphQL/Queries');
const { RootMutationType } = require('../graphQL/Mutations');

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});

app.use(express.json());

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
