const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'src', 'apollo-router');
const destDir = path.join(__dirname, 'dist', 'src', 'apollo-router');

// Ensure the destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy dummy folder
const dummySource = path.join(sourceDir, 'dummy');
const dummyDest = path.join(destDir, 'dummy');
if (fs.existsSync(dummySource)) {
  fs.cpSync(dummySource, dummyDest, { recursive: true });
  console.log('✓ Copied dummy folder');
}

// Copy rhai folder
const rhaiSource = path.join(sourceDir, 'rhai');
const rhaiDest = path.join(destDir, 'rhai');
if (fs.existsSync(rhaiSource)) {
  fs.cpSync(rhaiSource, rhaiDest, { recursive: true });
  console.log('✓ Copied rhai folder');
}
