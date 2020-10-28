const pool = require('../utils/pool');

class Workout {
  constructor(row) {
    this.id = row.id;
    this.userID = row.user_id;
    this.name = row.name;
    this.description = row.description;
    this.heavy = row.heavy;
    this.medium = row.medium;
    this.light = row.light;
    this.position = row.position;
  }

  static async insert(userID, workout) {
    const newWorkout = await pool.query(
      `INSERT INTO workouts (name, description, heavy, medium, light, position, user_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [workout.name, workout.description, workout.heavy, workout.medium, workout.light, workout.position, userID]
    )
      .then(res => new Workout(res.rows[0]))
      .catch(err => err);

    const { length } = await this.getAll(userID);

    const shiftNeeded = (workout.position < length);

    if (shiftNeeded) await this.shift(newWorkout.id, newWorkout.position);

    return newWorkout;
  }

  static async shift(workoutID, newPosition) {
    const { userID } = await pool.query(
      `UPDATE workouts
        SET position = $1
        WHERE id = $2
        RETURNING *`,
      [newPosition, workoutID]
    )
      .then((res) => {
        return new Workout(res.rows[0]);
      })
      .catch(err => console.log('updates new position error', err));

    await pool.query(
      `UPDATE workouts 
        SET position = position + 1
        WHERE user_id = $1 AND position >= $2 AND id != $3`,
      [userID, newPosition, workoutID]
    )
      .catch(err => console.log('updates all positions error', err));

    const workouts = await this.getAll(userID);
    return workouts;
  }

  static findById(workoutID) {
    return pool.query(
      `SELECT * FROM workouts 
        WHERE id = $1`,
      [workoutID]
    )
      .then((res) => {
        if (!res.rows[0]) return null;
        return new Workout(res.rows[0]);
      })
      .catch(err => err);
  }

  static getAll(userID) {
    return pool.query(
      `SELECT * FROM workouts
      WHERE user_id = $1`, [userID]
    )
      .then((res) => {
        if (!res.rows[0]) return null;
        return res.rows.map((workout) => new Workout(workout));
      })
      .catch(err => err);
  }

  static getCount(userID) {
    return pool.query(
      `SELECT COUNT(*) FROM workouts
      WHERE user_id = $1`, [userID]
    )
      .then(res => parseInt(res.rows[0].count))
      .catch(err => err);
  }

  static update(updatedWorkout) {
    return pool.query(
      `UPDATE workouts
        SET name = $1,
            description = $2,
            heavy = $3,
            medium = $4,
            light = $5
        WHERE id = $6
        RETURNING *`,
      [
        updatedWorkout.name,
        updatedWorkout.description,
        updatedWorkout.heavy,
        updatedWorkout.medium,
        updatedWorkout.light,
        updatedWorkout.id
      ]
    )
      .then(res => new Workout(res.rows[0]))
      .catch(err => err);
  }

  static delete(workoutID) {
    return pool.query(
      `DELETE FROM workouts
        WHERE id = $1
        RETURNING *`,
      [workoutID]
    )
      .then(res => new Workout(res.rows[0]))
      .catch(err => err);
  }
  static deleteAll(userID) {
    return pool.query(
      `DELETE FROM workouts
        WHERE user_id = $1
        RETURNING *`,
      [userID]
    )
      .then(() => null)
      .catch(err => err);
  }
}

module.exports = Workout;
