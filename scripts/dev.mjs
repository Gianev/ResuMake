import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const api = spawn(process.execPath, ['--watch', 'server/index.mjs'], { stdio: 'inherit' });
// Run Vite through Node directly; spawning npm.cmd is unreliable on some Windows setups.
const vite = spawn(process.execPath, [resolve('node_modules/vite/bin/vite.js')], { stdio: 'inherit' });
const stop = () => { api.kill(); vite.kill(); process.exit(); };
process.on('SIGINT', stop); process.on('SIGTERM', stop);
