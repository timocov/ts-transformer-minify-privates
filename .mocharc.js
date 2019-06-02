'use strict';

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
