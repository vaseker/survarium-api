'use strict';

const router  = require('express').Router();
const model   = require('./model');
const ctl     = require('./controller');
const config  = require('../../../configs');

if (config.v1.importer) {
	process.nextTick(require.bind(null, './importer'));
}

function getData(options) {
	options = options || {};

	var skip = Number(options.skip);
	var limit = Number(options.limit);

	var cursor = model[options.one ? 'findOne' : 'find'](options.search || {},
		`-_id -updatedAt -createdAt -__v${!options.populate ? ' -map -stats' : ''}`);

	cursor = cursor.sort(options.sort || { id: -1 });

	cursor = cursor.skip(isNaN(skip) ? 0 : Math.abs(skip));

	if (!options.one) {
		cursor = cursor.limit(isNaN(limit) ? 25 : (Math.abs(limit) || 25 ));
	}

	if (options.populate) {
		cursor.populate([
			{
				path: 'map',
				select: '-createdAt -updatedAt -__v -_id'
			},
			{
				path: 'stats',
				select: '-createdAt -updatedAt -__v -_id -clan -date -map -match -level',
				populate: {
					path: 'player',
					select: '-createdAt -updatedAt -__v -_id -ammunition -skills -stats -clan'
				}
			}
		]);
	}

	return cursor.lean();
}

/**
 * Получить информацию о матчах
 * @param {Object}  req
 * @param {Object}  req.query
 * @param {Number}  [req.query.level] уровень матчей
 * @param {Boolean} [req.query.slim]  не загружать вложенные документы
 */
router.get('/', function (req, res, next) {
	var query = req.query;
	var search = {};
	if (/^\d{1,2}$/.test(query.level)) {
		search.level = +query.level;
	}
	getData({ search: search, skip: query.skip, limit: query.limit, populate: !query.slim })
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * Получить информацию о статусе импортов матчей
 */
router.get('/meta', function (req, res, next) {
	return ctl
		.stats()
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * Получить последний матч
 * @param {Object}  req
 * @param {Object}  req.query
 * @param {Number}  [req.query.level] уровень матча
 * @param {Boolean} [req.query.slim]  не загружать вложенные документы
 */
router.get('/latest', function (req, res, next) {
	var query = req.query;
	var search = {};
	if (/^\d{1,2}$/.test(query.level)) {
		search.level = +query.level;
	}
	getData({ search: search, sort: { id: -1 }, one: true, populate: !query.slim })
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * Получить информацию о матче
 * @param {Object}  req
 * @param {Object}  req.query
 * @param {Boolean} [req.query.slim]  не загружать вложенные документы
 */
router.get('/:id', function (req, res, next) {
	var query = req.query;
	var id = Number(req.params.id);
	if (isNaN(id)) {
		return next(new Error('wrong type of id'));
	}

	getData({ search: { id: id }, one: true, populate: !query.slim })
		.then(res.json.bind(res))
		.catch(next);
});

module.exports = router;

