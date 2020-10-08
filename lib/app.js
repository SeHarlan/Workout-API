const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');
const app = express();
const Workout = require('./models/workout');

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'HelloWorld',
    fields: () => ({
      message: {
        type: GraphQLString,
        resolve: () => 'Hello World'
      }
    })
  })
});

app.use(express.json());

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

// app.post('/api/v1/workouts', async (req, res, next) => {
//   try {
//     const createdWorkout = await Workout.insert(req.body)
//     res.send(createdWorkout)
//   } catch (error) {
//     next(error)
//   }
// })

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
