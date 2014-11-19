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



//•• Default task

gulp.task('default', [
  'sass',
  'browser-sync'
  ], function () {

  gulp.watch('./src/sass/**/*.scss', ['sass']);

});



