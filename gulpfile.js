const gulp = require('gulp');

const paths = require('./paths');

function clean() {

}

function build() {

}

function bundle() {

}

function publish() {

}

gulp.task('clean', clean);
gulp.task('build', gulp.series(['clean']), build);
gulp.task('bundle', gulp.series(['build']), bundle);
gulp.task('publish', gulp.series(['bundle']), publish);

gulp.task('default', 'build');