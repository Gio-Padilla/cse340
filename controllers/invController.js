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
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
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
  res.render("./inventory/listing", {
    title,
    nav,
    listing,
  })
}


module.exports = invCont