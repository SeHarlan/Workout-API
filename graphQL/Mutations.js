const User = require('../lib/models/user');
const Workout = require('../lib/models/workout');
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const { UserType, WorkoutType } = require('./Objects');

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addUser: {
      type: UserType,
      description: 'Creates a user',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        passwordHash: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, { name, passwordHash }) => {
        return User.insert({ name, passwordHash });
      }
    },
    updateUser: {
      type: UserType,
      description: 'Updates a user with full updated user object',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        passwordHash: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, user) => {
        return User.update(user);
      }
    },
    deleteUser: {
      type: UserType,
      description: 'Deletes a user with id',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, { id }) => {
        return User.delete(id);
      }
    },
    addWorkout: {
      type: WorkoutType,
      description: 'Creates a workout with user id',
      args: {
        userID: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        heavy: { type: GraphQLInt },
        medium: { type: GraphQLInt },
        light: { type: GraphQLInt },
        position: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, { userID, name, description, heavy, medium, light, position }) => {
        const workout = { name, description, heavy, medium, light, position };
        return Workout.insert(userID, workout);
      }
    },
    updateWorkout: {
      type: WorkoutType,
      description: 'Updates a workout using a complete updated workout object',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        heavy: { type: GraphQLInt },
        medium: { type: GraphQLInt },
        light: { type: GraphQLInt },
        position: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, workout) => {
        return Workout.update(workout);
      }
    },
    deleteWorkout: {
      type: WorkoutType,
      description: 'Deletes a workout using the id',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, { id }) => {
        return Workout.delete(id);
      }
    }
  })
});

module.exports = {
  RootMutationType
};
