const pool = require("../database")

/* *****************************
 * Add favorite
 * ***************************** */
async function addFavorite(account_id, inv_id) {
  try {
    const sql = `
      INSERT INTO favorites (account_id, inv_id)
      VALUES ($1, $2)
      RETURNING *
    `
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rows[0]
  } catch (error) {
    if (error.code === "23505") {
      throw new Error("Vehicle already in favorites.")
    }
    throw error
  }
}

/* *****************************
 * Remove favorite
 * ***************************** */
async function removeFavorite(account_id, inv_id) {
  try {
    const sql = `
      DELETE FROM favorites
      WHERE account_id = $1 AND inv_id = $2
      RETURNING *
    `
    const result = await pool.query(sql, [account_id, inv_id])

    if (result.rowCount === 0) {
      throw new Error("Favorite not found.")
    }

    return result.rows[0]
  } catch (error) {
    throw error
  }
}

/* *****************************
 * Get user's favorites
 * ***************************** */
async function getUsersFavorites(account_id) {
  try {
    const sql = `
      SELECT
        f.favorite_id,
        f.favorite_date,
        i.*
      FROM favorites f
      JOIN inventory i
        ON f.inv_id = i.inv_id
      WHERE f.account_id = $1
      ORDER BY f.favorite_date DESC
    `;
    const result = await pool.query(sql, [account_id]);

    // Return empty array if no favorites
    return result.rows;
  } catch (error) {
    throw error;
  }
}

/* *****************************
 * Check if item is already a favorite
 * ***************************** */
async function isFavorite(account_id, inv_id) {
  try {
    const sql = `
      SELECT favorite_id
      FROM favorites
      WHERE account_id = $1
        AND inv_id = $2
      LIMIT 1
    `
    const result = await pool.query(sql, [account_id, inv_id])

    // true if found, false otherwise
    return result.rowCount > 0
  } catch (error) {
    throw error
  }
}

module.exports = {
  addFavorite,
  removeFavorite,
  getUsersFavorites,
  isFavorite
}