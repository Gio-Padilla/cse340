const invModel = require("../models/inventory-model")
const favoriteModel = require("../models/favorite-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (loggedIn = false) {
  // Fetch all classifications from the database
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  // Add Favorites link only if user is logged in
  if (loggedIn) {
    list += '<li><a href="/inv/my-favorites" title="Favorites Page">My Favorites</a></li>';
  }
  // Add links for all vehicle classifications
  data.rows.forEach((row) => {
    list += `<li><a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`;
  });
  list += "</ul>";
  // Return the built nav HTML
  return list;
};

/* ************************
 * Constructs the grid based off of the provided list of vehicles
 ************************** */
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
* Build Listing View HTML with Favorites
* ************************************ */
Util.buildListingHTML = async function(itemID, accountData = null) {
  let theData = await invModel.getInventoryByInvId(itemID)
  theData = theData[0]
  theData.inv_price = Number(theData.inv_price).toLocaleString()
  theData.inv_miles = Number(theData.inv_miles).toLocaleString()

  // Default favorite link
  let favoriteHTML = ''
  let favoriteNote = ''

  if (accountData) {
    // User is logged in, check if this item is already in their favorites
    const isFavorite = await favoriteModel.isFavorite(accountData.account_id, itemID)

    if (isFavorite) {
      // Already a favorite → show remove link
      favoriteHTML = ` - <a href="/inv/favorite/${itemID}" title="Remove from favorites" class='heart'>♥︎</a>`
      favoriteNote = '<p><u>Click the heart to remove from favorites list.</u></p>'
    } else {
      // Not a favorite → show add link
      favoriteHTML = ` - <a href="/inv/favorite/${itemID}" title="Add to favorites" class='heart'>♡</a>`
      favoriteNote = '<p><u>Click the heart to add to favorites list.</u></p>'
    }
  } else {
    // User not logged in → optionally no link or disabled link
    favoriteHTML = ''
    favoriteNote = ''
  }

  let theHTML = `
    <div class="listing-page">
      <img src="${theData.inv_image}" alt="${theData.inv_year} ${theData.inv_make} ${theData.inv_model}">
      <div>
        <h2>${theData.inv_make} ${theData.inv_model} Details${favoriteHTML}</h2>
        ${favoriteNote}
        <p><b>Price: </b>$${theData.inv_price}</p>
        <p><b>Description: </b>${theData.inv_description}</p>
        <p><b>Color: </b>${theData.inv_color}</p>
        <p><b>Miles: </b>${theData.inv_miles}</p>
      </div>
    </div>
  `
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
  res.locals.loggedin = 0

  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (!err) {
          res.locals.accountData = accountData
          res.locals.loggedin = 1
        }
        next()
      }
    )
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

 /* ****************************************
* Restrict access to Employee/Admin accounts
**************************************** */
Util.checkEmployeeAdmin = (req, res, next) => {
  // Must be logged in
  if (res.locals.loggedin && res.locals.accountData) {
    const accountType = res.locals.accountData.account_type
    if (accountType === 'Employee' || accountType === 'Admin') {
      return next()
    }
  }
  
  // If not authorized, redirect to login with message
  req.flash("notice", "You must be an Employee or Admin to access that page.")
  return res.redirect("/account/login")
}

module.exports = Util
