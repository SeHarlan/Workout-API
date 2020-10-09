const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql');
const app = express();
const Workout = require('./models/workout');

const WorkoutType = new GraphQLObjectType({
  name: 'Workout',
  description: 'Workout type model',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    userID: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    heavy: { type: GraphQLInt },
    medium: { type: GraphQLInt },
    light: { type: GraphQLInt },
    position: { type: GraphQLNonNull(GraphQLInt) }
  })
});

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    workouts: {
      type: new GraphQLList(WorkoutType),
      description: 'List of all Workouts',
      resolve: () => Workout.getAll()
    }
  })
});

const schema = new GraphQLSchema({
  query: RootQueryType
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
