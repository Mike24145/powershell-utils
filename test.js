import process from 'node:process';
import {Buffer} from 'node:buffer';
import test from 'ava';
import {canAccessPowerShell, executePowerShell} from './index.js';

test('canAccessPowerShell', async t => {
	const result = await canAccessPowerShell();
	t.is(typeof result, 'boolean');
	// On non-Windows systems, should return false
	if (process.platform !== 'win32') {
		t.false(result);
	}
});

test('executePowerShell', async t => {
	// Only test on Windows
	if (process.platform !== 'win32') {
		t.pass('Skipping test on non-Windows system');
		return;
	}

	const {stdout, stderr} = await executePowerShell('echo "Hello"');
	t.is(typeof stdout, 'string');
	t.is(typeof stderr, 'string');
	t.true(stdout.includes('Hello'));
});

test('executePowerShell.argumentsPrefix', t => {
	t.true(Array.isArray(executePowerShell.argumentsPrefix));
	t.true(executePowerShell.argumentsPrefix.length > 0);
	t.true(executePowerShell.argumentsPrefix.includes('-EncodedCommand'));
});

test('executePowerShell.encodeCommand', t => {
	const encoded = executePowerShell.encodeCommand('Get-Process');
	t.is(typeof encoded, 'string');
	t.true(encoded.length > 0);
	// Verify it's base64
	t.notThrows(() => Buffer.from(encoded, 'base64'));
});

test('executePowerShell.escapeArgument', t => {
	t.is(executePowerShell.escapeArgument('test'), '\'test\'');
	t.is(executePowerShell.escapeArgument('it\'s'), '\'it\'\'s\'');
	t.is(executePowerShell.escapeArgument('a\'b\'c'), '\'a\'\'b\'\'c\'');
});
