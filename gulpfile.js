var
/**
 * Dependencies.
 */
	gulp = require('gulp'),
	jscs = require('gulp-jscs'),
	stylish = require('gulp-jscs-stylish'),
	jshint = require('gulp-jshint'),
	browserify = require('browserify'),
	vinyl_source_stream = require('vinyl-source-stream'),
	path = require('path'),

	/**
	 * Constants.
	 */
	PKG = require('./package.json');


gulp.task('lint', function () {
	var src = ['gulpfile.js', 'index.js'];

	return gulp.src(src)
		.pipe(jshint('.jshintrc'))  // Enforce good practics.
		.pipe(jscs('.jscsrc'))  // Enforce style guide.
		.pipe(stylish.combineWithHintResults())
		.pipe(jshint.reporter('jshint-stylish', {verbose: true}))
		.pipe(jshint.reporter('fail'));
});


gulp.task('browserify', function () {
	return browserify([path.join(__dirname, PKG.main)], {
		standalone: PKG.title
	})
		.bundle()
		.pipe(vinyl_source_stream(PKG.name + '.js'))
		.pipe(gulp.dest('dist/'));
});


gulp.task('default', gulp.series('lint', 'browserify'));
