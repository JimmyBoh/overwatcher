const spawn = require('child_process').spawn;
const del = require('del');
const gulp = require('gulp');
const zip = require('gulp-zip');
const lambda = require('gulp-awslambda');

const paths = require('./paths');

const ZIP_NAME = 'overwatcher.zip';

function run(cmd, args) {
    return new Promise((resolve, reject) => {
        const childProc = spawn(cmd, args || [], {
            cwd: paths.root(),
            stdio: 'inherit'
        });

        childProc.on('close', (code) => {
            if (code) reject(`Command '${cmd}' failed with error code ${code}!`);
            else resolve(code);
        });

        childProc.on('error', err => {
            reject(err);
        });
    });
}

function clean() {
    return del([paths.dist('*')]);
}

function compile() {
    return run(paths.node_modules('.bin\\tsc.cmd'));
}

function test() {
    return run('node', [paths.dist('test.js')]);
}

function bundle() {
    return gulp
        .src(['package.json', 'package-lock.json', 'dist/**', 'node_modules'])
        .pipe(zip(ZIP_NAME))
        .pipe(gulp.dest(paths.root('.')));
}

function publish() {
    return gulp
        .src(paths.root(ZIP_NAME))
        .pipe(lambda('overwatcher'));
}

gulp.task('clean', gulp.series(clean));
gulp.task('build', gulp.series([clean, compile]));
gulp.task('test', gulp.series([clean, compile, test]));
gulp.task('bundle', gulp.series([clean, compile, bundle]));
gulp.task('publish', gulp.series([clean, compile, bundle, publish]));

gulp.task('default', gulp.series('build'));