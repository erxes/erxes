'use strict';

const through = require('through2');
const browserify = require('browserify');
const babelify = require('babelify');
const sassify = require('sassify');

const gulp = require('gulp');
const header = require('gulp-header');
const footer = require('gulp-footer');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const gulpif = require('gulp-if');

const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const minimist = require('minimist');

const settings = require('./settings.json');

const paths = {
  src: ['src/**/*.js', 'src/**/*.jsx', 'sass/**/*.scss']
};

const knownOptions = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'development' }
};

const options = minimist(process.argv.slice(2), knownOptions);

function addSettings(file) {
  const header = `const API_URL = "${settings.API_URL}";\n`;

  return through(function (buf, enc, next) {
    let content = `${buf.toString('utf8')}`;
    if (file.endsWith('src/erxes.js')) {
      content = `${header}${content}`;
    }
    this.push(content);
    next();
  });
}

gulp.task('build', function() {
  const headerString = `(function (window, undefined) {const CDN_HOST = "${settings.CDN_HOST}";`;

  gulp.src('src/widget.js')
    .pipe(header(headerString))
    .pipe(footer('})(window)'))
    .pipe(babel())
    .pipe(gulpif(options.env === 'production', uglify())) // only minify in production
    .pipe(gulp.dest('static'));

  let b = browserify({
    entries: './src/erxes.js',
    transform: [addSettings, babelify]
  })
    .transform(sassify, {
      sourceComments : false,
      sourceMap : false,
      sourceMapEmbed : false,
      sourceMapContents : false,
      base64Encode : false,
      'auto-inject': true
    });

  b.bundle()
    .on('error', function(err){
      console.log(err.message); //eslint-disable-line no-console
    })
    .pipe(source('erxes.js'))
    .pipe(buffer())
    .pipe(gulpif(options.env === 'production', uglify())) // only minify in production
    .pipe(gulp.dest('./static/'));
});

gulp.task('watch', function() {
  gulp.watch(paths.src, ['build']);
});

gulp.task('default', ['watch', 'build']);
