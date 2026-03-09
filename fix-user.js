const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.next')) {
        getFiles(fullPath, files);
      }
    } else if (fullPath.endsWith('.js')) {
      files.push(fullPath);
    }
  });
  return files;
}

const allJsFiles = getFiles('./src/app');
allJsFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/\{user\?\.fullName\s*\n\s*\.split\(\" \"\)/g, '{(user?.fullName || "A B")\n                    .split(" ")');
  // Also check for {user?.fullName\r\n
  newContent = newContent.replace(/\{user\?\.fullName\s*\r\n\s*\.split\(\" \"\)/g, '{(user?.fullName || "A B")\n                    .split(" ")');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed:', file);
  }
});
