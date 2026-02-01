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
  inventoryController.addClassification
);

// Route to Add Inventory
router.get("/add-inventory", inventoryController.buildAddInventory);
// Process the add inventory
router.post(
  "/add-inventory",
  inventoryValidate.vehicleRules(),
  inventoryValidate.checkInventoryData,
  inventoryController.addVehicle
);

module.exports = router;