'use strict';

var Discord = require('discord.js');
var debug = require('debug')('discord');

var config = require('../../../configs');

var connectionParams = { autoReconnect: true, maxCachedMessages: 5 };

var bot = new Discord.Client(connectionParams);

const onReady = [
	function () { debug('ready'); }
];

function sendMessage(channels, message) {
	return new Promise((resolve, reject) => {
		if (!channels.length) {
			return reject(`no target channels available`);
		}

		var i = 0;
		var next = function () {
			let channel = channels[i++];

			if (!channel) {
				return resolve();
			}

			bot
				.sendMessage(channel, message)
				.then(() => debug('message:ok'))
				.catch(err => debug(err))
				.then(next);
		};

		next();
	});
}

bot
	.on('error', err => debug(err))
	.on('ready', () => {
		onReady.forEach(listener => listener(bot));
	});

setTimeout(() => {
	bot.loginWithToken(config.discord.token);
}, 100);

exports.MAXSIZE = 2000;
exports.Module = Discord;
exports.debug = debug;
exports.sendMessage = sendMessage;
exports.bot = function (options) {
	options = options || {};

	if (options.onReady) {
		onReady.push(options.onReady);
	}

	return bot;
};
