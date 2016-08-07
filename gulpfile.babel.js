'use strict';

// TODO: gulp-jshint, gulp-jscs

import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import clean from 'gulp-clean';
import gulp from 'gulp';
import livereload from 'gulp-livereload';
import open from 'gulp-open';
import path from 'path';
import runSequence from 'run-sequence';
import sass from 'gulp-sass';
import serve from 'gulp-serve';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import watch from 'gulp-watch';

const folders = {
    src: path.join(__dirname, 'src'),
    dist: path.join(__dirname, 'dist')
};

const config = {
    sass: {
        src: path.join(folders.src, 'scss', 'drawer.scss'),
        dist: path.join(folders.dist, 'css'),
        watch: path.join(folders.src, 'scss', '**', '*.scss')
    },
    js: {
        src: path.join(folders.src, 'js', '**', '*.js'),
        dist: path.join(folders.dist, 'js'),
        watch: path.join(folders.src, 'js', '**', '*.js')
    },
    html: {
        src: path.join(folders.src, '**', '*.html'),
        dist: path.join(folders.dist),
        watch: path.join(folders.src, '**', '*.html')
    }
};

/**
 * build js
 */
gulp.task('js:dev', () => {
    return gulp.src(config.js.src)
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('drawer.min.js'))
        .pipe(gulp.dest(config.js.dist))
        .pipe(livereload());
});

gulp.task('js:prod', () => {
    return gulp.src(config.js.src)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('drawer.min.js'))
        .pipe(uglify({mangle: false}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.js.dist));
});


/**
 * build css
 */
gulp.task('sass:dev', () => {
    return gulp.src(config.sass.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest(config.sass.dist))
        .pipe(livereload());
});

gulp.task('sass:prod', () => {
    return gulp.src(config.sass.src)
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.sass.dist));
});

gulp.task('htmlCopy', () => {
    return gulp.src(config.html.src)
        .pipe(gulp.dest(config.html.dist))
        .pipe(livereload());
});

gulp.task('serve', serve({
    root: [folders.dist],
    port: 4001
}));

gulp.task('open', () => {
    gulp.src(__filename)
        .pipe(open({uri: 'http://localhost:4001/drawer.html'}));
});

gulp.task('watch', () => {
    livereload.listen({
        port: 35729
    });

    gulp.watch(config.sass.watch, ['sass:dev']);
    gulp.watch(config.js.watch, ['js:dev']);
    gulp.watch(config.html.src, ['htmlCopy']);
});


/**
 * clean task
 */
gulp.task('clean', () => {
    return gulp.src(folders.dist, {read: false})
        .pipe(clean({force: true}))
});


/**
 * test
 */
gulp.task('test', () => {
    return gulp
        .src('test/runner.html')
        .pipe(mochaPhantomJS());
});

gulp.task('build', ['clean'], () => {
    gulp.start('js:prod', 'sass:prod', 'htmlCopy');
});

gulp.task('default', (callback) => {
    runSequence('build', ['watch', 'serve', 'open'], callback);
});
