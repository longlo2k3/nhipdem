const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const content = fs.readFileSync(path.join(root, 'workout-plan.js'), 'utf8');
const target = path.join(root, 'mobile', 'src', 'training.js');
if (process.argv.includes('--check')) {
  if (fs.readFileSync(target, 'utf8') !== content) { console.error('Run npm run mobile:sync to update the native schedule.'); process.exitCode = 1; }
} else { fs.writeFileSync(target, content); console.log('Native schedule updated.'); }
