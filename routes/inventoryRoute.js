// Needed Resources 
const express = require("express")
const router = new express.Router() 
const inventoryController = require("../controllers/invController")
const inventoryValidate = require('../utilities/inventory-validation')
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", inventoryController.buildByClassificationId);

// Route to build inventory by Item view
router.get("/detail/:itemId", inventoryController.buildByItemID);

// Route to Inventory Management
router.get("/", inventoryController.buildInvOptions);

// Route to add classification
router.get("/add-classification", inventoryController.buildAddClassification);
// Process the add classification
router.post(
  "/add-classification",
  inventoryValidate.classificationRules(),
  inventoryValidate.checkClassificationData,
  utilities.handleErrors(inventoryController.addClassification)
);

// Route to Add Inventory
router.get("/add-inventory", inventoryController.buildAddInventory);
// Process the add inventory
router.post(
  "/add-inventory",
  inventoryValidate.vehicleRules(),
  inventoryValidate.checkInventoryData,
  utilities.handleErrors(inventoryController.addVehicle)
);

// Route to edit Class Table
router.get("/getInventory/:classification_id", utilities.handleErrors(inventoryController.getInventoryJSON))

// Route to build edit view
router.get("/edit/:itemId", utilities.handleErrors(inventoryController.buildEditInventory))

// Process the inventory edit request
router.post(
  "/edit/:itemId",
  inventoryValidate.vehicleRules(),
  inventoryValidate.checkUpdateData,
  inventoryController.updateInventory
);

// Route to build delete view
router.get("/delete/:itemId", utilities.handleErrors(inventoryController.buildDeleteInventory))

// Process the inventory edit request
router.post(
  "/delete/:itemId",
  utilities.handleErrors(inventoryController.confirmDeleteInventory)
);

module.exports = router;