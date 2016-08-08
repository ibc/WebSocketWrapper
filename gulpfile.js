var gulp = require('gulp');
var eslint = require('gulp-eslint');

gulp.task('lint', function()
{
	var src = ['gulpfile.js', 'index.js'];

	return gulp.src(src)
		.pipe(eslint(
			{
				plugins : [ ],
				extends : [ 'eslint:recommended' ],
				settings : {},
				parserOptions :
				{
					sourceType : 'module'
				},
				env :
				{
					browser  : true,
					node     : true,
					commonjs : true
				},
				rules :
				{
					'no-console'     : 0,
					'no-empty'       : 0,
					'no-unused-vars' : 1,
					'quotes'         : [ 2, 'single', 'avoid-escape' ]
				}
			}))
		.pipe(eslint.format());
});

gulp.task('default', gulp.series('lint'));
