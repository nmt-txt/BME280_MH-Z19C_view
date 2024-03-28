const mariadb = require("mariadb");
const pool = mariadb.createPool({
	host:     "localhost",
	user:     /*ユーザ名*/,
	password: /*パスワード*/,
	database: /*データベース名*/,
	connectionLimit: 5,
});

module.exports = pool;