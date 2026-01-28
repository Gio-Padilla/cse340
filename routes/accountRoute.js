// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')
const accountController = require("../controllers/accountController")

// Route to build login view
router.get("/login", accountController.buildLogin);

// Route to build the creat account view
router.get("/register", accountController.buildRegister);

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// https://byui-cse.github.io/cse340-ww-content/views/account-login.html
// Double check "The Login View Route" step #5
// I added this part in the server.js file

module.exports = router;