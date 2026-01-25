const error = {}

error.throw500 = function(req, res, next) {
  // This intentionally throws an error
  const err = new Error("This is a simulated 500 error for testing") // I found that this is good to add
  err.status = 500
  next(err) // Pass the error to the middleware
}

module.exports = error
