const express = require('express');
const symptomsRouter = express.Router();
const symptomController = require('../controllers/symptomsController');
const authRouter = require("../middlewares/requireAuth");
const {uploadToDisk} = require("../config/multerConfig");

symptomsRouter.post('/addSymptoms',authRouter, symptomController.addSymptoms);
symptomsRouter.post("/patientData", symptomController.patientData);
symptomsRouter.post("/patientVoiceData",uploadToDisk.single("file"), symptomController.patientVoiceData)

module.exports = symptomsRouter;