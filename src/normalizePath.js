// Normalizes Windows style paths by replacing double backslahes with single forward slahes (unix style).
module.exports = normalizePath = (path) => {
  return path.toString().replace(/\\/g, '/');
};
