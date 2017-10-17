//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;

/* Package-scope variables */
var makeInstaller, meteorInstall;

/////////////////////////////////////////////////////////////////////////////
//                                                                         //
// packages/modules-runtime/.npm/package/node_modules/install/install.js   //
// This file is in bare mode and is not in its own closure.                //
//                                                                         //
/////////////////////////////////////////////////////////////////////////////
                                                                           //
makeInstaller = function (options) {                                       // 1
  "use strict";                                                            // 2
                                                                           // 3
  options = options || {};                                                 // 4
                                                                           // 5
  // These file extensions will be appended to required module identifiers
  // if they do not exactly match an installed module.                     // 7
  var defaultExtensions = options.extensions || [".js", ".json"];          // 8
                                                                           // 9
  // If defined, the options.onInstall function will be called any time    // 10
  // new modules are installed.                                            // 11
  var onInstall = options.onInstall;                                       // 12
                                                                           // 13
  // If defined, each module-specific require function will be passed to   // 14
  // this function, along with the module.id of the parent module, and     // 15
  // the result will be used in place of the original require function.    // 16
  var wrapRequire = options.wrapRequire;                                   // 17
                                                                           // 18
  // If defined, the options.override function will be called before       // 19
  // looking up any top-level package identifiers in node_modules          // 20
  // directories. It can either return a string to provide an alternate    // 21
  // package identifier, or a non-string value to prevent the lookup from  // 22
  // proceeding.                                                           // 23
  var override = options.override;                                         // 24
                                                                           // 25
  // If defined, the options.fallback function will be called when no      // 26
  // installed module is found for a required module identifier. Often     // 27
  // options.fallback will be implemented in terms of the native Node      // 28
  // require function, which has the ability to load binary modules.       // 29
  var fallback = options.fallback;                                         // 30
                                                                           // 31
  // If truthy, package resolution will prefer the "browser" field of      // 32
  // package.json files to the "main" field. Note that this only supports  // 33
  // string-valued "browser" fields for now, though in the future it might
  // make sense to support the object version, a la browserify.            // 35
  var browser = options.browser;                                           // 36
                                                                           // 37
  // Called below as hasOwn.call(obj, key).                                // 38
  var hasOwn = {}.hasOwnProperty;                                          // 39
                                                                           // 40
  // The file object representing the root directory of the installed      // 41
  // module tree.                                                          // 42
  var root = new File("/", new File("/.."));                               // 43
  var rootRequire = makeRequire(root);                                     // 44
                                                                           // 45
  // Merges the given tree of directories and module factory functions     // 46
  // into the tree of installed modules and returns a require function     // 47
  // that behaves as if called from a module in the root directory.        // 48
  function install(tree, options) {                                        // 49
    if (isObject(tree)) {                                                  // 50
      fileMergeContents(root, tree, options);                              // 51
      if (isFunction(onInstall)) {                                         // 52
        onInstall(rootRequire);                                            // 53
      }                                                                    // 54
    }                                                                      // 55
    return rootRequire;                                                    // 56
  }                                                                        // 57
                                                                           // 58
  // This constructor will be used to instantiate the module objects       // 59
  // passed to module factory functions (i.e. the third argument after     // 60
  // require and exports), and is exposed as install.Module in case the    // 61
  // caller of makeInstaller wishes to modify Module.prototype.            // 62
  function Module(id) {                                                    // 63
    this.id = id;                                                          // 64
                                                                           // 65
    // The Node implementation of module.children unfortunately includes   // 66
    // only those child modules that were imported for the first time by   // 67
    // this parent module (i.e., child.parent === this).                   // 68
    this.children = [];                                                    // 69
                                                                           // 70
    // This object is an install.js extension that includes all child      // 71
    // modules imported by this module, even if this module is not the     // 72
    // first to import them.                                               // 73
    this.childrenById = {};                                                // 74
  }                                                                        // 75
                                                                           // 76
  Module.prototype.resolve = function (id) {                               // 77
    return this.require.resolve(id);                                       // 78
  };                                                                       // 79
                                                                           // 80
  install.Module = Module;                                                 // 81
                                                                           // 82
  function getOwn(obj, key) {                                              // 83
    return hasOwn.call(obj, key) && obj[key];                              // 84
  }                                                                        // 85
                                                                           // 86
  function isObject(value) {                                               // 87
    return value && typeof value === "object";                             // 88
  }                                                                        // 89
                                                                           // 90
  function isFunction(value) {                                             // 91
    return typeof value === "function";                                    // 92
  }                                                                        // 93
                                                                           // 94
  function isString(value) {                                               // 95
    return typeof value === "string";                                      // 96
  }                                                                        // 97
                                                                           // 98
  function makeRequire(file) {                                             // 99
    function require(id) {                                                 // 100
      var result = fileResolve(file, id);                                  // 101
      if (result) {                                                        // 102
        return fileEvaluate(result, file.m);                               // 103
      }                                                                    // 104
                                                                           // 105
      var error = new Error("Cannot find module '" + id + "'");            // 106
                                                                           // 107
      if (isFunction(fallback)) {                                          // 108
        return fallback(                                                   // 109
          id, // The missing module identifier.                            // 110
          file.m.id, // The path of the requiring file.                    // 111
          error // The error we would have thrown.                         // 112
        );                                                                 // 113
      }                                                                    // 114
                                                                           // 115
      throw error;                                                         // 116
    }                                                                      // 117
                                                                           // 118
    if (isFunction(wrapRequire)) {                                         // 119
      require = wrapRequire(require, file.m.id);                           // 120
    }                                                                      // 121
                                                                           // 122
    require.extensions = fileGetExtensions(file).slice(0);                 // 123
                                                                           // 124
    require.resolve = function (id) {                                      // 125
      var f = fileResolve(file, id);                                       // 126
      if (f) return f.m.id;                                                // 127
      var error = new Error("Cannot find module '" + id + "'");            // 128
      if (fallback && isFunction(fallback.resolve)) {                      // 129
        return fallback.resolve(id, file.m.id, error);                     // 130
      }                                                                    // 131
      throw error;                                                         // 132
    };                                                                     // 133
                                                                           // 134
    return require;                                                        // 135
  }                                                                        // 136
                                                                           // 137
  // File objects represent either directories or modules that have been   // 138
  // installed. When a `File` respresents a directory, its `.c` (contents)
  // property is an object containing the names of the files (or           // 140
  // directories) that it contains. When a `File` represents a module, its
  // `.c` property is a function that can be invoked with the appropriate  // 142
  // `(require, exports, module)` arguments to evaluate the module. If the
  // `.c` property is a string, that string will be resolved as a module   // 144
  // identifier, and the exports of the resulting module will provide the  // 145
  // exports of the original file. The `.p` (parent) property of a File is
  // either a directory `File` or `null`. Note that a child may claim      // 147
  // another `File` as its parent even if the parent does not have an      // 148
  // entry for that child in its `.c` object.  This is important for       // 149
  // implementing anonymous files, and preventing child modules from using
  // `../relative/identifier` syntax to examine unrelated modules.         // 151
  function File(name, parent) {                                            // 152
    var file = this;                                                       // 153
                                                                           // 154
    // Link to the parent file.                                            // 155
    file.p = parent = parent || null;                                      // 156
                                                                           // 157
    // The module object for this File, which will eventually boast an     // 158
    // .exports property when/if the file is evaluated.                    // 159
    file.m = new Module(name);                                             // 160
  }                                                                        // 161
                                                                           // 162
  function fileEvaluate(file, parentModule) {                              // 163
    var contents = file && file.c;                                         // 164
    var module = file.m;                                                   // 165
                                                                           // 166
    if (! hasOwn.call(module, "exports")) {                                // 167
      if (parentModule) {                                                  // 168
        module.parent = parentModule;                                      // 169
        var children = parentModule.children;                              // 170
        if (Array.isArray(children)) {                                     // 171
          children.push(module);                                           // 172
        }                                                                  // 173
      }                                                                    // 174
                                                                           // 175
      // If a Module.prototype.useNode method is defined, give it a chance
      // to define module.exports based on module.id using Node.           // 177
      if (! isFunction(module.useNode) ||                                  // 178
          ! module.useNode()) {                                            // 179
        contents(                                                          // 180
          module.require = module.require || makeRequire(file),            // 181
          module.exports = {},                                             // 182
          module,                                                          // 183
          file.m.id,                                                       // 184
          file.p.m.id                                                      // 185
        );                                                                 // 186
      }                                                                    // 187
                                                                           // 188
      module.loaded = true;                                                // 189
    }                                                                      // 190
                                                                           // 191
    if (isFunction(module.runModuleSetters)) {                             // 192
      module.runModuleSetters();                                           // 193
    }                                                                      // 194
                                                                           // 195
    return module.exports;                                                 // 196
  }                                                                        // 197
                                                                           // 198
  function fileIsDirectory(file) {                                         // 199
    return file && isObject(file.c);                                       // 200
  }                                                                        // 201
                                                                           // 202
  function fileMergeContents(file, contents, options) {                    // 203
    // If contents is an array of strings and functions, return the last   // 204
    // function with a `.d` property containing all the strings.           // 205
    if (Array.isArray(contents)) {                                         // 206
      var deps = [];                                                       // 207
                                                                           // 208
      contents.forEach(function (item) {                                   // 209
        if (isString(item)) {                                              // 210
          deps.push(item);                                                 // 211
        } else if (isFunction(item)) {                                     // 212
          contents = item;                                                 // 213
        }                                                                  // 214
      });                                                                  // 215
                                                                           // 216
      if (isFunction(contents)) {                                          // 217
        contents.d = deps;                                                 // 218
      } else {                                                             // 219
        // If the array did not contain a function, merge nothing.         // 220
        contents = null;                                                   // 221
      }                                                                    // 222
                                                                           // 223
    } else if (isFunction(contents)) {                                     // 224
      // If contents is already a function, make sure it has `.d`.         // 225
      contents.d = contents.d || [];                                       // 226
                                                                           // 227
    } else if (! isString(contents) &&                                     // 228
               ! isObject(contents)) {                                     // 229
      // If contents is neither an array nor a function nor a string nor   // 230
      // an object, just give up and merge nothing.                        // 231
      contents = null;                                                     // 232
    }                                                                      // 233
                                                                           // 234
    if (contents) {                                                        // 235
      file.c = file.c || (isObject(contents) ? {} : contents);             // 236
      if (isObject(contents) && fileIsDirectory(file)) {                   // 237
        Object.keys(contents).forEach(function (key) {                     // 238
          if (key === "..") {                                              // 239
            child = file.p;                                                // 240
                                                                           // 241
          } else {                                                         // 242
            var child = getOwn(file.c, key);                               // 243
            if (! child) {                                                 // 244
              child = file.c[key] = new File(                              // 245
                file.m.id.replace(/\/*$/, "/") + key,                      // 246
                file                                                       // 247
              );                                                           // 248
                                                                           // 249
              child.o = options;                                           // 250
            }                                                              // 251
          }                                                                // 252
                                                                           // 253
          fileMergeContents(child, contents[key], options);                // 254
        });                                                                // 255
      }                                                                    // 256
    }                                                                      // 257
  }                                                                        // 258
                                                                           // 259
  function fileGetExtensions(file) {                                       // 260
    return file.o && file.o.extensions || defaultExtensions;               // 261
  }                                                                        // 262
                                                                           // 263
  function fileAppendIdPart(file, part, extensions) {                      // 264
    // Always append relative to a directory.                              // 265
    while (file && ! fileIsDirectory(file)) {                              // 266
      file = file.p;                                                       // 267
    }                                                                      // 268
                                                                           // 269
    if (! file || ! part || part === ".") {                                // 270
      return file;                                                         // 271
    }                                                                      // 272
                                                                           // 273
    if (part === "..") {                                                   // 274
      return file.p;                                                       // 275
    }                                                                      // 276
                                                                           // 277
    var exactChild = getOwn(file.c, part);                                 // 278
                                                                           // 279
    // Only consider multiple file extensions if this part is the last     // 280
    // part of a module identifier and not equal to `.` or `..`, and there
    // was no exact match or the exact match was a directory.              // 282
    if (extensions && (! exactChild || fileIsDirectory(exactChild))) {     // 283
      for (var e = 0; e < extensions.length; ++e) {                        // 284
        var child = getOwn(file.c, part + extensions[e]);                  // 285
        if (child && ! fileIsDirectory(child)) {                           // 286
          return child;                                                    // 287
        }                                                                  // 288
      }                                                                    // 289
    }                                                                      // 290
                                                                           // 291
    return exactChild;                                                     // 292
  }                                                                        // 293
                                                                           // 294
  function fileAppendId(file, id, extensions) {                            // 295
    var parts = id.split("/");                                             // 296
                                                                           // 297
    // Use `Array.prototype.every` to terminate iteration early if         // 298
    // `fileAppendIdPart` returns a falsy value.                           // 299
    parts.every(function (part, i) {                                       // 300
      return file = i < parts.length - 1                                   // 301
        ? fileAppendIdPart(file, part)                                     // 302
        : fileAppendIdPart(file, part, extensions);                        // 303
    });                                                                    // 304
                                                                           // 305
    return file;                                                           // 306
  }                                                                        // 307
                                                                           // 308
  function recordChild(parentModule, childFile) {                          // 309
    var childModule = childFile && childFile.m;                            // 310
    if (parentModule && childModule) {                                     // 311
      parentModule.childrenById[childModule.id] = childModule;             // 312
    }                                                                      // 313
  }                                                                        // 314
                                                                           // 315
  function fileResolve(file, id, parentModule, seenDirFiles) {             // 316
    var parentModule = parentModule || file.m;                             // 317
    var extensions = fileGetExtensions(file);                              // 318
                                                                           // 319
    file =                                                                 // 320
      // Absolute module identifiers (i.e. those that begin with a `/`     // 321
      // character) are interpreted relative to the root directory, which  // 322
      // is a slight deviation from Node, which has access to the entire   // 323
      // file system.                                                      // 324
      id.charAt(0) === "/" ? fileAppendId(root, id, extensions) :          // 325
      // Relative module identifiers are interpreted relative to the       // 326
      // current file, naturally.                                          // 327
      id.charAt(0) === "." ? fileAppendId(file, id, extensions) :          // 328
      // Top-level module identifiers are interpreted as referring to      // 329
      // packages in `node_modules` directories.                           // 330
      nodeModulesLookup(file, id, extensions);                             // 331
                                                                           // 332
    // If the identifier resolves to a directory, we use the same logic as
    // Node to find an `index.js` or `package.json` file to evaluate.      // 334
    while (fileIsDirectory(file)) {                                        // 335
      seenDirFiles = seenDirFiles || [];                                   // 336
                                                                           // 337
      // If the "main" field of a `package.json` file resolves to a        // 338
      // directory we've already considered, then we should not attempt to
      // read the same `package.json` file again. Using an array as a set  // 340
      // is acceptable here because the number of directories to consider  // 341
      // is rarely greater than 1 or 2. Also, using indexOf allows us to   // 342
      // store File objects instead of strings.                            // 343
      if (seenDirFiles.indexOf(file) < 0) {                                // 344
        seenDirFiles.push(file);                                           // 345
                                                                           // 346
        var pkgJsonFile = fileAppendIdPart(file, "package.json"), main;    // 347
        var pkg = pkgJsonFile && fileEvaluate(pkgJsonFile, parentModule);  // 348
        if (pkg && (browser &&                                             // 349
                    isString(main = pkg.browser) ||                        // 350
                    isString(main = pkg.main))) {                          // 351
          recordChild(parentModule, pkgJsonFile);                          // 352
                                                                           // 353
          // The "main" field of package.json does not have to begin with  // 354
          // ./ to be considered relative, so first we try simply          // 355
          // appending it to the directory path before falling back to a   // 356
          // full fileResolve, which might return a package from a         // 357
          // node_modules directory.                                       // 358
          file = fileAppendId(file, main, extensions) ||                   // 359
            fileResolve(file, main, parentModule, seenDirFiles);           // 360
                                                                           // 361
          if (file) {                                                      // 362
            // The fileAppendId call above may have returned a directory,  // 363
            // so continue the loop to make sure we resolve it to a        // 364
            // non-directory file.                                         // 365
            continue;                                                      // 366
          }                                                                // 367
        }                                                                  // 368
      }                                                                    // 369
                                                                           // 370
      // If we didn't find a `package.json` file, or it didn't have a      // 371
      // resolvable `.main` property, the only possibility left to         // 372
      // consider is that this directory contains an `index.js` module.    // 373
      // This assignment almost always terminates the while loop, because  // 374
      // there's very little chance `fileIsDirectory(file)` will be true   // 375
      // for the result of `fileAppendIdPart(file, "index.js")`. However,  // 376
      // in principle it is remotely possible that a file called           // 377
      // `index.js` could be a directory instead of a file.                // 378
      file = fileAppendIdPart(file, "index.js");                           // 379
    }                                                                      // 380
                                                                           // 381
    if (file && isString(file.c)) {                                        // 382
      file = fileResolve(file, file.c, parentModule, seenDirFiles);        // 383
    }                                                                      // 384
                                                                           // 385
    recordChild(parentModule, file);                                       // 386
                                                                           // 387
    return file;                                                           // 388
  };                                                                       // 389
                                                                           // 390
  function nodeModulesLookup(file, id, extensions) {                       // 391
    if (isFunction(override)) {                                            // 392
      id = override(id, file.m.id);                                        // 393
    }                                                                      // 394
                                                                           // 395
    if (isString(id)) {                                                    // 396
      for (var resolved; file && ! resolved; file = file.p) {              // 397
        resolved = fileIsDirectory(file) &&                                // 398
          fileAppendId(file, "node_modules/" + id, extensions);            // 399
      }                                                                    // 400
                                                                           // 401
      return resolved;                                                     // 402
    }                                                                      // 403
  }                                                                        // 404
                                                                           // 405
  return install;                                                          // 406
};                                                                         // 407
                                                                           // 408
if (typeof exports === "object") {                                         // 409
  exports.makeInstaller = makeInstaller;                                   // 410
}                                                                          // 411
                                                                           // 412
/////////////////////////////////////////////////////////////////////////////







(function(){

/////////////////////////////////////////////////////////////////////////////
//                                                                         //
// packages/modules-runtime/modules-runtime.js                             //
//                                                                         //
/////////////////////////////////////////////////////////////////////////////
                                                                           //
var options = {};                                                          // 1
var hasOwn = options.hasOwnProperty;                                       // 2
                                                                           // 3
// RegExp matching strings that don't start with a `.` or a `/`.           // 4
var topLevelIdPattern = /^[^./]/;                                          // 5
                                                                           // 6
if (typeof Profile === "function" &&                                       // 7
    process.env.METEOR_PROFILE) {                                          // 8
  options.wrapRequire = function (require) {                               // 9
    return Profile(function (id) {                                         // 10
      return "require(" + JSON.stringify(id) + ")";                        // 11
    }, require);                                                           // 12
  };                                                                       // 13
}                                                                          // 14
                                                                           // 15
// On the client, make package resolution prefer the "browser" field of    // 16
// package.json files to the "main" field.                                 // 17
options.browser = Meteor.isClient;                                         // 18
                                                                           // 19
// This function will be called whenever a module identifier that hasn't   // 20
// been installed is required. For backwards compatibility, and so that we
// can require binary dependencies on the server, we implement the         // 22
// fallback in terms of Npm.require.                                       // 23
options.fallback = function (id, parentId, error) {                        // 24
  // For simplicity, we honor only top-level module identifiers here.      // 25
  // We could try to honor relative and absolute module identifiers by     // 26
  // somehow combining `id` with `dir`, but we'd have to be really careful
  // that the resulting modules were located in a known directory (not     // 28
  // some arbitrary location on the file system), and we only really need  // 29
  // the fallback for dependencies installed in node_modules directories.  // 30
  if (topLevelIdPattern.test(id)) {                                        // 31
    if (typeof Npm === "object" &&                                         // 32
        typeof Npm.require === "function") {                               // 33
      return Npm.require(id);                                              // 34
    }                                                                      // 35
  }                                                                        // 36
                                                                           // 37
  throw error;                                                             // 38
};                                                                         // 39
                                                                           // 40
options.fallback.resolve = function (id, parentId, error) {                // 41
  if (Meteor.isServer &&                                                   // 42
      topLevelIdPattern.test(id)) {                                        // 43
    // Allow any top-level identifier to resolve to itself on the server,  // 44
    // so that options.fallback can have a chance to handle it.            // 45
    return id;                                                             // 46
  }                                                                        // 47
                                                                           // 48
  throw error;                                                             // 49
};                                                                         // 50
                                                                           // 51
meteorInstall = makeInstaller(options);                                    // 52
var Mp = meteorInstall.Module.prototype;                                   // 53
                                                                           // 54
if (Meteor.isServer) {                                                     // 55
  Mp.useNode = function () {                                               // 56
    if (typeof npmRequire !== "function") {                                // 57
      // Can't use Node if npmRequire is not defined.                      // 58
      return false;                                                        // 59
    }                                                                      // 60
                                                                           // 61
    var parts = this.id.split("/");                                        // 62
    var start = 0;                                                         // 63
    if (parts[start] === "") ++start;                                      // 64
    if (parts[start] === "node_modules" &&                                 // 65
        parts[start + 1] === "meteor") {                                   // 66
      start += 2;                                                          // 67
    }                                                                      // 68
                                                                           // 69
    if (parts.indexOf("node_modules", start) < 0) {                        // 70
      // Don't try to use Node for modules that aren't in node_modules     // 71
      // directories.                                                      // 72
      return false;                                                        // 73
    }                                                                      // 74
                                                                           // 75
    try {                                                                  // 76
      npmRequire.resolve(this.id);                                         // 77
    } catch (e) {                                                          // 78
      return false;                                                        // 79
    }                                                                      // 80
                                                                           // 81
    this.exports = npmRequire(this.id);                                    // 82
                                                                           // 83
    return true;                                                           // 84
  };                                                                       // 85
}                                                                          // 86
                                                                           // 87
/////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['modules-runtime'] = {}, {
  meteorInstall: meteorInstall
});

})();
