const path = require('path');

const root = createPathFunc(__dirname);
const node_modules = createPathFunc(root(), 'node_modules');
const src = createPathFunc(root(), 'src');
const dist = createPathFunc(root(), 'dist');

module.exports = {
    root,
    node_modules,
    src,
    dist
};

function createPathFunc(...p) {
    return function (...segment) {
        return path.normalize(path.resolve(...p, ...segment));
    }
}