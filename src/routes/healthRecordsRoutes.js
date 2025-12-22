const express = require("express");
const healthRecordsRouter = express.Router();
const healthRecordsController = require("../controllers/healthRecordsController");


healthRecordsRouter.get("/healthSolutions", healthRecordsController.getHealthSolutions)

healthRecordsRouter.get("/professionalsData", healthRecordsController.professionalsData);



module.exports = healthRecordsRouter;