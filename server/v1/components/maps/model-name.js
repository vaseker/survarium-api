const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const db = require('../../lib/db');
const config = require('../../../configs');

const Schema = mongoose.Schema;

const langs = config.api.languages.reduce(function (prev, next) {
	prev[next] = {
		title: {
			type: String,
			required: true,
			trim: true
		}
	};
	return prev;
}, {});

const MapName = new Schema({
	id: {
		type: Schema.Types.ObjectId,
		ref : 'Maps'
	},
	langs: langs,
	deletedAt: Date
});

MapName.plugin(timestamps);

module.exports = db.model('MapName', MapName);
