const utilities = require(".")
const { body, validationResult } = require("express-validator")
const inventoryModel = require("../models/inventory-model")
const validate = {}

/*  **********************************
*  Classification Validation Rules
* ********************************* */
validate.classificationRules = () => {
  return [
    body("classification_name")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("A valid classification is required.")
    .custom(async (classification_name) => {
      const classificationExists = await inventoryModel.checkExistingclassification(classification_name)
      if (classificationExists){
        throw new Error("Classification already exists. Please use a different one.")
      }
    }),
  ]
}

/*  **********************************
*  Classification Vehicle Rules
* ********************************* */
validate.vehicleRules = () => {
  return [
    // Classification (required)
    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a valid classification."),

    // Make: required, string, at least 4 characters
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters."),

    // Model: required, string, at least 4 characters
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters."),

    // Description: required, string, at least 10 characters
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters."),

    // Image path: required
    body("inv_image")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a valid image path."),

    // Thumbnail path: required
    body("inv_thumbnail")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a valid thumbnail path."),

    // Price: required, numeric, >0, max 2 decimals
    body("inv_price")
      .trim()
      .notEmpty()
      .withMessage("Please provide a valid price.")
      .isFloat({ min: 0.01 })
      .withMessage("Price must be greater than 0.")
      .custom((value) => {
        // Ensure max 2 decimal places
        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          throw new Error("Price can have at most 2 decimal places.");
        }
        return true;
      }),

    // Year: required, numeric, 4-digit
    body("inv_year")
      .trim()
      .notEmpty()
      .withMessage("Please provide a valid year.")
      .isInt({ min: 1000, max: 9999 })
      .withMessage("Year must be a 4-digit number."),

    // Miles: required, numeric, >=0
    body("inv_miles")
      .trim()
      .notEmpty()
      .withMessage("Please provide the mileage.")
      .isInt({ min: 0 })
      .withMessage("Miles must be a non-negative number."),

    // Color: required, string, at least 2 characters
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Color must be at least 2 characters."),
  ]
}


/* ******************************
 * Check data and return errors or continue to Add Classification
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Classification",
      classification_name,
    })
    return
  }
  next()
}

/* ******************************
 * Check data and return errors or continue to Add Inventory/Vehicle
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    try {
      const classificationsOptions = await utilities.buildClassificationList()

      res.render("inventory/add-inventory", {
        errors: errors.array(),
        title: "Add New Inventory",
        classificationList: classificationsOptions,  // Pass classifications for dropdown
        // Re-populate all form fields
        classification_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send("Server Error");
    }
    return;
  }

  next();
};

/* ******************************
 * Check data and return errors for Edit Inventory or Continue
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    try {
      const classificationsOptions = await utilities.buildClassificationList(classification_id)
      const title = `Edit ${inv_make} ${inv_model}`;

      res.render("inventory/edit-inventory", {
        errors: errors.array(),
        title,
        classificationList: classificationsOptions,  // Pass classifications for dropdown
        // Re-populate all form fields
        inv_id,
        classification_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send("Server Error");
    }
    return;
  }

  next();
};

module.exports = validate