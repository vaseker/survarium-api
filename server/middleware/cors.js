'use strict';

const config = require('../configs');

module.exports = function (req, res, next) {
	res.header("Access-Control-Allow-Origin", config.cors.origin || '*');
	res.header("Access-Control-Allow-Credentials", true);
	res.header("Access-Control-Allow-Methods", 'GET, POST, PUT, DELETE');
	res.header("Access-Control-Allow-Headers", 'Origin, Content-Type, Accept, Authorization');
	req.method === 'options' ? res.end() : next();
};
