const User = require('../lib/models/user');
const Workout = require('../lib/models/workout');
const pool = require('../lib/utils/pool');
const fs = require('fs');

const { dummyWorkout, dummyW2, dummyW3, dummyUser } = require('./dummyData.json');


describe('user model', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });

  it('creates a new user', async () => {
    const createdUser = await User.insert(dummyUser);

    expect(createdUser).toEqual({
      ...dummyUser,
      id: expect.any(Number)
    });
  });
  it('gets a user by id', async () => {
    const createdUser = await User.insert(dummyUser);

    const foundUser = await User.findById(createdUser.id);

    expect(foundUser).toEqual({
      ...dummyUser,
      id: createdUser.id
    });
  });
  it('gets all users', async () => {
    await Promise.all([
      User.insert(dummyUser),
      User.insert({
        name: 'name 2',
        passwordHash: 'hash 2'
      })
    ]);

    const users = await User.getAll();

    expect(users).toEqual(expect.arrayContaining([
      { ...dummyUser, id: expect.any(Number) },
      {
        name: 'name 2',
        passwordHash: 'hash 2',
        id: expect.any(Number)
      }
    ]));
  });

  it('updates a user info', async () => {
    const createdUser = await User.insert(dummyUser);

    const updatedUser = await User.update({
      ...createdUser,
      name: 'new name',
      passwordHash: 'new hash'
    });

    expect(updatedUser).toEqual({
      id: createdUser.id,
      name: 'new name',
      passwordHash: 'new hash'
    });
  });

  it('deletes a user', async () => {
    const createdUser = await User.insert(dummyUser);

    const deletedUser = await User.delete(createdUser.id);

    expect(deletedUser).toEqual({
      ...dummyUser,
      id: createdUser.id
    });
  });

  it('deletes a users workouts when that user is deleted, returns null', async () => {
    const createdUser = await User.insert(dummyUser);

    await Promise.all([
      Workout.insert(createdUser.id, dummyWorkout),
      Workout.insert(createdUser.id, dummyW2),
      Workout.insert(createdUser.id, dummyW3)
    ]);

    await User.delete(createdUser.id);

    const nullWorkouts = await Workout.getAll(createdUser.id);

    expect(nullWorkouts).toEqual(null);
  });
});
