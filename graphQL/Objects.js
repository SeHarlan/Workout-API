const User = require('../lib/models/user');
const Workout = require('../lib/models/workout');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql');

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
    position: { type: GraphQLNonNull(GraphQLInt) },
    user: {
      type: UserType,
      resolve: (workout) => User.findById(workout.userID)
    }
  })
});
const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'User type model',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    passwordHash: { type: GraphQLNonNull(GraphQLString) },
    workouts: {
      type: new GraphQLList(WorkoutType),
      resolve: (user) => Workout.getAll(user.id)
    }
  })
});

module.exports = {
  WorkoutType,
  UserType
};
