import { test } from 'node:test';
import { ok, strictEqual } from 'node:assert';
import { Mongoose } from 'mongoose';
import { loadViberSettingsClass } from '../../models/Settings';

test('tenant settings have a fixed string identity and validate the exact-host array', (t) => {
  const mongoose = new Mongoose();
  const Settings = mongoose.model('viber_settings', loadViberSettingsClass());
  t.after(() => mongoose.deleteModel('viber_settings'));
  for (const mediaHostnames of [[], ['media.example.com']]) {
    strictEqual(
      new Settings({ _id: 'media', mediaHostnames }).validateSync(),
      undefined,
    );
  }
  for (const value of [
    { _id: 'other', mediaHostnames: [] },
    { _id: 'media' },
    { _id: 'media', mediaHostnames: ['*'] },
    { _id: 'media', mediaHostnames: ['MEDIA.EXAMPLE.COM'] },
  ]) {
    ok(new Settings(value).validateSync());
  }
});
