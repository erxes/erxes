(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var _ = Package.underscore._;
var HTML = Package.htmljs.HTML;
var HTMLTools = Package['html-tools'].HTMLTools;
var BlazeTools = Package['blaze-tools'].BlazeTools;

/* Package-scope variables */
var SpacebarsCompiler, TemplateTag, ReactComponentSiblingForbidder;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/spacebars-compiler/templatetag.js                                                          //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
SpacebarsCompiler = {};

// A TemplateTag is the result of parsing a single `{{...}}` tag.
//
// The `.type` of a TemplateTag is one of:
//
// - `"DOUBLE"` - `{{foo}}`
// - `"TRIPLE"` - `{{{foo}}}`
// - `"EXPR"` - `(foo)`
// - `"COMMENT"` - `{{! foo}}`
// - `"BLOCKCOMMENT" - `{{!-- foo--}}`
// - `"INCLUSION"` - `{{> foo}}`
// - `"BLOCKOPEN"` - `{{#foo}}`
// - `"BLOCKCLOSE"` - `{{/foo}}`
// - `"ELSE"` - `{{else}}`
// - `"ESCAPE"` - `{{|`, `{{{|`, `{{{{|` and so on
//
// Besides `type`, the mandatory properties of a TemplateTag are:
//
// - `path` - An array of one or more strings.  The path of `{{foo.bar}}`
//   is `["foo", "bar"]`.  Applies to DOUBLE, TRIPLE, INCLUSION, BLOCKOPEN,
//   BLOCKCLOSE, and ELSE.
//
// - `args` - An array of zero or more argument specs.  An argument spec
//   is a two or three element array, consisting of a type, value, and
//   optional keyword name.  For example, the `args` of `{{foo "bar" x=3}}`
//   are `[["STRING", "bar"], ["NUMBER", 3, "x"]]`.  Applies to DOUBLE,
//   TRIPLE, INCLUSION, BLOCKOPEN, and ELSE.
//
// - `value` - A string of the comment's text. Applies to COMMENT and
//   BLOCKCOMMENT.
//
// These additional are typically set during parsing:
//
// - `position` - The HTMLTools.TEMPLATE_TAG_POSITION specifying at what sort
//   of site the TemplateTag was encountered (e.g. at element level or as
//   part of an attribute value). Its absence implies
//   TEMPLATE_TAG_POSITION.ELEMENT.
//
// - `content` and `elseContent` - When a BLOCKOPEN tag's contents are
//   parsed, they are put here.  `elseContent` will only be present if
//   an `{{else}}` was found.

var TEMPLATE_TAG_POSITION = HTMLTools.TEMPLATE_TAG_POSITION;

TemplateTag = SpacebarsCompiler.TemplateTag = function () {
  HTMLTools.TemplateTag.apply(this, arguments);
};
TemplateTag.prototype = new HTMLTools.TemplateTag;
TemplateTag.prototype.constructorName = 'SpacebarsCompiler.TemplateTag';

var makeStacheTagStartRegex = function (r) {
  return new RegExp(r.source + /(?![{>!#/])/.source,
                    r.ignoreCase ? 'i' : '');
};

// "starts" regexes are used to see what type of template
// tag the parser is looking at.  They must match a non-empty
// result, but not the interesting part of the tag.
var starts = {
  ESCAPE: /^\{\{(?=\{*\|)/,
  ELSE: makeStacheTagStartRegex(/^\{\{\s*else(\s+(?!\s)|(?=[}]))/i),
  DOUBLE: makeStacheTagStartRegex(/^\{\{\s*(?!\s)/),
  TRIPLE: makeStacheTagStartRegex(/^\{\{\{\s*(?!\s)/),
  BLOCKCOMMENT: makeStacheTagStartRegex(/^\{\{\s*!--/),
  COMMENT: makeStacheTagStartRegex(/^\{\{\s*!/),
  INCLUSION: makeStacheTagStartRegex(/^\{\{\s*>\s*(?!\s)/),
  BLOCKOPEN: makeStacheTagStartRegex(/^\{\{\s*#\s*(?!\s)/),
  BLOCKCLOSE: makeStacheTagStartRegex(/^\{\{\s*\/\s*(?!\s)/)
};

var ends = {
  DOUBLE: /^\s*\}\}/,
  TRIPLE: /^\s*\}\}\}/,
  EXPR: /^\s*\)/
};

var endsString = {
  DOUBLE: '}}',
  TRIPLE: '}}}',
  EXPR: ')'
};

// Parse a tag from the provided scanner or string.  If the input
// doesn't start with `{{`, returns null.  Otherwise, either succeeds
// and returns a SpacebarsCompiler.TemplateTag, or throws an error (using
// `scanner.fatal` if a scanner is provided).
TemplateTag.parse = function (scannerOrString) {
  var scanner = scannerOrString;
  if (typeof scanner === 'string')
    scanner = new HTMLTools.Scanner(scannerOrString);

  if (! (scanner.peek() === '{' &&
         (scanner.rest()).slice(0, 2) === '{{'))
    return null;

  var run = function (regex) {
    // regex is assumed to start with `^`
    var result = regex.exec(scanner.rest());
    if (! result)
      return null;
    var ret = result[0];
    scanner.pos += ret.length;
    return ret;
  };

  var advance = function (amount) {
    scanner.pos += amount;
  };

  var scanIdentifier = function (isFirstInPath) {
    var id = BlazeTools.parseExtendedIdentifierName(scanner);
    if (! id) {
      expected('IDENTIFIER');
    }
    if (isFirstInPath &&
        (id === 'null' || id === 'true' || id === 'false'))
      scanner.fatal("Can't use null, true, or false, as an identifier at start of path");

    return id;
  };

  var scanPath = function () {
    var segments = [];

    // handle initial `.`, `..`, `./`, `../`, `../..`, `../../`, etc
    var dots;
    if ((dots = run(/^[\.\/]+/))) {
      var ancestorStr = '.'; // eg `../../..` maps to `....`
      var endsWithSlash = /\/$/.test(dots);

      if (endsWithSlash)
        dots = dots.slice(0, -1);

      _.each(dots.split('/'), function(dotClause, index) {
        if (index === 0) {
          if (dotClause !== '.' && dotClause !== '..')
            expected("`.`, `..`, `./` or `../`");
        } else {
          if (dotClause !== '..')
            expected("`..` or `../`");
        }

        if (dotClause === '..')
          ancestorStr += '.';
      });

      segments.push(ancestorStr);

      if (!endsWithSlash)
        return segments;
    }

    while (true) {
      // scan a path segment

      if (run(/^\[/)) {
        var seg = run(/^[\s\S]*?\]/);
        if (! seg)
          error("Unterminated path segment");
        seg = seg.slice(0, -1);
        if (! seg && ! segments.length)
          error("Path can't start with empty string");
        segments.push(seg);
      } else {
        var id = scanIdentifier(! segments.length);
        if (id === 'this') {
          if (! segments.length) {
            // initial `this`
            segments.push('.');
          } else {
            error("Can only use `this` at the beginning of a path.\nInstead of `foo.this` or `../this`, just write `foo` or `..`.");
          }
        } else {
          segments.push(id);
        }
      }

      var sep = run(/^[\.\/]/);
      if (! sep)
        break;
    }

    return segments;
  };

  // scan the keyword portion of a keyword argument
  // (the "foo" portion in "foo=bar").
  // Result is either the keyword matched, or null
  // if we're not at a keyword argument position.
  var scanArgKeyword = function () {
    var match = /^([^\{\}\(\)\>#=\s"'\[\]]+)\s*=\s*/.exec(scanner.rest());
    if (match) {
      scanner.pos += match[0].length;
      return match[1];
    } else {
      return null;
    }
  };

  // scan an argument; succeeds or errors.
  // Result is an array of two or three items:
  // type , value, and (indicating a keyword argument)
  // keyword name.
  var scanArg = function () {
    var keyword = scanArgKeyword(); // null if not parsing a kwarg
    var value = scanArgValue();
    return keyword ? value.concat(keyword) : value;
  };

  // scan an argument value (for keyword or positional arguments);
  // succeeds or errors.  Result is an array of type, value.
  var scanArgValue = function () {
    var startPos = scanner.pos;
    var result;
    if ((result = BlazeTools.parseNumber(scanner))) {
      return ['NUMBER', result.value];
    } else if ((result = BlazeTools.parseStringLiteral(scanner))) {
      return ['STRING', result.value];
    } else if (/^[\.\[]/.test(scanner.peek())) {
      return ['PATH', scanPath()];
    } else if (run(/^\(/)) {
      return ['EXPR', scanExpr('EXPR')];
    } else if ((result = BlazeTools.parseExtendedIdentifierName(scanner))) {
      var id = result;
      if (id === 'null') {
        return ['NULL', null];
      } else if (id === 'true' || id === 'false') {
        return ['BOOLEAN', id === 'true'];
      } else {
        scanner.pos = startPos; // unconsume `id`
        return ['PATH', scanPath()];
      }
    } else {
      expected('identifier, number, string, boolean, null, or a sub expression enclosed in "(", ")"');
    }
  };

  var scanExpr = function (type) {
    var endType = type;
    if (type === 'INCLUSION' || type === 'BLOCKOPEN' || type === 'ELSE')
      endType = 'DOUBLE';

    var tag = new TemplateTag;
    tag.type = type;
    tag.path = scanPath();
    tag.args = [];
    var foundKwArg = false;
    while (true) {
      run(/^\s*/);
      if (run(ends[endType]))
        break;
      else if (/^[})]/.test(scanner.peek())) {
        expected('`' + endsString[endType] + '`');
      }
      var newArg = scanArg();
      if (newArg.length === 3) {
        foundKwArg = true;
      } else {
        if (foundKwArg)
          error("Can't have a non-keyword argument after a keyword argument");
      }
      tag.args.push(newArg);

      // expect a whitespace or a closing ')' or '}'
      if (run(/^(?=[\s})])/) !== '')
        expected('space');
    }

    return tag;
  };

  var type;

  var error = function (msg) {
    scanner.fatal(msg);
  };

  var expected = function (what) {
    error('Expected ' + what);
  };

  // must do ESCAPE first, immediately followed by ELSE
  // order of others doesn't matter
  if (run(starts.ESCAPE)) type = 'ESCAPE';
  else if (run(starts.ELSE)) type = 'ELSE';
  else if (run(starts.DOUBLE)) type = 'DOUBLE';
  else if (run(starts.TRIPLE)) type = 'TRIPLE';
  else if (run(starts.BLOCKCOMMENT)) type = 'BLOCKCOMMENT';
  else if (run(starts.COMMENT)) type = 'COMMENT';
  else if (run(starts.INCLUSION)) type = 'INCLUSION';
  else if (run(starts.BLOCKOPEN)) type = 'BLOCKOPEN';
  else if (run(starts.BLOCKCLOSE)) type = 'BLOCKCLOSE';
  else
    error('Unknown stache tag');

  var tag = new TemplateTag;
  tag.type = type;

  if (type === 'BLOCKCOMMENT') {
    var result = run(/^[\s\S]*?--\s*?\}\}/);
    if (! result)
      error("Unclosed block comment");
    tag.value = result.slice(0, result.lastIndexOf('--'));
  } else if (type === 'COMMENT') {
    var result = run(/^[\s\S]*?\}\}/);
    if (! result)
      error("Unclosed comment");
    tag.value = result.slice(0, -2);
  } else if (type === 'BLOCKCLOSE') {
    tag.path = scanPath();
    if (! run(ends.DOUBLE))
      expected('`}}`');
  } else if (type === 'ELSE') {
    if (! run(ends.DOUBLE)) {
      tag = scanExpr(type);
    }
  } else if (type === 'ESCAPE') {
    var result = run(/^\{*\|/);
    tag.value = '{{' + result.slice(0, -1);
  } else {
    // DOUBLE, TRIPLE, BLOCKOPEN, INCLUSION
    tag = scanExpr(type);
  }

  return tag;
};

// Returns a SpacebarsCompiler.TemplateTag parsed from `scanner`, leaving scanner
// at its original position.
//
// An error will still be thrown if there is not a valid template tag at
// the current position.
TemplateTag.peek = function (scanner) {
  var startPos = scanner.pos;
  var result = TemplateTag.parse(scanner);
  scanner.pos = startPos;
  return result;
};

// Like `TemplateTag.parse`, but in the case of blocks, parse the complete
// `{{#foo}}...{{/foo}}` with `content` and possible `elseContent`, rather
// than just the BLOCKOPEN tag.
//
// In addition:
//
// - Throws an error if `{{else}}` or `{{/foo}}` tag is encountered.
//
// - Returns `null` for a COMMENT.  (This case is distinguishable from
//   parsing no tag by the fact that the scanner is advanced.)
//
// - Takes an HTMLTools.TEMPLATE_TAG_POSITION `position` and sets it as the
//   TemplateTag's `.position` property.
//
// - Validates the tag's well-formedness and legality at in its position.
TemplateTag.parseCompleteTag = function (scannerOrString, position) {
  var scanner = scannerOrString;
  if (typeof scanner === 'string')
    scanner = new HTMLTools.Scanner(scannerOrString);

  var startPos = scanner.pos; // for error messages
  var result = TemplateTag.parse(scannerOrString);
  if (! result)
    return result;

  if (result.type === 'BLOCKCOMMENT')
    return null;

  if (result.type === 'COMMENT')
    return null;

  if (result.type === 'ELSE')
    scanner.fatal("Unexpected {{else}}");

  if (result.type === 'BLOCKCLOSE')
    scanner.fatal("Unexpected closing template tag");

  position = (position || TEMPLATE_TAG_POSITION.ELEMENT);
  if (position !== TEMPLATE_TAG_POSITION.ELEMENT)
    result.position = position;

  if (result.type === 'BLOCKOPEN') {
    // parse block contents

    // Construct a string version of `.path` for comparing start and
    // end tags.  For example, `foo/[0]` was parsed into `["foo", "0"]`
    // and now becomes `foo,0`.  This form may also show up in error
    // messages.
    var blockName = result.path.join(',');

    var textMode = null;
      if (blockName === 'markdown' ||
          position === TEMPLATE_TAG_POSITION.IN_RAWTEXT) {
        textMode = HTML.TEXTMODE.STRING;
      } else if (position === TEMPLATE_TAG_POSITION.IN_RCDATA ||
                 position === TEMPLATE_TAG_POSITION.IN_ATTRIBUTE) {
        textMode = HTML.TEXTMODE.RCDATA;
      }
      var parserOptions = {
        getTemplateTag: TemplateTag.parseCompleteTag,
        shouldStop: isAtBlockCloseOrElse,
        textMode: textMode
      };
    result.content = HTMLTools.parseFragment(scanner, parserOptions);

    if (scanner.rest().slice(0, 2) !== '{{')
      scanner.fatal("Expected {{else}} or block close for " + blockName);

    var lastPos = scanner.pos; // save for error messages
    var tmplTag = TemplateTag.parse(scanner); // {{else}} or {{/foo}}

    var lastElseContentTag = result;
    while (tmplTag.type === 'ELSE') {
      if (lastElseContentTag === null) {
        scanner.fatal("Unexpected else after {{else}}");
      }

      if (tmplTag.path) {
        lastElseContentTag.elseContent = new TemplateTag;
        lastElseContentTag.elseContent.type = 'BLOCKOPEN';
        lastElseContentTag.elseContent.path = tmplTag.path;
        lastElseContentTag.elseContent.args = tmplTag.args;
        lastElseContentTag.elseContent.content = HTMLTools.parseFragment(scanner, parserOptions);

        lastElseContentTag = lastElseContentTag.elseContent;
      }
      else {
        // parse {{else}} and content up to close tag
        lastElseContentTag.elseContent = HTMLTools.parseFragment(scanner, parserOptions);

        lastElseContentTag = null;
      }

      if (scanner.rest().slice(0, 2) !== '{{')
        scanner.fatal("Expected block close for " + blockName);

      lastPos = scanner.pos;
      tmplTag = TemplateTag.parse(scanner);
    }

    if (tmplTag.type === 'BLOCKCLOSE') {
      var blockName2 = tmplTag.path.join(',');
      if (blockName !== blockName2) {
        scanner.pos = lastPos;
        scanner.fatal('Expected tag to close ' + blockName + ', found ' +
                      blockName2);
      }
    } else {
      scanner.pos = lastPos;
      scanner.fatal('Expected tag to close ' + blockName + ', found ' +
                    tmplTag.type);
    }
  }

  var finalPos = scanner.pos;
  scanner.pos = startPos;
  validateTag(result, scanner);
  scanner.pos = finalPos;

  return result;
};

var isAtBlockCloseOrElse = function (scanner) {
  // Detect `{{else}}` or `{{/foo}}`.
  //
  // We do as much work ourselves before deferring to `TemplateTag.peek`,
  // for efficiency (we're called for every input token) and to be
  // less obtrusive, because `TemplateTag.peek` will throw an error if it
  // sees `{{` followed by a malformed tag.
  var rest, type;
  return (scanner.peek() === '{' &&
          (rest = scanner.rest()).slice(0, 2) === '{{' &&
          /^\{\{\s*(\/|else\b)/.test(rest) &&
          (type = TemplateTag.peek(scanner).type) &&
          (type === 'BLOCKCLOSE' || type === 'ELSE'));
};

// Validate that `templateTag` is correctly formed and legal for its
// HTML position.  Use `scanner` to report errors. On success, does
// nothing.
var validateTag = function (ttag, scanner) {

  if (ttag.type === 'INCLUSION' || ttag.type === 'BLOCKOPEN') {
    var args = ttag.args;
    if (ttag.path[0] === 'each' && args[1] && args[1][0] === 'PATH' &&
        args[1][1][0] === 'in') {
      // For slightly better error messages, we detect the each-in case
      // here in order not to complain if the user writes `{{#each 3 in x}}`
      // that "3 is not a function"
    } else {
      if (args.length > 1 && args[0].length === 2 && args[0][0] !== 'PATH') {
        // we have a positional argument that is not a PATH followed by
        // other arguments
        scanner.fatal("First argument must be a function, to be called on " +
                      "the rest of the arguments; found " + args[0][0]);
      }
    }
  }

  var position = ttag.position || TEMPLATE_TAG_POSITION.ELEMENT;
  if (position === TEMPLATE_TAG_POSITION.IN_ATTRIBUTE) {
    if (ttag.type === 'DOUBLE' || ttag.type === 'ESCAPE') {
      return;
    } else if (ttag.type === 'BLOCKOPEN') {
      var path = ttag.path;
      var path0 = path[0];
      if (! (path.length === 1 && (path0 === 'if' ||
                                   path0 === 'unless' ||
                                   path0 === 'with' ||
                                   path0 === 'each'))) {
        scanner.fatal("Custom block helpers are not allowed in an HTML attribute, only built-in ones like #each and #if");
      }
    } else {
      scanner.fatal(ttag.type + " template tag is not allowed in an HTML attribute");
    }
  } else if (position === TEMPLATE_TAG_POSITION.IN_START_TAG) {
    if (! (ttag.type === 'DOUBLE')) {
      scanner.fatal("Reactive HTML attributes must either have a constant name or consist of a single {{helper}} providing a dictionary of names and values.  A template tag of type " + ttag.type + " is not allowed here.");
    }
    if (scanner.peek() === '=') {
      scanner.fatal("Template tags are not allowed in attribute names, only in attribute values or in the form of a single {{helper}} that evaluates to a dictionary of name=value pairs.");
    }
  }

};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/spacebars-compiler/optimizer.js                                                            //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
// Optimize parts of an HTMLjs tree into raw HTML strings when they don't
// contain template tags.

var constant = function (value) {
  return function () { return value; };
};

var OPTIMIZABLE = {
  NONE: 0,
  PARTS: 1,
  FULL: 2
};

// We can only turn content into an HTML string if it contains no template
// tags and no "tricky" HTML tags.  If we can optimize the entire content
// into a string, we return OPTIMIZABLE.FULL.  If the we are given an
// unoptimizable node, we return OPTIMIZABLE.NONE.  If we are given a tree
// that contains an unoptimizable node somewhere, we return OPTIMIZABLE.PARTS.
//
// For example, we always create SVG elements programmatically, since SVG
// doesn't have innerHTML.  If we are given an SVG element, we return NONE.
// However, if we are given a big tree that contains SVG somewhere, we
// return PARTS so that the optimizer can descend into the tree and optimize
// other parts of it.
var CanOptimizeVisitor = HTML.Visitor.extend();
CanOptimizeVisitor.def({
  visitNull: constant(OPTIMIZABLE.FULL),
  visitPrimitive: constant(OPTIMIZABLE.FULL),
  visitComment: constant(OPTIMIZABLE.FULL),
  visitCharRef: constant(OPTIMIZABLE.FULL),
  visitRaw: constant(OPTIMIZABLE.FULL),
  visitObject: constant(OPTIMIZABLE.NONE),
  visitFunction: constant(OPTIMIZABLE.NONE),
  visitArray: function (x) {
    for (var i = 0; i < x.length; i++)
      if (this.visit(x[i]) !== OPTIMIZABLE.FULL)
        return OPTIMIZABLE.PARTS;
    return OPTIMIZABLE.FULL;
  },
  visitTag: function (tag) {
    var tagName = tag.tagName;
    if (tagName === 'textarea') {
      // optimizing into a TEXTAREA's RCDATA would require being a little
      // more clever.
      return OPTIMIZABLE.NONE;
    } else if (tagName === 'script') {
      // script tags don't work when rendered from strings
      return OPTIMIZABLE.NONE;
    } else if (! (HTML.isKnownElement(tagName) &&
                  ! HTML.isKnownSVGElement(tagName))) {
      // foreign elements like SVG can't be stringified for innerHTML.
      return OPTIMIZABLE.NONE;
    } else if (tagName === 'table') {
      // Avoid ever producing HTML containing `<table><tr>...`, because the
      // browser will insert a TBODY.  If we just `createElement("table")` and
      // `createElement("tr")`, on the other hand, no TBODY is necessary
      // (assuming IE 8+).
      return OPTIMIZABLE.NONE;
    }

    var children = tag.children;
    for (var i = 0; i < children.length; i++)
      if (this.visit(children[i]) !== OPTIMIZABLE.FULL)
        return OPTIMIZABLE.PARTS;

    if (this.visitAttributes(tag.attrs) !== OPTIMIZABLE.FULL)
      return OPTIMIZABLE.PARTS;

    return OPTIMIZABLE.FULL;
  },
  visitAttributes: function (attrs) {
    if (attrs) {
      var isArray = HTML.isArray(attrs);
      for (var i = 0; i < (isArray ? attrs.length : 1); i++) {
        var a = (isArray ? attrs[i] : attrs);
        if ((typeof a !== 'object') || (a instanceof HTMLTools.TemplateTag))
          return OPTIMIZABLE.PARTS;
        for (var k in a)
          if (this.visit(a[k]) !== OPTIMIZABLE.FULL)
            return OPTIMIZABLE.PARTS;
      }
    }
    return OPTIMIZABLE.FULL;
  }
});

var getOptimizability = function (content) {
  return (new CanOptimizeVisitor).visit(content);
};

var toRaw = function (x) {
  return HTML.Raw(HTML.toHTML(x));
};

var TreeTransformer = HTML.TransformingVisitor.extend();
TreeTransformer.def({
  visitAttributes: function (attrs/*, ...*/) {
    // pass template tags through by default
    if (attrs instanceof HTMLTools.TemplateTag)
      return attrs;

    return HTML.TransformingVisitor.prototype.visitAttributes.apply(
      this, arguments);
  }
});

// Replace parts of the HTMLjs tree that have no template tags (or
// tricky HTML tags) with HTML.Raw objects containing raw HTML.
var OptimizingVisitor = TreeTransformer.extend();
OptimizingVisitor.def({
  visitNull: toRaw,
  visitPrimitive: toRaw,
  visitComment: toRaw,
  visitCharRef: toRaw,
  visitArray: function (array) {
    var optimizability = getOptimizability(array);
    if (optimizability === OPTIMIZABLE.FULL) {
      return toRaw(array);
    } else if (optimizability === OPTIMIZABLE.PARTS) {
      return TreeTransformer.prototype.visitArray.call(this, array);
    } else {
      return array;
    }
  },
  visitTag: function (tag) {
    var optimizability = getOptimizability(tag);
    if (optimizability === OPTIMIZABLE.FULL) {
      return toRaw(tag);
    } else if (optimizability === OPTIMIZABLE.PARTS) {
      return TreeTransformer.prototype.visitTag.call(this, tag);
    } else {
      return tag;
    }
  },
  visitChildren: function (children) {
    // don't optimize the children array into a Raw object!
    return TreeTransformer.prototype.visitArray.call(this, children);
  },
  visitAttributes: function (attrs) {
    return attrs;
  }
});

// Combine consecutive HTML.Raws.  Remove empty ones.
var RawCompactingVisitor = TreeTransformer.extend();
RawCompactingVisitor.def({
  visitArray: function (array) {
    var result = [];
    for (var i = 0; i < array.length; i++) {
      var item = array[i];
      if ((item instanceof HTML.Raw) &&
          ((! item.value) ||
           (result.length &&
            (result[result.length - 1] instanceof HTML.Raw)))) {
        // two cases: item is an empty Raw, or previous item is
        // a Raw as well.  In the latter case, replace the previous
        // Raw with a longer one that includes the new Raw.
        if (item.value) {
          result[result.length - 1] = HTML.Raw(
            result[result.length - 1].value + item.value);
        }
      } else {
        result.push(item);
      }
    }
    return result;
  }
});

// Replace pointless Raws like `HTMl.Raw('foo')` that contain no special
// characters with simple strings.
var RawReplacingVisitor = TreeTransformer.extend();
RawReplacingVisitor.def({
  visitRaw: function (raw) {
    var html = raw.value;
    if (html.indexOf('&') < 0 && html.indexOf('<') < 0) {
      return html;
    } else {
      return raw;
    }
  }
});

SpacebarsCompiler.optimize = function (tree) {
  tree = (new OptimizingVisitor).visit(tree);
  tree = (new RawCompactingVisitor).visit(tree);
  tree = (new RawReplacingVisitor).visit(tree);
  return tree;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/spacebars-compiler/react.js                                                                //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
// A visitor to ensure that React components included via the `{{>
// React}}` template defined in the react-template-helper package are
// the only child in their parent component. Otherwise `React.render`
// would eliminate all of their sibling nodes.
//
// It's a little strange that this logic is in spacebars-compiler if
// it's only relevant to a specific package but there's no way to have
// a package hook into a build plugin.
ReactComponentSiblingForbidder = HTML.Visitor.extend();
ReactComponentSiblingForbidder.def({
  visitArray: function (array, parentTag) {
    for (var i = 0; i < array.length; i++) {
      this.visit(array[i], parentTag);
    }
  },
  visitObject: function (obj, parentTag) {
    if (obj.type === "INCLUSION" && obj.path.length === 1 && obj.path[0] === "React") {
      if (!parentTag) {
        throw new Error(
          "{{> React}} must be used in a container element"
            + (this.sourceName ? (" in " + this.sourceName) : "")
               + ". Learn more at https://github.com/meteor/meteor/wiki/React-components-must-be-the-only-thing-in-their-wrapper-element");
      }

      var numSiblings = 0;
      for (var i = 0; i < parentTag.children.length; i++) {
        var child = parentTag.children[i];
        if (child !== obj && !(typeof child === "string" && child.match(/^\s*$/))) {
          numSiblings++;
        }
      }

      if (numSiblings > 0) {
        throw new Error(
          "{{> React}} must be used as the only child in a container element"
            + (this.sourceName ? (" in " + this.sourceName) : "")
               + ". Learn more at https://github.com/meteor/meteor/wiki/React-components-must-be-the-only-thing-in-their-wrapper-element");
      }
    }
  },
  visitTag: function (tag) {
    this.visitArray(tag.children, tag /*parentTag*/);
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/spacebars-compiler/codegen.js                                                              //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
// ============================================================
// Code-generation of template tags

// The `CodeGen` class currently has no instance state, but in theory
// it could be useful to track per-function state, like whether we
// need to emit `var self = this` or not.
var CodeGen = SpacebarsCompiler.CodeGen = function () {};

var builtInBlockHelpers = SpacebarsCompiler._builtInBlockHelpers = {
  'if': 'Blaze.If',
  'unless': 'Blaze.Unless',
  'with': 'Spacebars.With',
  'each': 'Blaze.Each',
  'let': 'Blaze.Let'
};


// Mapping of "macros" which, when preceded by `Template.`, expand
// to special code rather than following the lookup rules for dotted
// symbols.
var builtInTemplateMacros = {
  // `view` is a local variable defined in the generated render
  // function for the template in which `Template.contentBlock` or
  // `Template.elseBlock` is invoked.
  'contentBlock': 'view.templateContentBlock',
  'elseBlock': 'view.templateElseBlock',

  // Confusingly, this makes `{{> Template.dynamic}}` an alias
  // for `{{> __dynamic}}`, where "__dynamic" is the template that
  // implements the dynamic template feature.
  'dynamic': 'Template.__dynamic',

  'subscriptionsReady': 'view.templateInstance().subscriptionsReady()'
};

var additionalReservedNames = ["body", "toString", "instance",  "constructor",
  "toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf",
  "propertyIsEnumerable", "__defineGetter__", "__lookupGetter__",
  "__defineSetter__", "__lookupSetter__", "__proto__", "dynamic",
  "registerHelper", "currentData", "parentData"];

// A "reserved name" can't be used as a <template> name.  This
// function is used by the template file scanner.
//
// Note that the runtime imposes additional restrictions, for example
// banning the name "body" and names of built-in object properties
// like "toString".
SpacebarsCompiler.isReservedName = function (name) {
  return builtInBlockHelpers.hasOwnProperty(name) ||
    builtInTemplateMacros.hasOwnProperty(name) ||
    _.indexOf(additionalReservedNames, name) > -1;
};

var makeObjectLiteral = function (obj) {
  var parts = [];
  for (var k in obj)
    parts.push(BlazeTools.toObjectLiteralKey(k) + ': ' + obj[k]);
  return '{' + parts.join(', ') + '}';
};

_.extend(CodeGen.prototype, {
  codeGenTemplateTag: function (tag) {
    var self = this;
    if (tag.position === HTMLTools.TEMPLATE_TAG_POSITION.IN_START_TAG) {
      // Special dynamic attributes: `<div {{attrs}}>...`
      // only `tag.type === 'DOUBLE'` allowed (by earlier validation)
      return BlazeTools.EmitCode('function () { return ' +
          self.codeGenMustache(tag.path, tag.args, 'attrMustache')
          + '; }');
    } else {
      if (tag.type === 'DOUBLE' || tag.type === 'TRIPLE') {
        var code = self.codeGenMustache(tag.path, tag.args);
        if (tag.type === 'TRIPLE') {
          code = 'Spacebars.makeRaw(' + code + ')';
        }
        if (tag.position !== HTMLTools.TEMPLATE_TAG_POSITION.IN_ATTRIBUTE) {
          // Reactive attributes are already wrapped in a function,
          // and there's no fine-grained reactivity.
          // Anywhere else, we need to create a View.
          code = 'Blaze.View(' +
            BlazeTools.toJSLiteral('lookup:' + tag.path.join('.')) + ', ' +
            'function () { return ' + code + '; })';
        }
        return BlazeTools.EmitCode(code);
      } else if (tag.type === 'INCLUSION' || tag.type === 'BLOCKOPEN') {
        var path = tag.path;
        var args = tag.args;

        if (tag.type === 'BLOCKOPEN' &&
            builtInBlockHelpers.hasOwnProperty(path[0])) {
          // if, unless, with, each.
          //
          // If someone tries to do `{{> if}}`, we don't
          // get here, but an error is thrown when we try to codegen the path.

          // Note: If we caught these errors earlier, while scanning, we'd be able to
          // provide nice line numbers.
          if (path.length > 1)
            throw new Error("Unexpected dotted path beginning with " + path[0]);
          if (! args.length)
            throw new Error("#" + path[0] + " requires an argument");

          var dataCode = null;
          // #each has a special treatment as it features two different forms:
          // - {{#each people}}
          // - {{#each person in people}}
          if (path[0] === 'each' && args.length >= 2 && args[1][0] === 'PATH' &&
              args[1][1].length && args[1][1][0] === 'in') {
            // minimum conditions are met for each-in.  now validate this
            // isn't some weird case.
            var eachUsage = "Use either {{#each items}} or " +
                  "{{#each item in items}} form of #each.";
            var inArg = args[1];
            if (! (args.length >= 3 && inArg[1].length === 1)) {
              // we don't have at least 3 space-separated parts after #each, or
              // inArg doesn't look like ['PATH',['in']]
              throw new Error("Malformed #each. " + eachUsage);
            }
            // split out the variable name and sequence arguments
            var variableArg = args[0];
            if (! (variableArg[0] === "PATH" && variableArg[1].length === 1 &&
                   variableArg[1][0].replace(/\./g, ''))) {
              throw new Error("Bad variable name in #each");
            }
            var variable = variableArg[1][0];
            dataCode = 'function () { return { _sequence: ' +
              self.codeGenInclusionData(args.slice(2)) +
              ', _variable: ' + BlazeTools.toJSLiteral(variable) + ' }; }';
          } else if (path[0] === 'let') {
            var dataProps = {};
            _.each(args, function (arg) {
              if (arg.length !== 3) {
                // not a keyword arg (x=y)
                throw new Error("Incorrect form of #let");
              }
              var argKey = arg[2];
              dataProps[argKey] =
                'function () { return Spacebars.call(' +
                self.codeGenArgValue(arg) + '); }';
            });
            dataCode = makeObjectLiteral(dataProps);
          }

          if (! dataCode) {
            // `args` must exist (tag.args.length > 0)
            dataCode = self.codeGenInclusionDataFunc(args) || 'null';
          }

          // `content` must exist
          var contentBlock = (('content' in tag) ?
                              self.codeGenBlock(tag.content) : null);
          // `elseContent` may not exist
          var elseContentBlock = (('elseContent' in tag) ?
                                  self.codeGenBlock(tag.elseContent) : null);

          var callArgs = [dataCode, contentBlock];
          if (elseContentBlock)
            callArgs.push(elseContentBlock);

          return BlazeTools.EmitCode(
            builtInBlockHelpers[path[0]] + '(' + callArgs.join(', ') + ')');

        } else {
          var compCode = self.codeGenPath(path, {lookupTemplate: true});
          if (path.length > 1) {
            // capture reactivity
            compCode = 'function () { return Spacebars.call(' + compCode +
              '); }';
          }

          var dataCode = self.codeGenInclusionDataFunc(tag.args);
          var content = (('content' in tag) ?
                         self.codeGenBlock(tag.content) : null);
          var elseContent = (('elseContent' in tag) ?
                             self.codeGenBlock(tag.elseContent) : null);

          var includeArgs = [compCode];
          if (content) {
            includeArgs.push(content);
            if (elseContent)
              includeArgs.push(elseContent);
          }

          var includeCode =
                'Spacebars.include(' + includeArgs.join(', ') + ')';

          // calling convention compat -- set the data context around the
          // entire inclusion, so that if the name of the inclusion is
          // a helper function, it gets the data context in `this`.
          // This makes for a pretty confusing calling convention --
          // In `{{#foo bar}}`, `foo` is evaluated in the context of `bar`
          // -- but it's what we shipped for 0.8.0.  The rationale is that
          // `{{#foo bar}}` is sugar for `{{#with bar}}{{#foo}}...`.
          if (dataCode) {
            includeCode =
              'Blaze._TemplateWith(' + dataCode + ', function () { return ' +
              includeCode + '; })';
          }

          // XXX BACK COMPAT - UI is the old name, Template is the new
          if ((path[0] === 'UI' || path[0] === 'Template') &&
              (path[1] === 'contentBlock' || path[1] === 'elseBlock')) {
            // Call contentBlock and elseBlock in the appropriate scope
            includeCode = 'Blaze._InOuterTemplateScope(view, function () { return '
              + includeCode + '; })';
          }

          return BlazeTools.EmitCode(includeCode);
        }
      } else if (tag.type === 'ESCAPE') {
        return tag.value;
      } else {
        // Can't get here; TemplateTag validation should catch any
        // inappropriate tag types that might come out of the parser.
        throw new Error("Unexpected template tag type: " + tag.type);
      }
    }
  },

  // `path` is an array of at least one string.
  //
  // If `path.length > 1`, the generated code may be reactive
  // (i.e. it may invalidate the current computation).
  //
  // No code is generated to call the result if it's a function.
  //
  // Options:
  //
  // - lookupTemplate {Boolean} If true, generated code also looks in
  //   the list of templates. (After helpers, before data context).
  //   Used when generating code for `{{> foo}}` or `{{#foo}}`. Only
  //   used for non-dotted paths.
  codeGenPath: function (path, opts) {
    if (builtInBlockHelpers.hasOwnProperty(path[0]))
      throw new Error("Can't use the built-in '" + path[0] + "' here");
    // Let `{{#if Template.contentBlock}}` check whether this template was
    // invoked via inclusion or as a block helper, in addition to supporting
    // `{{> Template.contentBlock}}`.
    // XXX BACK COMPAT - UI is the old name, Template is the new
    if (path.length >= 2 &&
        (path[0] === 'UI' || path[0] === 'Template')
        && builtInTemplateMacros.hasOwnProperty(path[1])) {
      if (path.length > 2)
        throw new Error("Unexpected dotted path beginning with " +
                        path[0] + '.' + path[1]);
      return builtInTemplateMacros[path[1]];
    }

    var firstPathItem = BlazeTools.toJSLiteral(path[0]);
    var lookupMethod = 'lookup';
    if (opts && opts.lookupTemplate && path.length === 1)
      lookupMethod = 'lookupTemplate';
    var code = 'view.' + lookupMethod + '(' + firstPathItem + ')';

    if (path.length > 1) {
      code = 'Spacebars.dot(' + code + ', ' +
        _.map(path.slice(1), BlazeTools.toJSLiteral).join(', ') + ')';
    }

    return code;
  },

  // Generates code for an `[argType, argValue]` argument spec,
  // ignoring the third element (keyword argument name) if present.
  //
  // The resulting code may be reactive (in the case of a PATH of
  // more than one element) and is not wrapped in a closure.
  codeGenArgValue: function (arg) {
    var self = this;

    var argType = arg[0];
    var argValue = arg[1];

    var argCode;
    switch (argType) {
    case 'STRING':
    case 'NUMBER':
    case 'BOOLEAN':
    case 'NULL':
      argCode = BlazeTools.toJSLiteral(argValue);
      break;
    case 'PATH':
      argCode = self.codeGenPath(argValue);
      break;
    case 'EXPR':
      // The format of EXPR is ['EXPR', { type: 'EXPR', path: [...], args: { ... } }]
      argCode = self.codeGenMustache(argValue.path, argValue.args, 'dataMustache');
      break;
    default:
      // can't get here
      throw new Error("Unexpected arg type: " + argType);
    }

    return argCode;
  },

  // Generates a call to `Spacebars.fooMustache` on evaluated arguments.
  // The resulting code has no function literals and must be wrapped in
  // one for fine-grained reactivity.
  codeGenMustache: function (path, args, mustacheType) {
    var self = this;

    var nameCode = self.codeGenPath(path);
    var argCode = self.codeGenMustacheArgs(args);
    var mustache = (mustacheType || 'mustache');

    return 'Spacebars.' + mustache + '(' + nameCode +
      (argCode ? ', ' + argCode.join(', ') : '') + ')';
  },

  // returns: array of source strings, or null if no
  // args at all.
  codeGenMustacheArgs: function (tagArgs) {
    var self = this;

    var kwArgs = null; // source -> source
    var args = null; // [source]

    // tagArgs may be null
    _.each(tagArgs, function (arg) {
      var argCode = self.codeGenArgValue(arg);

      if (arg.length > 2) {
        // keyword argument (represented as [type, value, name])
        kwArgs = (kwArgs || {});
        kwArgs[arg[2]] = argCode;
      } else {
        // positional argument
        args = (args || []);
        args.push(argCode);
      }
    });

    // put kwArgs in options dictionary at end of args
    if (kwArgs) {
      args = (args || []);
      args.push('Spacebars.kw(' + makeObjectLiteral(kwArgs) + ')');
    }

    return args;
  },

  codeGenBlock: function (content) {
    return SpacebarsCompiler.codeGen(content);
  },

  codeGenInclusionData: function (args) {
    var self = this;

    if (! args.length) {
      // e.g. `{{#foo}}`
      return null;
    } else if (args[0].length === 3) {
      // keyword arguments only, e.g. `{{> point x=1 y=2}}`
      var dataProps = {};
      _.each(args, function (arg) {
        var argKey = arg[2];
        dataProps[argKey] = 'Spacebars.call(' + self.codeGenArgValue(arg) + ')';
      });
      return makeObjectLiteral(dataProps);
    } else if (args[0][0] !== 'PATH') {
      // literal first argument, e.g. `{{> foo "blah"}}`
      //
      // tag validation has confirmed, in this case, that there is only
      // one argument (`args.length === 1`)
      return self.codeGenArgValue(args[0]);
    } else if (args.length === 1) {
      // one argument, must be a PATH
      return 'Spacebars.call(' + self.codeGenPath(args[0][1]) + ')';
    } else {
      // Multiple positional arguments; treat them as a nested
      // "data mustache"
      return self.codeGenMustache(args[0][1], args.slice(1),
                                  'dataMustache');
    }

  },

  codeGenInclusionDataFunc: function (args) {
    var self = this;
    var dataCode = self.codeGenInclusionData(args);
    if (dataCode) {
      return 'function () { return ' + dataCode + '; }';
    } else {
      return null;
    }
  }

});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/spacebars-compiler/compiler.js                                                             //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
var UglifyJSMinify = null;
if (Meteor.isServer) {
  UglifyJSMinify = Npm.require('uglify-js').minify;
}

SpacebarsCompiler.parse = function (input) {

  var tree = HTMLTools.parseFragment(
    input,
    { getTemplateTag: TemplateTag.parseCompleteTag });

  return tree;
};

SpacebarsCompiler.compile = function (input, options) {
  var tree = SpacebarsCompiler.parse(input);
  return SpacebarsCompiler.codeGen(tree, options);
};

SpacebarsCompiler._TemplateTagReplacer = HTML.TransformingVisitor.extend();
SpacebarsCompiler._TemplateTagReplacer.def({
  visitObject: function (x) {
    if (x instanceof HTMLTools.TemplateTag) {

      // Make sure all TemplateTags in attributes have the right
      // `.position` set on them.  This is a bit of a hack
      // (we shouldn't be mutating that here), but it allows
      // cleaner codegen of "synthetic" attributes like TEXTAREA's
      // "value", where the template tags were originally not
      // in an attribute.
      if (this.inAttributeValue)
        x.position = HTMLTools.TEMPLATE_TAG_POSITION.IN_ATTRIBUTE;

      return this.codegen.codeGenTemplateTag(x);
    }

    return HTML.TransformingVisitor.prototype.visitObject.call(this, x);
  },
  visitAttributes: function (attrs) {
    if (attrs instanceof HTMLTools.TemplateTag)
      return this.codegen.codeGenTemplateTag(attrs);

    // call super (e.g. for case where `attrs` is an array)
    return HTML.TransformingVisitor.prototype.visitAttributes.call(this, attrs);
  },
  visitAttribute: function (name, value, tag) {
    this.inAttributeValue = true;
    var result = this.visit(value);
    this.inAttributeValue = false;

    if (result !== value) {
      // some template tags must have been replaced, because otherwise
      // we try to keep things `===` when transforming.  Wrap the code
      // in a function as per the rules.  You can't have
      // `{id: Blaze.View(...)}` as an attributes dict because the View
      // would be rendered more than once; you need to wrap it in a function
      // so that it's a different View each time.
      return BlazeTools.EmitCode(this.codegen.codeGenBlock(result));
    }
    return result;
  }
});

SpacebarsCompiler.codeGen = function (parseTree, options) {
  // is this a template, rather than a block passed to
  // a block helper, say
  var isTemplate = (options && options.isTemplate);
  var isBody = (options && options.isBody);
  var sourceName = (options && options.sourceName);

  var tree = parseTree;

  // The flags `isTemplate` and `isBody` are kind of a hack.
  if (isTemplate || isBody) {
    // optimizing fragments would require being smarter about whether we are
    // in a TEXTAREA, say.
    tree = SpacebarsCompiler.optimize(tree);
  }

  // throws an error if using `{{> React}}` with siblings
  new ReactComponentSiblingForbidder({sourceName: sourceName})
    .visit(tree);

  var codegen = new SpacebarsCompiler.CodeGen;
  tree = (new SpacebarsCompiler._TemplateTagReplacer(
    {codegen: codegen})).visit(tree);

  var code = '(function () { ';
  if (isTemplate || isBody) {
    code += 'var view = this; ';
  }
  code += 'return ';
  code += BlazeTools.toJS(tree);
  code += '; })';

  code = SpacebarsCompiler._beautify(code);

  return code;
};

SpacebarsCompiler._beautify = function (code) {
  if (!UglifyJSMinify) {
    return code;
  }

  var result = UglifyJSMinify(code, { 
    fromString: true,
    mangle: false,
    compress: false,
    output: { 
      beautify: true,
      indent_level: 2,
      width: 80
    }
  });
  
  var output = result.code;
  // Uglify interprets our expression as a statement and may add a semicolon.
  // Strip trailing semicolon.
  output = output.replace(/;$/, '');
  return output;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['spacebars-compiler'] = {}, {
  SpacebarsCompiler: SpacebarsCompiler
});

})();
