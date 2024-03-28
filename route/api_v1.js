const router = require("express").Router();
const pool = require("../db/db_pool");

router.get("/", async(req, res) => {
	res.status(200).end();
});

function getColumnName(sensor){
	switch(sensor){
		case "all":return "*";
		case "temperature":	return "datetime, temp"
		case "humidity":		return "datetime, humid"
		case "pressure":		return "datetime, press"
		case "co2":				return "datetime, co2"
		default:					throw new Error("sensor name should be all, temperature, humidity, pressure, or co2.");
	}
}

router.get("/:sensor/latest", async(req, res) => {
	let sqlCol;

	try{
		sqlCol = getColumnName(req.params.sensor);
	} catch (e) { return res.status(404).send(`bad sensor name. ${e.toString()} e.g./all/latest`); }
	
	try{
		let dbRes = await pool.query(`select ${sqlCol} from sensor order by datetime desc limit 1`);
		return res.status(200).json(dbRes[0]);
	} catch(err) {
		return res.status(500).json({mes:err.toString()});
	}
});

router.get("/:sensor/history", async(req, res) => {
	const timeNum  = "past" in req.query? Number(req.query.past) : 3;
	const timeUnit = "unit" in req.query? req.query.unit.trim().toLowerCase() : "hour";

	if (!typeof timeNum === "number"  ||  Number.isNaN(timeNum)){
		return res.status(404).send('parameter "past" must be an integer.');
	}

	if (!typeof timeUnit === "string" || !timeUnit.match(/^(month|week|day|hour|minute)$/)){
		return res.status(404).send('parameter "unit" must be month, week, day, hour, or minute.');
	}

	let sqlCol;
	try{
		sqlCol = getColumnName(req.params.sensor);
	} catch (e) { return res.status(404).send(`bad sensor name. ${e.toString()} e.g./all/latest`); }
	
	try {
		let dbRes = await pool.query(
			`select ${sqlCol} from sensor where datetime >= date_add(now(), interval ${-1 * timeNum} ${timeUnit}) order by datetime asc`
		);
		return res.status(200).json(dbRes);
	} catch(err) {
		return res.status(500).json({mes:err.toString()});
	}
});

module.exports = router;