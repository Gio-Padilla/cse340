const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data.length ? data[0].classification_name : "Vehicles"
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  })
}

/* ***************************
 *  Build Listing by ID view
 * ************************** */
invCont.buildByItemID = async function (req, res, next) {
  const itemID = req.params.itemId  // matches :itemId in the route
  const data = await invModel.getInventoryByInvId(itemID)
  const item = data[0]
  const listing = await utilities.buildListingHTML(itemID)
  const nav = await utilities.getNav()
  const title = `${item.inv_year} ${item.inv_make} ${item.inv_model}`
  res.render("inventory/listing", {
    title,
    nav,
    listing,
    errors: null,
  })
}

/* ***************************
 *  Build Vehicle Management Links
 * ************************** */
invCont.buildInvOptions = async function (req, res, next) {
  const nav = await utilities.getNav()
  const title = "Vehicle Management"

  const classificatoinSelect = await utilities.buildClassificationList()

  res.render("inventory/management", {
    title,
    nav,
    classificatoinSelect: classificatoinSelect,
    errors: null,
  })
}

/* ***************************
 *  Build Add Classification
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  const title = "Add New Classification"
  res.render("inventory/add-classification", {
    title,
    nav,
    errors: null,
    classification_name: "",
  })
}


/* ***************************
 *  Build Add Inventory
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const title = "Add New Inventory";

    const classificationsOptions = await utilities.buildClassificationList()

    res.render("inventory/add-inventory", {
      title,
      nav,
      errors: null,
      classificationList: classificationsOptions,
      // Add default empty values for all form fields
      classification_id: "",
      inv_make: "",
      inv_model: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_price: "",
      inv_year: "",
      inv_miles: "",
      inv_color: "",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

/* ***************************
 *  Helper: Render Add Inventory Form
 * ************************** */
async function renderAddInventoryForm(res, data = {}, errors = null) {
  const nav = await utilities.getNav();
  const classificationsOptions = await utilities.buildClassificationList()

  return res.render("inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationList: classificationsOptions,
    errors,
    classification_id: data.classification_id || "",
    inv_make: data.inv_make || "",
    inv_model: data.inv_model || "",
    inv_description: data.inv_description || "",
    inv_image: data.inv_image || "/images/vehicles/no-image.png",
    inv_thumbnail: data.inv_thumbnail || "/images/vehicles/no-image-tn.png",
    inv_price: data.inv_price || "",
    inv_year: data.inv_year || "",
    inv_miles: data.inv_miles || "",
    inv_color: data.inv_color || "",
  });
}

/* ***************************
 *  Process Add Inventory / Vehicle
 * ************************** */
invCont.addVehicle = async function (req, res, next) {
  const errors = require("express-validator").validationResult(req);

  // Validation errors
  if (!errors.isEmpty()) {
    return renderAddInventoryForm(res, req.body, errors.array());
  }

  try {
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

    const result = await invModel.addInventory({
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id: classification_id
    });

    if (result.error) {
      req.flash("notice", `Sorry, vehicle could not be added: ${result.error}`);
      return renderAddInventoryForm(res, req.body);
    }

    req.flash("notice", `${inv_make} ${inv_model} has been added to inventory!`);
    return res.redirect("/inv/");
  } catch (error) {
    console.error(error);
    req.flash("notice", "Sorry, there was a server error adding the vehicle.");
    return renderAddInventoryForm(res, req.body);
  }
};

/* ***************************
 *  Process Add Classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const errors = require("express-validator").validationResult(req);

  const nav = await utilities.getNav();
  const classification_name = req.body.classification_name;

  // Validation errors
  if (!errors.isEmpty()) {
    return res.status(400).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array(),
      classification_name,
    });
  }

  try {
    const result = await invModel.addClassification(classification_name);

    if (result.error) {
      req.flash("notice", "Classification could not be added.");
      return res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
        classification_name,
      });
    }

    req.flash("notice", `${classification_name} classification added successfully.`);
    return res.redirect("/inv/");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  try {
    const inventoryId = parseInt(req.params.itemId)
    const nav = await utilities.getNav();
    const inventoryData = (await invModel.getInventoryByInvId(inventoryId))[0]
    // console.log(inventoryData) // Used as a test
    const classificationSelect = await utilities.buildClassificationList(inventoryData.classification_id)
    // console.log(classificationSelect) // Used as a test
    const itemName = `${inventoryData.inv_make} ${inventoryData.inv_model}`

    res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList: classificationSelect,
      errors: null,
      inv_id: inventoryData.inv_id,
      inv_make: inventoryData.inv_make,
      inv_model: inventoryData.inv_model,
      inv_year: inventoryData.inv_year,
      inv_description: inventoryData.inv_description,
      inv_image: inventoryData.inv_image,
      inv_thumbnail: inventoryData.inv_thumbnail,
      inv_price: inventoryData.inv_price,
      inv_miles: inventoryData.inv_miles,
      inv_color: inventoryData.inv_color,
      classification_id: inventoryData.classification_id
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
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
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
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
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationSelect,
    errors: null,
    inv_id,
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
    })
  }
}

module.exports = invCont