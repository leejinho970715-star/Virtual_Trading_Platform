import test from 'node:test';
import assert from 'node:assert/strict';
import{pbkdf2Sync}from'node:crypto';
import{checkCredentials,makeSession,checkSession}from'./auth.js';
test('password authentication rejects invalid identity and input',async()=>{const config={username:'tester',salt:'test-salt',iterations:1000,hash:pbkdf2Sync('test-password','test-salt',1000,32,'sha256').toString('hex')};assert.equal(await checkCredentials('tester','test-password',config),true);assert.equal(await checkCredentials('wrong','test-password',config),false);assert.equal(await checkCredentials('tester','wrong',config),false);assert.equal(await checkCredentials('tester',null,config),false)});
test('sessions reject tampering, other keys, expiration and malformed cookies',()=>{const now=Date.now(),token=makeSession('test-key',now);assert.equal(checkSession(token,'test-key',now+1),true);assert.equal(checkSession(token,'other-key',now+1),false);assert.equal(checkSession(token+'x','test-key',now+1),false);assert.equal(checkSession(token,'test-key',now+8*3600000),false);for(const value of[undefined,'','abc','a.b.c'])assert.equal(checkSession(value,'test-key',now),false)});
