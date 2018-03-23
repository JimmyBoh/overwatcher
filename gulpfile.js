const spawn = require('child_process').spawn;
const del = require('del');
const merge = require('merge-stream');
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

function delFiles() {
    return del([paths.dist('*')]);
}

function compileTs() {
    return run(paths.node_modules('.bin\\tsc.cmd'));
}

function runTestFile() {
    return run('node', [paths.dist('test.js')]);
}

function createZip() {
    const correctFiles = gulp.src([paths.root('package*.json'), paths.node_modules('**/*')], { dot: true, nodir: true, base: paths.root() });
    const filesToMove = gulp.src([paths.dist('*')], { nodir: true });

    return merge(correctFiles, filesToMove)
        .pipe(zip(ZIP_NAME))
        .pipe(gulp.dest(paths.root('.')));
}

function upload() {
    return gulp
        .src(paths.root(ZIP_NAME))
        .pipe(lambda('overwatcher'));
}

function watch() {
    // watch path must be relative...
    return gulp.watch('src/*.ts', gulp.parallel(['publish']));
}

gulp.task('clean', gulp.series([delFiles]));
gulp.task('build', gulp.series([delFiles, compileTs]));
gulp.task('test', gulp.series([delFiles, compileTs, runTestFile]));
gulp.task('bundle', gulp.series([delFiles, compileTs, createZip]));
gulp.task('publish', gulp.series([delFiles, compileTs, createZip, upload]));

gulp.task('watch', gulp.series([watch]));

gulp.task('default', gulp.series(['build']));