import { rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';

for (const path of ['.next', 'out']) {
  await rm(path, { force: true, recursive: true });
}

await runNext(['telemetry', 'disable']);
await runNext(['build']);

function runNext(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['./node_modules/next/dist/bin/next', ...args], {
      stdio: 'inherit',
      env: process.env,
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`next ${args.join(' ')} failed with ${signal ?? `exit code ${code}`}`));
    });
  });
}
