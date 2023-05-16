var path = require('path'),
  fs = require('fs');

export function getMainScriptPath(dir = 'src') {
  let file = fs.readdirSync(dir).filter(function (file) {
    return file === 'main.ts';
  });

  file = path.join(dir, file[0]);

  return file;
}
export default { getMainScriptPath };
