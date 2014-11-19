'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var wiredep = require('wiredep').stream;
var browserSync = require('browser-sync');


//•• CSS: DEVELOPMENT

gulp.task('sass', function () {
  return gulp.src('./src/sass/**/*.scss')
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({
      outputStyle: 'nested',
      errLogToConsole: true
    }))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest('./src/css'))
    .on('error', plugins.util.log);
});


//•• JS: DEV

gulp.task('scripts', function () {
  gulp.src('./src/app/**/*.js')
    .pipe(plugins.concat('app.js'))
    .pipe(gulp.dest('./src/app/'))
    .on('error', plugins.util.log);
});


//•• BrowserSync (server, livereload)

gulp.task('browser-sync', function () {
  browserSync.init([
    './src/css/*.css',
    './src/app/**/*.js',
    './src/**/*.html'
  ], {
    notify: false,
    server: {
      baseDir: ['./src']
    },
    browser: [],
    tunnel: false
  });
});

//•• Auto wire Bower Dependencies

gulp.task('wirebower', function () {
  gulp.src('./src/index.html')
    .pipe(wiredep())
    .pipe(gulp.dest('./src/'));
});

//•• Inject app scripts: DEV

gulp.task('index', function () {
  var target = gulp.src('./src/index.html');
  var sources = gulp.src(['./src/app/**/*.js'], { read: false });

  return target.pipe(plugins.inject(sources, { relative: true }))
    .pipe(gulp.dest('./src'));
});


//•• Default task

gulp.task('default', [
  'index',
  'sass',
  'browser-sync'
  ], function () {

  plugins.watch(
    './src/sass/**/*.scss',
    {
      name: 'SASS'
    },
    function() {
      gulp.start('sass');
  });

});



