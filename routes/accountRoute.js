// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')
const accountController = require("../controllers/accountController")

// Route to build login view
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
);

// Route to build the creat account view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// Route to account view
// router.get("/", accountController.buildAccountView);
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountView)
)

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// https://byui-cse.github.io/cse340-ww-content/views/account-login.html
// Double check "The Login View Route" step #5
// I added this part in the server.js file

// Process login
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
  //(req, res) => {res.status(200).send('login process')}
)

// Process Logout
router.get(
  "/logout",
  utilities.handleErrors(accountController.logout)
);

// Route to Update Account Info
router.get(
  "/update/:accountId",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountUpdate)
);

// Process Update Account Info
router.post(
  "/update/:accountId",
  utilities.checkLogin,
  regValidate.registrationRules({ testPassword: false, noRepeatEmail: false }),
  regValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccountData)
);

// Process Update Password
router.post(
  "/update-password/:accountId",
  utilities.checkLogin,
  regValidate.registrationRules({ testUserInfo: false }),
  regValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccountPassword)
);

module.exports = router;