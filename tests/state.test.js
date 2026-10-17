import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyState,isUnlocked,restore,switchLevel,remember} from '../src/state.js';
import {levels} from '../src/levels.js';
test('sequential unlocks, no skipping, per-picture persistence',()=>{const s=emptyState();assert.equal(s.stars.length,18);assert.equal(isUnlocked(s,0),true);assert.equal(switchLevel(s,1),false);for(let i=0;i<18;i++){assert.equal(switchLevel(s,i),true);s.fills[levels[i].regions[0].id]=levels[i].regions[0].color;s.attempts=4;s.stars[i]=3;}remember(s);assert.equal(switchLevel(s,0),true);assert.equal(s.fills.sky,'lightblue');assert.equal(s.attempts,4);const copy=restore(JSON.parse(JSON.stringify(s)));assert.deepEqual(copy,s);});
test('corrupt saves sanitized and legacy saves migrate',()=>{const bad=restore({level:17,selected:'bad',sound:'yes',stars:[999,-4,'bad'],fills:{sky:'bad'}});assert.equal(bad.level,0);assert.equal(bad.selected,'gray');assert.deepEqual(bad.stars.slice(0,3),[3,0,0]);assert.equal(bad.sound,false);const old=restore({level:0,stars:[3,0,0],fills:{sky:'lightblue',fake:'red'},attempts:1});assert.deepEqual(old.fills,{sky:'lightblue'});assert.equal(switchLevel(old,1),true);assert.equal(switchLevel(old,2),false);});

