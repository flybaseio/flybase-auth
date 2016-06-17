var path = require ('path');
var fs = require('fs');
var UglifyJS = require("uglify-js");

var file = path.resolve (__dirname + '/./src/hello.all.js');
var data = fs.readFileSync(file, {encoding: 'UTF8'});
data += '/* socket library */';
var file = path.resolve (__dirname + '/./src/flybase-auth-storage.js');
data += fs.readFileSync(file, {encoding: 'UTF8'});
var file = path.resolve (__dirname + '/./src/flybase-auth-core.js');
data += fs.readFileSync(file, {encoding: 'UTF8'});

fs.writeFileSync('./dist/flybase-auth.js', data, {flag: 'w'});

var data = UglifyJS.minify(data, {fromString: true});
fs.writeFileSync('./dist/flybase-auth.min.js', data.code, {flag: 'w'});
