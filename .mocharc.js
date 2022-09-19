'use strict';

process.env.TS_NODE_COMPILER = "ts-compiler";

module.exports = {
	require: [
		'ts-node/register',
	],
	extension: ['ts'],
	timeout: 10000,
	checkLeaks: true,
	recursive: true,
	diff: true,
};
