// Include gulp and plugins
var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    minifycss = require('gulp-minify-css'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    browserSync = require('browser-sync'),
    cache = require('gulp-cache'),
    rename = require('gulp-rename');
// then come the individual functions

//css
gulp.task('styles', function() {
  return gulp.src('dev/css/styles.css')
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('assets/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('assets/css'));
});

//js
gulp.task('scripts', function() {
  return gulp.src('dev/js/*.js')
    .pipe(concat('main.js'))
    .pipe(gulp.dest('assets/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('assets/js'));
});

//image compression
gulp.task('images', function() {
  return gulp.src('dev/img/*')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('assets/img'));
});

//browser-sync stuff
gulp.task('browserSync', function() {
    browserSync.init(['assets/css/*.css', '*.php','assets/js/*.js']);
});

//cleanup time
gulp.task('clean', function() {
  return gulp.src(['assets/css', 'assets/js', 'assets/img'], {read: false})
    .pipe(clean());
});

//watch all the things
gulp.task('watch', function () {
    // Watch the css folder for changes
    gulp.watch('dev/css/*.css', ['styles']);
    // Watch the js folder for changes
    gulp.watch('dev/js/*.js', ['scripts']);
    // Watch the img folder for changes
    gulp.watch('dev/img/*', ['images']);
});

gulp.task('default', ['browserSync','watch','scripts','images','styles']);