// Include gulp and plugins
var gulp = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),
	clean = require('gulp-clean'),
	concat = require('gulp-concat'),
	browserSync = require('browser-sync'),
	spritesmith = require('gulp.spritesmith'),
	rename = require('gulp-rename'),
	fingerprint = require('gulp-fingerprint'),
	through = require('through2'),
	replace = require('gulp-replace'),
	rev = require('gulp-rev');
// then come the individual functions

//using ruby sass because libsass can't update on time

//css
gulp.task('styles', function() {
	return gulp.src('dev/css/styles.css')
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(gulp.dest('library/css'))
		.pipe(rename({suffix: '.min'}))
		.pipe(minifycss())
		.pipe(gulp.dest('library/css'));
});

//js
gulp.task('scripts', function() {
	return gulp.src('dev/js/*.js')
		.pipe(concat('main.js'))
		.pipe(gulp.dest('library/js'))
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest('library/js'));
});

//image compression
gulp.task('images', function() {
	return gulp.src('dev/images/*')
		.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
		.pipe(gulp.dest('library/images'));
});

//sprites

function relPath(base, filePath)
{
	if (filePath.indexOf(base) !== 0)
	{
		return filePath;
	}

	// remove base path
	var newPath = filePath.substr(base.length);

	if (newPath[0] === path.sep)
	{
		// ignore leading slash
		newPath = newPath.substr(1);
	}

	return newPath;
}


gulp.task('sprites', function () {
	var spriteData = gulp.src('library/images/*.png').pipe(spritesmith({
		imgName: 'sprite.png',
		imgPath: '../images/sprites/sprite.png',
		cssName: '_sprites.scss',
		cssVarMap: function(sprite) {
			// prefix all sprite variables
			sprite.name = 'sprite_' + sprite.name;
		},
		algorithm: 'binary-tree',
		padding: 1
	}));
	var rewrites = [];

	spriteData.img
		// fingerprint
		.pipe(rev())

		// grab filename rewrites
		.pipe(through.obj(function(file, enc, callback) {
			if (file.path && file.revOrigPath)
			{
				var r = {
					from: relPath(file.revOrigBase, file.revOrigPath),
					to: relPath(file.base, file.path)
				};
				rewrites.push(r);
			}

			this.push(file);

			callback();
		}))

		// move to release directory
		.pipe(gulp.dest('library/images/sprites'))

		.on('end', function() {
			var cssPipe = spriteData.css;

			for (var i = 0; i < rewrites.length; ++i)
			{
				var r = rewrites[i];

				cssPipe = cssPipe
					// rename references to fingerprinted spritesheet
					.pipe(replace(r.from, r.to));
			}

			cssPipe
				// move to assets directory
				.pipe(gulp.dest('dev/scss/partials'));
		});
});

//browser-sync stuff
gulp.task('browserSync', function() {
	browserSync.init(null, {
		proxy: "tim.local/midwestv2/trunk/", 
		files: ["library/css/styles.min.css", "library/js/main.min.js", "*.php"]
	});
});

//cleanup time
gulp.task('clean', function() {
	return gulp.src(['library/css/*', 'library/js/*', 'library/images/*'], {read: false})
		.pipe(clean());
});

gulp.task('fingerprint', function () {
    return gulp.src([bbResponsive + '/dist/js/libraries.min.js', bbResponsive + '/dist/js/baublebar.min.js', bbResponsive + '/dist/css/main.min.css'], {base: bbResponsive + '/dist'})
        .pipe(gulp.dest(bbResponsive + '/dist'))
        .pipe(rev())
        .pipe(gulp.dest(bbResponsive + '/dist'))
        .pipe(rev.manifest())
        .pipe(gulp.dest(bbResponsive + '/dist'));
});

gulp.task('removeOldAssets', ['fingerprint'], function () {
    return gulp.src([bbResponsive + '/dist/js/baublebar.js', bbResponsive + '/dist/js/libraries.js', bbResponsive + '/dist/js/baublebar.min.js', bbResponsive + '/dist/js/libraries.min.js', bbResponsive + '/dist/css/main.min.css'], {read: false})
    		.pipe(clean());
});

gulp.task('deploy', ['removeOldAssets']);

//watch all the things
gulp.task('watch', function () {
	// Watch the css folder for change
	gulp.watch('dev/css/*.css', ['styles']);
	// Watch the js folder for changes
	gulp.watch('dev/js/*.js', ['scripts']);
	// Watch the img folder for changes
	gulp.watch('dev/images/*', ['images']);
});

gulp.task('default', ['browserSync','watch','scripts','images','styles']);
