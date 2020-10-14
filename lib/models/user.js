const pool = require('../utils/pool');
const Workout = require('./workout');

class User {
  constructor(row) {
    this.id = row.id;
    this.name = row.name;
    this.passwordHash = row.password_hash;
  }

  static insert(user) {
    return pool.query(
      `INSERT INTO users (name, password_hash) 
        VALUES ($1, $2)
        RETURNING *`,
      [user.name, user.passwordHash]
    )
      .then((res) => new User(res.rows[0]))
      .catch(error => error);
  }
  static findById(id) {
    return pool.query(
      `SELECT * FROM users
        WHERE id = $1`,
      [id]
    )
      .then((res) => {
        if (!res.rows[0]) return null;
        return new User(res.rows[0]);
      })
      .catch(error => error);
  }
  static getAll() {
    return pool.query(
      'SELECT * FROM users', []
    )
      .then(res => {
        if (!res.rows[0]) return null;
        return res.rows.map(user => new User(user));
      })
      .catch(error => error);
  }
  static update(updatedUser) {
    return pool.query(
      `UPDATE users
        SET name = $1,
            password_hash = $2
        WHERE id = $3
        RETURNING *`,
      [updatedUser.name, updatedUser.passwordHash, updatedUser.id]
    )
      .then(res => new User(res.rows[0]))
      .catch(error => error);
  }
  static async delete(id) {
    const workoutError = await Workout.deleteAll(id);

    if (workoutError) return workoutError;

    return pool.query(
      `DELETE FROM users
        WHERE id = $1
        RETURNING *`,
      [id]
    )
      .then(res => new User(res.rows[0]))
      .catch(error => error);
  }
}


module.exports = User;
