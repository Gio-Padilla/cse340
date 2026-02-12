// Needed Resources 
const express = require("express")
const router = new express.Router() 
const inventoryController = require("../controllers/invController")
const inventoryValidate = require('../utilities/inventory-validation')
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(inventoryController.buildByClassificationId)
);

// Route to build favorites view
router.get(
  "/my-favorites",
  utilities.checkLogin,
  utilities.handleErrors(inventoryController.buildByFavorites)
);

// Route to build inventory by Item view
router.get(
  "/detail/:itemId",
  utilities.handleErrors(inventoryController.buildByItemID)
);

// Route to Inventory Management
router.get(
  "/",
  utilities.checkEmployeeAdmin,
  utilities.handleErrors(inventoryController.buildInvOptions)
);

// Route to add classification
router.get(
  "/add-classification",
  utilities.checkEmployeeAdmin,
  utilities.handleErrors(inventoryController.buildAddClassification)
);
// Process the add classification
router.post(
  "/add-classification",
  utilities.checkEmployeeAdmin,
  inventoryValidate.classificationRules(),
  inventoryValidate.checkClassificationData,
  utilities.handleErrors(inventoryController.addClassification)
);

// Route to Add Inventory
router.get(
  "/add-inventory",
  utilities.checkEmployeeAdmin,
  utilities.handleErrors(inventoryController.buildAddInventory)
);
// Process the add inventory
router.post(
  "/add-inventory",
  utilities.checkEmployeeAdmin,
  inventoryValidate.vehicleRules(),
  inventoryValidate.checkInventoryData,
  utilities.handleErrors(inventoryController.addVehicle)
);

// Route to edit Class Table
router.get(
  "/getInventory/:classification_id",
  utilities.checkEmployeeAdmin,
  utilities.handleErrors(inventoryController.getInventoryJSON)
);

// Route to build edit view
router.get(
  "/edit/:itemId",
  utilities.checkEmployeeAdmin,
  utilities.handleErrors(inventoryController.buildEditInventory)
);

// Process the inventory edit request
router.post(
  "/edit/:itemId",
  utilities.checkEmployeeAdmin,
  inventoryValidate.vehicleRules(),
  inventoryValidate.checkUpdateData,
  utilities.handleErrors(inventoryController.updateInventory)
);

// Route to build delete view
router.get(
  "/delete/:itemId",
  utilities.checkEmployeeAdmin,
  utilities.handleErrors(inventoryController.buildDeleteInventory)
);

// Process the inventory edit request
router.post(
  "/delete/:itemId",
  utilities.checkEmployeeAdmin,
  utilities.handleErrors(inventoryController.confirmDeleteInventory)
);

router.get(
  "/favorite/:invId",
  utilities.checkLogin,
  utilities.handleErrors(inventoryController.toggleFavorite)
);

module.exports = router;