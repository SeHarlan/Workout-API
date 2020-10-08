const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');

const dummyWorkout = {
  name: 'test name',
  description: 'test desc',
  heavy: 5,
  medium: 3,
  light: 1,
  position: 0
}

// describe('Workout-API routes', () => {
//   beforeEach(() => {
//     return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'))
//   });

//   it('creates a new workout via POST', async () => {
//     const response = await request(app)
//       .post('/api/v1/workouts')
//       .send(dummyWorkout)

//     expect(response.body).toEqual({
//       ...dummyWorkout,
//       id: expect.any(Number)
//     })
//   })
// });
