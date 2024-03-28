const express = require("express");
const app = express();
const path = require('path');

app.all("*", (req, res, next) => {
	console.log(`\[${req.method}\] ${req.originalUrl}`);
	next();
});


app.use("/", require("./route/index"));
app.use(express.static(path.join(__dirname, "public")));

app.all("*", (req, res) => {
	return res.sendStatus(404);
});

app.listen(3000,() => {
	console.log("Listening port 3000");
});
