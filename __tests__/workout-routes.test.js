const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const { dummyUser, dummyWorkout, dummyW2, dummyW3 } = require('./dummyData.json');
const User = require('../lib/models/user');
const Workout = require('../lib/models/workout');

describe('Workout-API graphQL routes', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });

  it('creates a workout with graphql', async () => {
    const user = await User.insert(dummyUser);

    const query = `
      mutation {
        addWorkout(userID: ${user.id}, name: "${dummyWorkout.name}", description: "${dummyWorkout.description}", heavy: ${dummyWorkout.heavy}, medium: ${dummyWorkout.medium}, light: ${dummyWorkout.light}, position: ${dummyWorkout.position}) {
          id
          userID
          name
          description
          heavy
          medium
          light
          position
        }
      }`;
    const { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(JSON.stringify({ query }));

    const { addWorkout } = body.data;

    expect(addWorkout).toEqual(
      {
        ...dummyWorkout,
        id: expect.any(Number),
        userID: user.id
      });
  });
  it('gets all a users workouts with graphQL', async () => {
    const user = await User.insert(dummyUser);
    const user2 = await User.insert({
      name: 'fail',
      passwordHash: 'fail hash'
    });

    await Workout.insert(user.id, dummyWorkout);
    await Workout.insert(user.id, dummyW2);
    await Workout.insert(user2.id, dummyW3);

    const query = `
      query {
        workouts(userID: ${user.id}) {
          id
          userID
          name
          description
          heavy
          medium
          light
          position
        }
      }`;
    const { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(JSON.stringify({ query }));

    const { workouts } = body.data;

    expect(workouts).toEqual(expect.arrayContaining([
      { ...dummyWorkout, id: expect.any(Number), userID: user.id },
      { ...dummyW2, id: expect.any(Number), userID: user.id }]));

    expect(workouts).not.toEqual(expect.arrayContaining([{ ...dummyW3, id: expect.any(Number), userID: user2.id }]));
  });
  it('updates a workout with graphQL', async () => {
    const user = await User.insert(dummyUser);
    const createdWorkout = await Workout.insert(user.id, dummyWorkout);

    const query = `
    mutation {
      updateWorkout(id: ${createdWorkout.id}, name: "new name", description: "${dummyWorkout.description}", heavy: 100, medium: ${dummyWorkout.medium}, light: ${dummyWorkout.light}) {
        id
        userID
        name
        description
        heavy
        medium
        light
        position
      }
    }`;
    const { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(JSON.stringify({ query }));

    const { updateWorkout } = body.data;

    expect(updateWorkout).toEqual({
      ...dummyWorkout,
      userID: user.id,
      id: createdWorkout.id,
      name: 'new name',
      heavy: 100
    });
  });
  it('deletes a workout with graphQL', async () => {
    const user = await User.insert(dummyUser);
    const createdWorkout = await Workout.insert(user.id, dummyWorkout);

    const query = `
      mutation {
        deleteWorkout(id: ${createdWorkout.id}) {
          id
          userID
          name
          description
          heavy
          medium
          light
          position
        }
      }`;
    const { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(JSON.stringify({ query }));

    const { deleteWorkout } = body.data;

    expect(deleteWorkout).toEqual(createdWorkout);
  });

  it('shifts a workouts position from a newly declared position', async () => {
    const user = await User.insert(dummyUser);

    await Workout.insert(user.id, dummyWorkout);
    await Workout.insert(user.id, dummyW2);

    const insertedWorkout = await Workout.insert(user.id, dummyW3);

    const query = `
      mutation {
        shiftWorkout(workoutID: ${insertedWorkout.id}, newPosition: 1) {
          id
          userID
          name
          description
          heavy
          medium
          light
          position
        }
      }`;
    const { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(JSON.stringify({ query }));

    const { shiftWorkout } = body.data;

    expect(shiftWorkout).toEqual(expect.arrayContaining([
      { ...dummyWorkout, id: expect.any(Number), userID: user.id, position: 2 },
      { ...dummyW2, id: expect.any(Number), userID: user.id, position: 3 },
      { ...dummyW3, id: expect.any(Number), userID: user.id, position: 1 }]));
  });
});
