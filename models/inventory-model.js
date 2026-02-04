const pool = require("../database/")

/* ***********************************************************************
 *  Get all classification data
 * ********************************************************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ******************************************************************
 *   Check for existing classification
 * ***************************************************************** */
async function checkExistingclassification(classificationName){
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const classification = await pool.query(sql, [classificationName])
    return classification.rowCount
  } catch (error) {
    return error.message
  }
}

/* ******************************************************************
 *   Add item to inventory 
 *   Now uses classification_id directly instead of classification_name
 * ***************************************************************** */
async function addInventory({
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color,
  classification_id // <- now expects numeric ID directly
}) {
  try {
    // Insert the new vehicle
    const sql = `
      INSERT INTO inventory (
        inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles,
        inv_color, classification_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `;

    const values = [
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id // <- use the ID directly
    ];

    const result = await pool.query(sql, values);
    return result.rows[0]; // return the newly added vehicle

  } catch (error) {
    console.error("Error adding inventory:", error.message);
    return { error: error.message };
  }
}


/* ***********************************************************************
 *  Get all inventory items and classification_name by classification_id
 * ********************************************************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***********************************************************************
 *  Get Item by its ID
 * ********************************************************************** */
async function getInventoryByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 * Add new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO classification (classification_name)
      VALUES ($1)
      RETURNING *`;
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    console.error("addClassification error:", error);
    return { error: error.message };
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      `UPDATE public.inventory
      SET inv_make = $1,inv_model = $2, inv_description = $3,
      inv_image = $4, inv_thumbnail = $5, inv_price = $6,
      inv_year = $7, inv_miles = $8, inv_color = $9,
      classification_id = $10 WHERE inv_id = $11
      RETURNING *`
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getInventoryByInvId, checkExistingclassification, addInventory, addClassification, updateInventory}