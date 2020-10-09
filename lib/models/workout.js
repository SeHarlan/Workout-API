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

  static insert(id, workout) {
    return pool.query(
      `INSERT INTO workouts (name, description, heavy, medium, light, position, user_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
      [workout.name, workout.description, workout.heavy, workout.medium, workout.light, workout.position, id]
    )
      .then((res) => new Workout(res.rows[0]))
      .catch(err => err);
  }

  static findById(id) {
    return pool.query(
      `SELECT * FROM workouts 
        WHERE id = $1`,
      [id]
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

  static update(updatedWorkout) {
    return pool.query(
      `UPDATE workouts
        SET name = $1,
            description = $2,
            heavy = $3,
            medium = $4,
            light = $5,
            position = $6
        WHERE id = $7
        RETURNING *`,
      [
        updatedWorkout.name,
        updatedWorkout.description,
        updatedWorkout.heavy,
        updatedWorkout.medium,
        updatedWorkout.light,
        updatedWorkout.position,
        updatedWorkout.id
      ]
    )
      .then(res => new Workout(res.rows[0]))
      .catch(err => err);
  }

  static delete(id) {
    return pool.query(
      `DELETE FROM workouts
        WHERE id = $1
        RETURNING *`,
      [id]
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
