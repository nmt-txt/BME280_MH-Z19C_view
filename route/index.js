const express = require('express');
const router = express.Router();
const path = require('path');

router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "../view/index.html"));
});

router.use("/api/v1", require("./api_v1"));

module.exports = router;