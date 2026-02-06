const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  // console.log(data) // Displays the data that was returned.
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

Util.buildClassificationGrid = async function(data){
  let grid = ""

  if (data && data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid += '<a href="/inv/detail/' + vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + ' details"><img src="' + vehicle.inv_thumbnail 
      + '" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      + ' on CSE Motors" /></a>'

      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="/inv/detail/' + vehicle.inv_id + '" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'

      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'

      grid += '</div>'
      grid += '</li>'
    })

    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  return grid
}


/* **************************************
* Build Listing View HTML
* ************************************ */
Util.buildListingHTML = async function(itemID) {
  let theData = await invModel.getInventoryByInvId(itemID)
  theData = theData[0]
  theData.inv_price = Number(theData.inv_price).toLocaleString()
  theData.inv_miles = Number(theData.inv_miles).toLocaleString()
  // console.log(theData) // Testing to see how the data gets returned
  let theHTML = `
    <div class="listing-page">
      <img src="${theData.inv_image}" alt="${theData.inv_year} ${theData.inv_make} ${theData.inv_model}">
      <div>
        <h2>${theData.inv_make} ${theData.inv_model} Details</h2>
        <p><b>Price: </b>$${theData.inv_price}</p>
        <p><b>Description: </b>${theData.inv_description}</p>
        <p><b>Color: </b>${theData.inv_color}</p>
        <p><b>Miles: </b>${theData.inv_miles}</p>
      </div>
    </div>
  `
  // console.log(theHTML) // Testing to see if the HTML looks good
  return theHTML
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
* Build classification dropdown list
**************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  const result = await invModel.getClassifications();
  const classifications = result.rows;

  let list = '<select name="classification_id" required id="classificationList">';
  list += '<option value="" disabled selected>Select Classification...</option>';

  classifications.forEach(classification => {
    list += `<option value="${classification.classification_id}"`;

    if (classification.classification_id == classification_id) {
      list += " selected";
    }

    list += `>${classification.classification_name}</option>`;
  });

  list += "</select>";
  return list;
};



/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

module.exports = Util
