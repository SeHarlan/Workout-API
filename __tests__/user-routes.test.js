const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const { dummyUser, dummyW2, dummyWorkout, dummyW3 } = require('./dummyData.json');
const User = require('../lib/models/user');
const Workout = require('../lib/models/workout');

describe('Workout-API graphQL routes', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });

  it('creates a new user with graphQL', async () => {
    const query = `
      mutation {
        addUser(name: "${dummyUser.name}", passwordHash: "${dummyUser.passwordHash}") {
          id
          name
          passwordHash
        }
      }`;
    const { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(JSON.stringify({ query }));

    const { addUser } = body.data;


    expect(addUser).toEqual({
      ...dummyUser,
      id: expect.any(Number)
    });
  });

  it('gets a user with graphQL with workouts', async () => {
    const createdUser = await User.insert(dummyUser);
    const user2 = await User.insert({
      name: 'fail',
      passwordHash: 'fail hash'
    });
    await Promise.all([
      Workout.insert(createdUser.id, dummyWorkout),
      Workout.insert(createdUser.id, dummyW2),
      Workout.insert(user2.id, dummyW3)
    ]);
    const query = `
      query {
        user(id: ${createdUser.id}) {
          id
          name
          passwordHash
          workouts {
            id
            userID
            name
            description
            heavy
            medium
            light
            position
          }
        }
      }`;
    const { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(JSON.stringify({ query }));

    const { user } = body.data;

    expect(user).toEqual({
      ...createdUser,
      workouts: expect.any(Array)
    });
    expect(user.workouts).toEqual(expect.arrayContaining([
      { ...dummyWorkout, id: expect.any(Number), userID: createdUser.id },
      { ...dummyW2, id: expect.any(Number), userID: createdUser.id }]));

    expect(user.workouts).not.toEqual(expect.arrayContaining([{ ...dummyW3, id: expect.any(Number), userID: user2.id }]));
  });
  it('updates a user with graphQL', async () => {
    const createdUser = await User.insert(dummyUser);

    const query = `
      mutation {
        updateUser(id: ${createdUser.id}, passwordHash: "${createdUser.passwordHash}", name: "new name") {
          id
          name
          passwordHash
        }
      }`;
    const { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(JSON.stringify({ query }));

    const { updateUser } = body.data;

    expect(updateUser).toEqual({
      ...createdUser,
      name: 'new name'
    });
  });
  it('deletes a user with graphQL', async () => {
    const createdUser = await User.insert(dummyUser);

    const query = `
      mutation {
        deleteUser(id: ${createdUser.id}) {
          id
          name
          passwordHash
        }
      }`;

    const { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(JSON.stringify({ query }));

    const { deleteUser } = body.data;

    expect(deleteUser).toEqual(createdUser);
  });
});
