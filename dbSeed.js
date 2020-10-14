const User = require('./lib/models/user');
const Workout = require('./lib/models/workout');
const pool = require('./lib/utils/pool');
const fs = require('fs');
const { dummyWorkout, dummyW2, dummyW3, dummyUser } = require('./__tests__/dummyData.json');


async function seed() {
  await pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));

  const createdUser = await User.insert(dummyUser);
  const createdUser2 = await User.insert({
    name: 'user 2',
    passwordHash: 'hash 2'
  });

  await Promise.all([
    Workout.insert(createdUser.id, dummyWorkout),
    Workout.insert(createdUser.id, dummyW2),
    Workout.insert(createdUser2.id, dummyW3)
  ]);

  pool.end();
}


seed();
