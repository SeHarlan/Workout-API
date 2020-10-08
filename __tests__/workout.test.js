const Workout = require('../lib/models/workout')
const pool = require('../lib/utils/pool')
const fs = require('fs')

const dummyWorkout = {
  name: 'test name',
  description: 'test desc',
  heavy: 5,
  medium: 3,
  light: 1,
  position: 0
}
const dummyW2 = {
  name: 'test2 name',
  description: 'test2 desc',
  heavy: 10,
  medium: 5,
  light: 2,
  position: 1
}

const dummyW3 = {
  name: 'test3 name',
  description: 'test3 desc',
  heavy: 130,
  medium: 50,
  light: 20,
  position: 2
}

describe(' workout model', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'))
  })

  it('inserts a new workout to db', async () => {
    const createdWorkout = await Workout.insert(dummyWorkout)

    const { rows: selectedWorkouts } = await pool.query(
      'SELECT * FROM workouts WHERE id = $1',
      [createdWorkout.id]
    );
    expect(selectedWorkouts[0]).toEqual(createdWorkout)
  })

  it('finds a workout by id', async () => {
    const createdWorkout = await Workout.insert(dummyWorkout)

    const foundWorkout = await Workout.findById(createdWorkout.id)

    expect(foundWorkout).toEqual({
      ...dummyWorkout,
      id: createdWorkout.id
    })
  })

  it('returns null if no dog is found by id', async () => {
    const nullWorkout = await Workout.findById(234234234)
    expect(nullWorkout).toEqual(null)
  })

  it('gets all workouts', async () => {
    await Promise.all([
      Workout.insert(dummyWorkout),
      Workout.insert(dummyW2),
      Workout.insert(dummyW3)
    ])

    const workouts = await Workout.getAll()

    expect(workouts).toEqual(expect.arrayContaining([
      { ...dummyWorkout, id: expect.any(Number) },
      { ...dummyW2, id: expect.any(Number) },
      { ...dummyW3, id: expect.any(Number) }]))
  })

  it('updates a workout by id', async () => {
    const createdWorkout = await Workout.insert(dummyWorkout)

    const updatedWorkout = await Workout.update({
      ...createdWorkout,
      name: 'new name',
      description: 'new desc',
      light: 20,
    })

    expect(updatedWorkout).toEqual({
      ...dummyWorkout,
      id: createdWorkout.id,
      name: 'new name',
      description: 'new desc',
      light: 20,
    })
  })

  it('throws error if no workout found to update', async () => {
    const updatedWorkout = await Workout.update({
      ...dummyWorkout,
      id: 123213,
      name: 'new name',
      description: 'new desc',
      light: 20,
    })

    expect(updatedWorkout).toBeInstanceOf(TypeError)
  })

  it('updates a workout position by id', async () => {
    const createdWorkout = await Workout.insert(dummyWorkout)

    const updatedWorkout = await Workout.update({
      ...dummyWorkout,
      id: createdWorkout.id,
      position: 5
    })

    expect(updatedWorkout).toEqual({
      ...dummyWorkout,
      id: createdWorkout.id,
      position: 5
    })
  })

  it('deletes a workout by id', async () => {
    const createdWorkout = await Workout.insert(dummyWorkout)

    const deletedWorkout = await Workout.delete(createdWorkout.id)

    expect(deletedWorkout).toEqual({
      ...dummyWorkout,
      id: createdWorkout.id
    })
  })
})