var
	gulp = require('gulp'),
	jscs = require('gulp-jscs'),
	stylish = require('gulp-jscs-stylish'),
	jshint = require('gulp-jshint');


gulp.task('lint', function () {
	var src = ['gulpfile.js', 'index.js'];

	return gulp.src(src)
		.pipe(jshint('.jshintrc'))  // Enforce good practics.
		.pipe(jscs('.jscsrc'))  // Enforce style guide.
		.pipe(stylish.combineWithHintResults())
		.pipe(jshint.reporter('jshint-stylish', {verbose: true}))
		.pipe(jshint.reporter('fail'));
});


gulp.task('default', gulp.series('lint'));
