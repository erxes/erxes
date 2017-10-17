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
makeInstaller = function (options) {
  "use strict";

  options = options || {};

  // These file extensions will be appended to required module identifiers
  // if they do not exactly match an installed module.
  var defaultExtensions = options.extensions || [".js", ".json"];

  // If defined, the options.onInstall function will be called any time
  // new modules are installed.
  var onInstall = options.onInstall;

  // If defined, each module-specific require function will be passed to
  // this function, along with the module.id of the parent module, and
  // the result will be used in place of the original require function.
  var wrapRequire = options.wrapRequire;

  // If defined, the options.override function will be called before
  // looking up any top-level package identifiers in node_modules
  // directories. It can either return a string to provide an alternate
  // package identifier, or a non-string value to prevent the lookup from
  // proceeding.
  var override = options.override;

  // If defined, the options.fallback function will be called when no
  // installed module is found for a required module identifier. Often
  // options.fallback will be implemented in terms of the native Node
  // require function, which has the ability to load binary modules.
  var fallback = options.fallback;

  // If truthy, package resolution will prefer the "browser" field of
  // package.json files to the "main" field. Note that this only supports
  // string-valued "browser" fields for now, though in the future it might
  // make sense to support the object version, a la browserify.
  var browser = options.browser;

  // Called below as hasOwn.call(obj, key).
  var hasOwn = {}.hasOwnProperty;

  // The file object representing the root directory of the installed
  // module tree.
  var root = new File("/", new File("/.."));
  var rootRequire = makeRequire(root);

  // Merges the given tree of directories and module factory functions
  // into the tree of installed modules and returns a require function
  // that behaves as if called from a module in the root directory.
  function install(tree, options) {
    if (isObject(tree)) {
      fileMergeContents(root, tree, options);
      if (isFunction(onInstall)) {
        onInstall(rootRequire);
      }
    }
    return rootRequire;
  }

  // This constructor will be used to instantiate the module objects
  // passed to module factory functions (i.e. the third argument after
  // require and exports), and is exposed as install.Module in case the
  // caller of makeInstaller wishes to modify Module.prototype.
  function Module(id) {
    this.id = id;

    // The Node implementation of module.children unfortunately includes
    // only those child modules that were imported for the first time by
    // this parent module (i.e., child.parent === this).
    this.children = [];

    // This object is an install.js extension that includes all child
    // modules imported by this module, even if this module is not the
    // first to import them.
    this.childrenById = {};
  }

  Module.prototype.resolve = function (id) {
    return this.require.resolve(id);
  };

  install.Module = Module;

  function getOwn(obj, key) {
    return hasOwn.call(obj, key) && obj[key];
  }

  function isObject(value) {
    return value && typeof value === "object";
  }

  function isFunction(value) {
    return typeof value === "function";
  }

  function isString(value) {
    return typeof value === "string";
  }

  function makeRequire(file) {
    function require(id) {
      var result = fileResolve(file, id);
      if (result) {
        return fileEvaluate(result, file.m);
      }

      var error = new Error("Cannot find module '" + id + "'");

      if (isFunction(fallback)) {
        return fallback(
          id, // The missing module identifier.
          file.m.id, // The path of the requiring file.
          error // The error we would have thrown.
        );
      }

      throw error;
    }

    if (isFunction(wrapRequire)) {
      require = wrapRequire(require, file.m.id);
    }

    require.extensions = fileGetExtensions(file).slice(0);

    require.resolve = function (id) {
      var f = fileResolve(file, id);
      if (f) return f.m.id;
      var error = new Error("Cannot find module '" + id + "'");
      if (fallback && isFunction(fallback.resolve)) {
        return fallback.resolve(id, file.m.id, error);
      }
      throw error;
    };

    return require;
  }

  // File objects represent either directories or modules that have been
  // installed. When a `File` respresents a directory, its `.c` (contents)
  // property is an object containing the names of the files (or
  // directories) that it contains. When a `File` represents a module, its
  // `.c` property is a function that can be invoked with the appropriate
  // `(require, exports, module)` arguments to evaluate the module. If the
  // `.c` property is a string, that string will be resolved as a module
  // identifier, and the exports of the resulting module will provide the
  // exports of the original file. The `.p` (parent) property of a File is
  // either a directory `File` or `null`. Note that a child may claim
  // another `File` as its parent even if the parent does not have an
  // entry for that child in its `.c` object.  This is important for
  // implementing anonymous files, and preventing child modules from using
  // `../relative/identifier` syntax to examine unrelated modules.
  function File(name, parent) {
    var file = this;

    // Link to the parent file.
    file.p = parent = parent || null;

    // The module object for this File, which will eventually boast an
    // .exports property when/if the file is evaluated.
    file.m = new Module(name);
  }

  function fileEvaluate(file, parentModule) {
    var contents = file && file.c;
    var module = file.m;

    if (! hasOwn.call(module, "exports")) {
      if (parentModule) {
        module.parent = parentModule;
        var children = parentModule.children;
        if (Array.isArray(children)) {
          children.push(module);
        }
      }

      // If a Module.prototype.useNode method is defined, give it a chance
      // to define module.exports based on module.id using Node.
      if (! isFunction(module.useNode) ||
          ! module.useNode()) {
        contents(
          module.require = module.require || makeRequire(file),
          module.exports = {},
          module,
          file.m.id,
          file.p.m.id
        );
      }

      module.loaded = true;
    }

    if (isFunction(module.runModuleSetters)) {
      module.runModuleSetters();
    }

    return module.exports;
  }

  function fileIsDirectory(file) {
    return file && isObject(file.c);
  }

  function fileMergeContents(file, contents, options) {
    // If contents is an array of strings and functions, return the last
    // function with a `.d` property containing all the strings.
    if (Array.isArray(contents)) {
      var deps = [];

      contents.forEach(function (item) {
        if (isString(item)) {
          deps.push(item);
        } else if (isFunction(item)) {
          contents = item;
        }
      });

      if (isFunction(contents)) {
        contents.d = deps;
      } else {
        // If the array did not contain a function, merge nothing.
        contents = null;
      }

    } else if (isFunction(contents)) {
      // If contents is already a function, make sure it has `.d`.
      contents.d = contents.d || [];

    } else if (! isString(contents) &&
               ! isObject(contents)) {
      // If contents is neither an array nor a function nor a string nor
      // an object, just give up and merge nothing.
      contents = null;
    }

    if (contents) {
      file.c = file.c || (isObject(contents) ? {} : contents);
      if (isObject(contents) && fileIsDirectory(file)) {
        Object.keys(contents).forEach(function (key) {
          if (key === "..") {
            child = file.p;

          } else {
            var child = getOwn(file.c, key);
            if (! child) {
              child = file.c[key] = new File(
                file.m.id.replace(/\/*$/, "/") + key,
                file
              );

              child.o = options;
            }
          }

          fileMergeContents(child, contents[key], options);
        });
      }
    }
  }

  function fileGetExtensions(file) {
    return file.o && file.o.extensions || defaultExtensions;
  }

  function fileAppendIdPart(file, part, extensions) {
    // Always append relative to a directory.
    while (file && ! fileIsDirectory(file)) {
      file = file.p;
    }

    if (! file || ! part || part === ".") {
      return file;
    }

    if (part === "..") {
      return file.p;
    }

    var exactChild = getOwn(file.c, part);

    // Only consider multiple file extensions if this part is the last
    // part of a module identifier and not equal to `.` or `..`, and there
    // was no exact match or the exact match was a directory.
    if (extensions && (! exactChild || fileIsDirectory(exactChild))) {
      for (var e = 0; e < extensions.length; ++e) {
        var child = getOwn(file.c, part + extensions[e]);
        if (child && ! fileIsDirectory(child)) {
          return child;
        }
      }
    }

    return exactChild;
  }

  function fileAppendId(file, id, extensions) {
    var parts = id.split("/");

    // Use `Array.prototype.every` to terminate iteration early if
    // `fileAppendIdPart` returns a falsy value.
    parts.every(function (part, i) {
      return file = i < parts.length - 1
        ? fileAppendIdPart(file, part)
        : fileAppendIdPart(file, part, extensions);
    });

    return file;
  }

  function recordChild(parentModule, childFile) {
    var childModule = childFile && childFile.m;
    if (parentModule && childModule) {
      parentModule.childrenById[childModule.id] = childModule;
    }
  }

  function fileResolve(file, id, parentModule, seenDirFiles) {
    var parentModule = parentModule || file.m;
    var extensions = fileGetExtensions(file);

    file =
      // Absolute module identifiers (i.e. those that begin with a `/`
      // character) are interpreted relative to the root directory, which
      // is a slight deviation from Node, which has access to the entire
      // file system.
      id.charAt(0) === "/" ? fileAppendId(root, id, extensions) :
      // Relative module identifiers are interpreted relative to the
      // current file, naturally.
      id.charAt(0) === "." ? fileAppendId(file, id, extensions) :
      // Top-level module identifiers are interpreted as referring to
      // packages in `node_modules` directories.
      nodeModulesLookup(file, id, extensions);

    // If the identifier resolves to a directory, we use the same logic as
    // Node to find an `index.js` or `package.json` file to evaluate.
    while (fileIsDirectory(file)) {
      seenDirFiles = seenDirFiles || [];

      // If the "main" field of a `package.json` file resolves to a
      // directory we've already considered, then we should not attempt to
      // read the same `package.json` file again. Using an array as a set
      // is acceptable here because the number of directories to consider
      // is rarely greater than 1 or 2. Also, using indexOf allows us to
      // store File objects instead of strings.
      if (seenDirFiles.indexOf(file) < 0) {
        seenDirFiles.push(file);

        var pkgJsonFile = fileAppendIdPart(file, "package.json"), main;
        var pkg = pkgJsonFile && fileEvaluate(pkgJsonFile, parentModule);
        if (pkg && (browser &&
                    isString(main = pkg.browser) ||
                    isString(main = pkg.main))) {
          recordChild(parentModule, pkgJsonFile);

          // The "main" field of package.json does not have to begin with
          // ./ to be considered relative, so first we try simply
          // appending it to the directory path before falling back to a
          // full fileResolve, which might return a package from a
          // node_modules directory.
          file = fileAppendId(file, main, extensions) ||
            fileResolve(file, main, parentModule, seenDirFiles);

          if (file) {
            // The fileAppendId call above may have returned a directory,
            // so continue the loop to make sure we resolve it to a
            // non-directory file.
            continue;
          }
        }
      }

      // If we didn't find a `package.json` file, or it didn't have a
      // resolvable `.main` property, the only possibility left to
      // consider is that this directory contains an `index.js` module.
      // This assignment almost always terminates the while loop, because
      // there's very little chance `fileIsDirectory(file)` will be true
      // for the result of `fileAppendIdPart(file, "index.js")`. However,
      // in principle it is remotely possible that a file called
      // `index.js` could be a directory instead of a file.
      file = fileAppendIdPart(file, "index.js");
    }

    if (file && isString(file.c)) {
      file = fileResolve(file, file.c, parentModule, seenDirFiles);
    }

    recordChild(parentModule, file);

    return file;
  };

  function nodeModulesLookup(file, id, extensions) {
    if (isFunction(override)) {
      id = override(id, file.m.id);
    }

    if (isString(id)) {
      for (var resolved; file && ! resolved; file = file.p) {
        resolved = fileIsDirectory(file) &&
          fileAppendId(file, "node_modules/" + id, extensions);
      }

      return resolved;
    }
  }

  return install;
};

if (typeof exports === "object") {
  exports.makeInstaller = makeInstaller;
}

/////////////////////////////////////////////////////////////////////////////







(function(){

/////////////////////////////////////////////////////////////////////////////
//                                                                         //
// packages/modules-runtime/modules-runtime.js                             //
//                                                                         //
/////////////////////////////////////////////////////////////////////////////
                                                                           //
var options = {};
var hasOwn = options.hasOwnProperty;

// RegExp matching strings that don't start with a `.` or a `/`.
var topLevelIdPattern = /^[^./]/;

if (typeof Profile === "function" &&
    process.env.METEOR_PROFILE) {
  options.wrapRequire = function (require) {
    return Profile(function (id) {
      return "require(" + JSON.stringify(id) + ")";
    }, require);
  };
}

// On the client, make package resolution prefer the "browser" field of
// package.json files to the "main" field.
options.browser = Meteor.isClient;

// This function will be called whenever a module identifier that hasn't
// been installed is required. For backwards compatibility, and so that we
// can require binary dependencies on the server, we implement the
// fallback in terms of Npm.require.
options.fallback = function (id, parentId, error) {
  // For simplicity, we honor only top-level module identifiers here.
  // We could try to honor relative and absolute module identifiers by
  // somehow combining `id` with `dir`, but we'd have to be really careful
  // that the resulting modules were located in a known directory (not
  // some arbitrary location on the file system), and we only really need
  // the fallback for dependencies installed in node_modules directories.
  if (topLevelIdPattern.test(id)) {
    if (typeof Npm === "object" &&
        typeof Npm.require === "function") {
      return Npm.require(id);
    }
  }

  throw error;
};

options.fallback.resolve = function (id, parentId, error) {
  if (Meteor.isServer &&
      topLevelIdPattern.test(id)) {
    // Allow any top-level identifier to resolve to itself on the server,
    // so that options.fallback can have a chance to handle it.
    return id;
  }

  throw error;
};

meteorInstall = makeInstaller(options);
var Mp = meteorInstall.Module.prototype;

if (Meteor.isServer) {
  Mp.useNode = function () {
    if (typeof npmRequire !== "function") {
      // Can't use Node if npmRequire is not defined.
      return false;
    }

    var parts = this.id.split("/");
    var start = 0;
    if (parts[start] === "") ++start;
    if (parts[start] === "node_modules" &&
        parts[start + 1] === "meteor") {
      start += 2;
    }

    if (parts.indexOf("node_modules", start) < 0) {
      // Don't try to use Node for modules that aren't in node_modules
      // directories.
      return false;
    }

    try {
      npmRequire.resolve(this.id);
    } catch (e) {
      return false;
    }

    this.exports = npmRequire(this.id);

    return true;
  };
}

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
