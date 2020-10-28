const Workout = require('../lib/models/workout');
const User = require('../lib/models/user');
const pool = require('../lib/utils/pool');
const fs = require('fs');

const { dummyWorkout, dummyW2, dummyW3, dummyUser } = require('./dummyData.json');

describe('workout model', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });

  it('inserts a new workout with userID', async () => {
    const user = await User.insert(dummyUser);
    const createdWorkout = await Workout.insert(user.id, dummyWorkout);

    expect(createdWorkout).toEqual(
      {
        ...dummyWorkout,
        userID: user.id,
        id: expect.any(Number)
      });
  });

  it('finds a workout by id', async () => {
    const user = await User.insert(dummyUser);
    const createdWorkout = await Workout.insert(user.id, dummyWorkout);

    const foundWorkout = await Workout.findById(createdWorkout.id);

    expect(foundWorkout).toEqual({
      ...dummyWorkout,
      userID: user.id,
      id: createdWorkout.id
    });
  });

  it('returns null if no workout is found by id', async () => {
    const nullWorkout = await Workout.findById(234234234);
    expect(nullWorkout).toEqual(null);
  });

  it('gets all workouts by UserID', async () => {
    const user = await User.insert(dummyUser);
    const user2 = await User.insert({
      name: 'fail',
      passwordHash: 'fail hash'
    });

    await Workout.insert(user.id, dummyWorkout);
    await Workout.insert(user.id, dummyW2);
    await Workout.insert(user2.id, dummyW3);

    const workouts = await Workout.getAll(user.id);

    expect(workouts).toEqual(expect.arrayContaining([
      { ...dummyWorkout, id: expect.any(Number), userID: user.id },
      { ...dummyW2, id: expect.any(Number), userID: user.id }]));

    expect(workouts).not.toEqual(expect.arrayContaining([{ ...dummyW3, id: expect.any(Number), userID: user2.id }]));
  });

  it('gets all workouts ordered by Position', async () => {
    const user = await User.insert(dummyUser);

    await Workout.insert(user.id, dummyWorkout);
    await Workout.insert(user.id, dummyW2);
    await Workout.insert(user.id, { ...dummyW3, position: 2 });

    const workouts = await Workout.getAll(user.id);

    expect(workouts).toEqual([
      { ...dummyWorkout, id: expect.any(Number), userID: user.id },
      { ...dummyW3, id: expect.any(Number), userID: user.id, position: 2 },
      { ...dummyW2, id: expect.any(Number), userID: user.id, position: 3 },
    ]);
  });

  it('returns null when there is no user found with a get all', async () => {
    const nullWorkouts = await Workout.getAll(234234234);
    expect(nullWorkouts).toEqual(null);
  });

  it('updates a workout by id', async () => {
    const user = await User.insert(dummyUser);
    const createdWorkout = await Workout.insert(user.id, dummyWorkout);

    const updatedWorkout = await Workout.update({
      ...createdWorkout,
      name: 'new name',
      description: 'new desc',
      light: 20,
    });

    expect(updatedWorkout).toEqual({
      ...dummyWorkout,
      userID: user.id,
      id: createdWorkout.id,
      name: 'new name',
      description: 'new desc',
      light: 20,
    });
  });

  it('throws error if no workout found to update', async () => {
    const updatedWorkout = await Workout.update({
      ...dummyWorkout,
      id: 123213,
      name: 'new name',
      description: 'new desc',
      light: 20,
    });

    expect(updatedWorkout).toBeInstanceOf(TypeError);
  });

  it('deletes a workout by id', async () => {
    const user = await User.insert(dummyUser);
    const createdWorkout = await Workout.insert(user.id, dummyWorkout);

    const deletedWorkout = await Workout.delete(createdWorkout.id);

    expect(deletedWorkout).toEqual({
      ...dummyWorkout,
      userID: user.id,
      id: createdWorkout.id
    });
  });

  it('deletes all workouts with userID and returns null with get all', async () => {
    const user = await User.insert(dummyUser);

    await Workout.insert(user.id, dummyWorkout);
    await Workout.insert(user.id, dummyW2);
    await Workout.insert(user.id, dummyW3);

    const workouts = await Workout.getAll(user.id);

    expect(workouts).toEqual(expect.arrayContaining([
      { ...dummyWorkout, id: expect.any(Number), userID: user.id },
      { ...dummyW2, id: expect.any(Number), userID: user.id },
      { ...dummyW3, id: expect.any(Number), userID: user.id }]));

    await Workout.deleteAll(user.id);

    const nullWorkouts = await Workout.getAll(user.id);

    expect(nullWorkouts).toEqual(null);
  });

  it('updates a workout position by id', async () => {

    const user = await User.insert(dummyUser);

    await Workout.insert(user.id, dummyWorkout);
    await Workout.insert(user.id, dummyW2);
    const insertedWorkout = await Workout.insert(user.id, dummyW3);

    const workouts = await Workout.shift(insertedWorkout.id, 2);

    expect(workouts).toEqual(expect.arrayContaining([
      { ...dummyWorkout, id: expect.any(Number), userID: user.id, position: 1 },
      { ...dummyW2, id: expect.any(Number), userID: user.id, position: 3 },
      { ...dummyW3, id: expect.any(Number), userID: user.id, position: 2 }]));
  });

  it('increases position numbers when workout is inserted in the middle', async () => {
    const user = await User.insert(dummyUser);

    await Workout.insert(user.id, dummyWorkout);
    await Workout.insert(user.id, dummyW2);
    await Workout.insert(user.id, dummyW3);

    await Workout.insert(user.id, {
      ...dummyWorkout,
      name: 'position shifter',
      position: 2
    });

    const workouts = await Workout.getAll(user.id);

    expect(workouts).toEqual(expect.arrayContaining([
      {
        ...dummyWorkout,
        id: expect.any(Number),
        userID: user.id,
        name: 'position shifter',
        position: 2
      },
      { ...dummyWorkout, id: expect.any(Number), userID: user.id, position: 1 },
      { ...dummyW2, id: expect.any(Number), userID: user.id, position: 3 },
      { ...dummyW3, id: expect.any(Number), userID: user.id, position: 4 }]));
  });
  it('gets a workout count by user id', async () => {
    const user = await User.insert(dummyUser);


    await Workout.insert(user.id, dummyWorkout);
    await Workout.insert(user.id, dummyW2);
    await Workout.insert(user.id, dummyW3);


    const count = await Workout.getCount(user.id);
    const { length } = await Workout.getAll(user.id);
    expect(count).toEqual(length);
    expect(count).toEqual(3);
  });
});
