const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  // req.flash("notice", "This is a flash message.")
  res.render("index", {
    title: "Home",
    errors: null,
  })
}

module.exports = baseController