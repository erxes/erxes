# pbckcode

A CKEditor plugin to easily add code into your articles.
The plugin will create a dialog where you will be able to format your code as your will. When you press the **OK** button, the plugin will create a *pre* tag with your code inside.

# Demos

*  [Basic configuration](http://prbaron.github.com/pbckcode/basic.html)
*  [Use options](http://prbaron.github.com/pbckcode/options.html)
*  [Load ACE from custom directory](http://prbaron.github.com/pbckcode/custom-ace.html)
*  [Full CKEditor](http://prbaron.github.com/pbckcode/full.html)

# Installation
1. Download the plugin from the Github repository : [https://github.com/prbaron/pbckcode/tags](https://github.com/prbaron/pbckcode/tags)
1. Place the **src** folder into the plugins folder of CKEditor (*{Path to CKEDitor}/plugins/*)
1. Rename the folder to **pbckcode** (it will be easier to call it into CKEditor)
1. Open the config.js file and add the following lines :

```js
CKEDITOR.editorConfig = function(config) {
  // CKEDITOR TOOLBAR CUSTOMIZATION
  // I only set the needed buttons, so feel frey to add those you want in the array
  config.toolbarGroups = [
    {name: 'pbckcode'},
    // your other buttons here
    // get information about available buttons here: bhttp://docs.ckeditor.com/?mobile=/guide/dev_toolbar
  ];

  // CKEDITOR PLUGINS LOADING
  config.extraPlugins = 'pbckcode'; // add other plugins here (comma separated)

  // ADVANCED CONTENT FILTER (ACF)
  // ACF protects your CKEditor instance of adding unofficial tags
  // however it strips out the pre tag of pbckcode plugin
  // add this rule to enable it, useful when you want to re edit a post
  // only needed on v1.1.x
  config.allowedContent = 'pre[*]{*}(*)'; // add other rules here

  // PBCKCODE CUSTOMIZATION
  config.pbckcode = {
    // An optional class to your pre tag.
    cls: '',

    // The syntax highlighter you will use in the output view
    highlighter: 'PRETTIFY',

    // An array of the available modes for you plugin.
    // The key corresponds to the string shown in the select tag.
    // The value correspond to the loaded file for ACE Editor.
    modes: [['HTML', 'html'], ['CSS', 'css'], ['PHP', 'php'], ['JS', 'javascript']],

    // The theme of the ACE Editor of the plugin.
    theme: 'textmate',

    // Tab indentation (in spaces)
    tab_size: '4'
  };
};
```
And you are good to go! You will have the same configuration than the demo.

# Options

## highlighter

Choose your synta highlighter output. Remove the option if you want to output a basic &lt;pre&gt; tag, otherwise, choose one of them.

```js
'HIGHLIGHT' // http://highlightjs.org/
'PRETTIFY' // https://code.google.com/p/google-code-prettify/
'PRISM' // http://prismjs.com/
'SYNTAX_HIGHLIGHTER' // http://alexgorbatchev.com/SyntaxHighlighter/
```

## modes
```js
// Available modes
['C/C++'        , 'c_cpp']
['C9Search'     , 'c9search']
['Clojure'      , 'clojure']
['CoffeeScript' , 'coffee']
['ColdFusion'   , 'coldfusion']
['C#'           , 'csharp']
['CSS'          , 'css']
['Diff'         , 'diff']
['Glsl'         , 'glsl']
['Go'           , 'golang']
['Groovy'       , 'groovy']
['haXe'         , 'haxe']
['HTML'         , 'html']
['Jade'         , 'jade']
['Java'         , 'java']
['JavaScript'   , 'javascript']
['JSON'         , 'json']
['JSP'          , 'jsp']
['JSX'          , 'jsx']
['LaTeX'        , 'latex']
['LESS'         , 'less']
['Liquid'       , 'liquid']
['Lua'          , 'lua']
['LuaPage'      , 'luapage']
['Markdown'     , 'markdown']
['OCaml'        , 'ocaml']
['Perl'         , 'perl']
['pgSQL'        , 'pgsql']
['PHP'          , 'php']
['Powershell'   , 'powershel1']
['Python'       , 'python']
['R'            , 'ruby']
['OpenSCAD'     , 'scad']
['Scala'        , 'scala']
['SCSS/Sass'    , 'scss']
['SH'           , 'sh']
['SQL'          , 'sql']
['SVG'          , 'svg']
['Tcl'          , 'tcl']
['Text'         , 'text']
['Textile'      , 'textile']
['XML'          , 'xml']
['XQuery'       , 'xq']
['YAML'         , 'yaml']
```

## theme

```js
// Bright themes
'chrome'
'clouds'
'crimson_editor'
'dawn'
'dreamweaver'
'eclipse'
'github'
'solarized_light'
'textmate' // default theme
'tomorrow'
'xcode'
'kuroir'
'katzenmilch'
```

```js
// Dark themes
'ambiance'
'chaos'
'clouds_midnight'
'cobalt'
'idle_fingers'
'kr_theme'
'merbivore'
'merbivore_soft'
'mono_industrial'
'monokai'
'pastel_on_dark'
'solarized_dark'
'terminal'
'tomorrow_night'
'tomorrow_night_blue'
'tomorrow_night_bright'
'tomorrow_night_eighties'
'twilight'
'vibrant_ink'
```

# Special Thanks

  * CKEditor : [http://ckeditor.com/](http://ckeditor.com/)
  * ACE : [http://ace.ajax.org/](http://ace.ajax.org/)
  * Lea Verou : [http://prismjs.com/](http://prismjs.com/)
  * Google : [https://code.google.com/p/google-code-prettify/](https://code.google.com/p/google-code-prettify/)
  * Ivan Sagalaev : [http://highlightjs.org/](http://highlightjs.org/)
  * Alex Gorbatchev : [http://alexgorbatchev.com/SyntaxHighlighter/](http://alexgorbatchev.com/SyntaxHighlighter/)

# Credits
#### Pierre Baron
*  Website : [http://www.pierrebaron.fr](http://www.pierrebaron.fr)
*  Twitter : [@prbaron](https://twitter.com/prbaron)
*  Contact : <prbaron22@gmail.com>
