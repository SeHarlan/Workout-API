const User = require('../lib/models/user');
const Workout = require('../lib/models/workout');
const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
} = require('graphql');
const { UserType, WorkoutType } = require('./Objects');

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    user: {
      type: UserType,
      description: 'Get one User by id',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, { id }) => User.findById(id)
    },
    users: {
      type: new GraphQLList(UserType),
      description: 'List of all Users',
      resolve: () => User.getAll()
    },
    workouts: {
      type: new GraphQLList(WorkoutType),
      description: 'List of Workouts by userID',
      args: {
        userID: { type: GraphQLInt }
      },
      resolve: (parent, { userID }) => Workout.getAll(userID)
    }
  })
});

module.exports = {
  RootQueryType
};
