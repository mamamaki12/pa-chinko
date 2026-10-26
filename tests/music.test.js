import test from 'node:test';
import assert from 'node:assert/strict';
import {TRACKS,BARS,STEPS,noteNumber,parseChord,parseMelody,trackFor,stepLength} from '../music.js';

test('note names and chords parse', () => {
  assert.equal(noteNumber('A4'), 69);
  assert.equal(noteNumber('C#5'), 73);
  assert.deepEqual(parseChord('F#m'), {root: 6, tones: [0, 3, 7]});
  assert.deepEqual(parseChord('Fmaj7').tones, [0, 4, 7, 11]);
  assert.throws(() => parseChord('Hm'));
  assert.deepEqual(parseMelody('A4 - - . C5 -'), [{step: 0, note: 69, len: 6}, {step: 8, note: 72, len: 4}]);
});

test('every track is 8 bars with valid rows', () => {
  assert.equal(STEPS, BARS * 16);
  for (const [name, t] of Object.entries(TRACKS)) {
    assert.equal(t.chords.split(' ').length, BARS, name);
    t.chords.split(' ').forEach(parseChord);
    assert.equal(t.lead.replace(/\|/g, ' ').trim().split(/\s+/).length, BARS * 8, name);
    for (const ev of parseMelody(t.lead)) assert.ok(ev.step + ev.len <= STEPS && ev.note >= 60 && ev.note <= 96, name);
    assert.match(t.bass, /^[rof.-]{16}$/, name);
    for (const row of [...Object.values(t.drums), ...Object.values(t.fill || {})]) assert.match(row, /^[x.]{16}$/, name);
    assert.ok(stepLength(name) > 0.08 && stepLength(name) < 0.15, name);
  }
});

test('the track follows only what the machine shows', () => {
  assert.equal(trackFor({mode: 'pachinko'}), 'aurora');
  assert.equal(trackFor({mode: 'pachinko', reach: true}), 'aurora-reach');
  assert.equal(trackFor({mode: 'pachinko', reach: true, bonus: true}), 'aurora-bonus');
  assert.equal(trackFor({mode: 'slot'}), 'astral');
  assert.equal(trackFor({mode: 'slot', bonus: true}), 'astral-bonus');
  for (const name of ['aurora', 'aurora-reach', 'aurora-bonus', 'astral', 'astral-bonus']) assert.ok(TRACKS[name]);
});
