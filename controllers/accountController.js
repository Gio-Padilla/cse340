const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  res.render("account/login", {
    title: "Login",
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  res.render("account/register", {
    title: "Register",
    errors: null,
  })
}


/* ****************************************
*  Deliver account view
* *************************************** */
async function buildAccountView(req, res, next) {
  const accountData = res.locals.accountData;
  res.render("account/index", {
    title: "Account",
    errors: null,
    accountData,
  })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildAccountUpdate(req, res, next) {
  const accountData = res.locals.accountData;
  res.render("account/update", {
    title: "Update Account",
    errors: null,
    accountData,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      errors: null,
    })
  }
  
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Process Account Info Update
* *************************************** */
async function updateAccountData(req, res, next) {
  const { account_firstname, account_lastname, account_email } = req.body
  const account_id = res.locals.accountData.account_id

  try {
    const updatedAccount = await accountModel.updateAccountInfo(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (updatedAccount) {
      // Update JWT with new info
      const tokenData = { ...updatedAccount }
      const accessToken = jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })

      req.flash("notice", "Account information updated successfully.")
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Account update failed.")
      return res.status(500).render("account/update", {
        title: "Update Account",
        errors: null,
        accountData: res.locals.accountData,
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************************
*  Process Account Password Update
* *************************************** */
async function updateAccountPassword(req, res, next) {
  const { account_password } = req.body
  const account_id = res.locals.accountData.account_id

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(account_password, 10)

    const updatedAccount = await accountModel.updateAccountPassword(account_id, hashedPassword)

    if (updatedAccount) {
      req.flash("notice", "Password updated successfully.")
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Password update failed.")
      return res.status(500).render("account/update", {
        title: "Update Password",
        errors: null,
        accountData: res.locals.accountData,
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Process logout
 * ************************************ */
function logout(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
};

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountView,
  logout,
  buildAccountUpdate,
  updateAccountPassword,
  updateAccountData
}