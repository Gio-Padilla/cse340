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
  classification_name
}) {
  try {
    // Get the classification ID from the name
    const classResult = await pool.query(
      "SELECT classification_id FROM classification WHERE classification_name = $1",
      [classification_name]
    );

    // Throw an error if not found
    if (classResult.rowCount === 0) {
      throw new Error(`Classification '${classification_name}' not found`);
    }

    // Defines the classification ID
    const classification_id = classResult.rows[0].classification_id;

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
      classification_id
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


module.exports = {getClassifications, getInventoryByClassificationId, getInventoryByInvId, checkExistingclassification, addInventory, addClassification}