import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

async function check(enabled) {
  const child = spawn(process.execPath, ['server/index.mjs'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, AI_ENABLED: String(enabled), GROQ_API_KEY: '', PORT: '8787', HOST: '127.0.0.1' },
  });
  try {
    await new Promise((resolve, reject) => {
      child.stdout.once('data', resolve);
      child.once('error', reject);
      child.once('exit', code => reject(new Error(`API exited: ${code}`)));
      setTimeout(() => reject(new Error('API startup timed out')), 5000).unref();
    });
    const response = await fetch('http://127.0.0.1:8787/api/assistant', { method: 'POST' });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: enabled ? 'The assistant is not configured.' : 'AI features are unavailable right now.' });
    assert.equal((await fetch('http://127.0.0.1:8787/unknown')).status, 404);
    if (enabled) {
      assert.equal((await fetch('http://127.0.0.1:8787/api/assistant', { method: 'OPTIONS' })).status, 204);
    }
  } finally {
    const stopped = new Promise(resolve => child.once('exit', resolve));
    child.kill();
    await stopped;
  }
}
await check(false);
await check(true);
console.log('PASS: disabled API returns unavailable; enabled API checks configuration and handles preflight; unknown routes return 404. No provider requests were made.');
