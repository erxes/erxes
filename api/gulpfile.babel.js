import through from 'through2';
import browserify from 'browserify';
import babelify from 'babelify';
import sassify from 'sassify';
import gulp from 'gulp';
import header from 'gulp-header';
import footer from 'gulp-footer';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import gulpif from 'gulp-if';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import minimist from 'minimist';
import settings from './settings.json';


const paths = {
  src: ['src/**/*.js', 'src/**/*.jsx', 'sass/**/*.scss'],
};
const knownOptions = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'development' },
};

const options = minimist(process.argv.slice(2), knownOptions);

function addSettings(file) {
  const head = `const API_URL = "${settings.API_URL}";\n`;

  return through(function t(buf, enc, next) {
    let content = `${buf.toString('utf8')}`;
    if (file.endsWith('src/erxes.js')) {
      content = `${head}${content}`;
    }
    this.push(content);
    next();
  });
}

gulp.task('build', () => {
  const headerString = `(function (window, undefined) {const CDN_HOST = "${settings.CDN_HOST}";`;

  gulp.src('src/widget.js')
    .pipe(header(headerString))
    .pipe(footer('})(window)'))
    .pipe(babel())
    .pipe(gulpif(options.env === 'production', uglify()))
    .pipe(gulp.dest('static'));

  const b = browserify({
    entries: './src/erxes.js',
    transform: [addSettings, babelify],
  })
    .transform(sassify, {
      sourceComments: false,
      sourceMap: false,
      sourceMapEmbed: false,
      sourceMapContents: false,
      base64Encode: false,
      'auto-inject': true,
    });

  b.bundle()
    .on('error', (err) => {
      console.log(err.message); // eslint-disable-line no-console
    })
    .pipe(source('erxes.js'))
    .pipe(buffer())
    .pipe(gulpif(options.env === 'production', uglify()))
    .pipe(gulp.dest('static'));
});

gulp.task('watch', () => {
  gulp.watch(paths.src, ['build']);
});

gulp.task('default', ['watch', 'build']);
