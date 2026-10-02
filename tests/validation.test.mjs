import test from 'node:test';import assert from 'node:assert/strict';import {validDate,parseRecord,parseBackup,recordKey} from '../src/lib/validation.ts';
test('rechaza fechas inexistentes',()=>assert.equal(validDate.safeParse('2026-02-31').success,false));
test('rechaza valores no finitos y tipos desconocidos',()=>{assert.throws(()=>parseRecord('log',{date:'2026-10-01',weight:Infinity,notes:''}));assert.throws(()=>parseRecord('constructor',{}))});
test('normaliza registros y elimina campos no confiables',()=>{const r=parseRecord('log',{date:'2026-10-01',weight:100,notes:'',owner_id:'otro'});assert.equal(recordKey(r),'log:2026-10-01');assert.equal(r.owner_id,undefined)});
test('el respaldo no permite claves duplicadas',()=>assert.throws(()=>parseBackup({records:[{type:'log',date:'2026-10-01',notes:''},{type:'log',date:'2026-10-01',notes:''}]})));
test('no importa referencias de fotos ajenas',()=>assert.deepEqual(parseBackup({records:[{type:'photo',date:'2026-10-01',path:'otro/imagen.png'}]}),[]));
