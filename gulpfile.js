'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var browserSync = require('browser-sync');


//•• CSS

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


//•• BrowserSync (server, livereload)

gulp.task('browser-sync', function() {
  browserSync.init([
    './src/css/*.css',
    './src/js/**/*.js',
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

//•• React

gulp.task('jsx', function () {
  return gulp.src('./src/js/autocomplete-react.jsx')
    .pipe(plugins.react({harmony: true}))
    .pipe(gulp.dest('./src/js'));
});


//•• Default task

gulp.task('default', [
  'sass',
  'browser-sync',
  'jsx'
  ], function () {

  gulp.watch('./src/sass/**/*.scss', ['sass']);

  gulp.watch('./src/js/**/*.jsx', ['jsx']);

});



