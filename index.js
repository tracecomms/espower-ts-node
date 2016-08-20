/**
 * Created by daniel on 20/08/2016.
 */
"use strict";
var fs = require('fs');
var sourceMapSupport = require('source-map-support');
var espowerSource = require('espower-source');
var sourcemaps = {};
// match either file extensions or directories by default - zero config for maximum scenarios
var testFileExtensionRegExp = /\.(unit|spec|test)\.ts$/;
var testFileDirectoryRegExp = /\/?(unit|spec|test).+\.ts$/;
// install source map adaptor for any test files we pick up
sourceMapSupport
    .install({
    retrieveSourceMap: function (source) {
        if (sourcemaps[source]) {
            return {
                url: source,
                map: sourcemaps[source]
            };
        }
        return null;
    }
});
/**
 *
 * We should ignore non-test files
 *
 * @param {string} filename
 * @returns {boolean}
 */
function shouldIgnore(filename) {
    return !filename.match(testFileExtensionRegExp) && !filename.match(testFileDirectoryRegExp);
}
/**
 *
 * espowerSource gives us the sourcemap as a data url - this function extracts it
 *
 * @param {string} code
 * @returns {RawSourceMap}
 */
function getSourceMapFromDataUrl(code) {
    var sourceMapCommentRegEx = /\/\/[@#] sourceMappingURL=data:application\/json(?:;charset[:=][^;]+)?;base64,(.*)\n/;
    var match = code.match(sourceMapCommentRegEx);
    var sourceMapBase64 = match[1];
    return JSON.parse(new Buffer(sourceMapBase64, 'base64').toString());
}
/**
 *
 * ts-node gives us the source map as a temporary file URL - let's grab it and retrieve the file synchronously
 *
 * @param {string} code
 * @returns {RawSourceMap}
 */
function getSourceMapFromUrl(code) {
    var match = code.match(/sourceMappingURL=(.+)$/);
    return JSON.parse(fs.readFileSync(match[1], 'utf-8'));
}
var registerExtension = function (ext) {
    var oldExtensionHandler = require.extensions[ext];
    // register our extra helper with node - the assumption is that we're registering after ts-node has already registered
    // which means we're gonna get compiled JS rather than TS. We still need to register on the .ts extension, though
    require.extensions[ext] = function (module, filename) {
        if (shouldIgnore(filename)) {
            // leave non-test files along
            return oldExtensionHandler(module, filename);
        }
        // cache the original compile so we can call it after we're done
        var originalCompile = module._compile;
        /**
         *
         * @param {string} code - JS code which has already been transpiled by ts-node
         * @param {string} fileName
         * @private
         */
        module._compile = function (code, fileName) {
            // extract the original source map
            var origSourceMap = getSourceMapFromUrl(code);
            // transform using espower & extract the source map
            var espowerCode = espowerSource(code, filename, {
                // pass in the original sourceMap so that line references in power-assert output are correct
                sourceMap: origSourceMap
            });
            // register the final source map for sourceMapSupport - this was line refs in stack traces will be correct
            sourcemaps[fileName] = getSourceMapFromDataUrl(espowerCode);
            // pass off to the original compile to do its thing
            return originalCompile.call(this, espowerCode, fileName);
        };
        return oldExtensionHandler(module, filename);
    };
};
registerExtension('.ts');
registerExtension('.tsx');
//# sourceMappingURL=index.js.map