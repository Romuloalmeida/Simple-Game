const gulp = require("gulp");
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
var replace = require('gulp-replace');

const browserify = require("browserify");
const babelify = require("babelify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify");
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const del = require("del");
const htmlmin = require("gulp-htmlmin");
var browserSync = require('browser-sync').create();

const paths = {
    source: "./src",
    build: "./build"
};
 

function javascriptBuild() {
    return (
        browserify({
            entries: [`${paths.source}/scripts/main.js`],
            transform: [babelify.configure({ presets: ["@babel/preset-env"] })]
        })
            .bundle()
            .pipe(source("bundle.js"))
            // Turn it into a buffer!
            .pipe(buffer())
            // And uglify
            //.pipe(uglify())
            .pipe(gulp.dest(`${paths.build}/scripts`))
    );
}

function htmlBuild() {
    return gulp
        .src(`${paths.source}/*.html`)
        .pipe(htmlmin({ collapseWhitespace: true,removeComments:true,preserveLineBreaks:true }))
        .pipe(gulp.dest(paths.build));
}

function scssBuild() {
    return gulp
        .src(`${paths.source}/styles/**/*.scss`)
        .pipe(sourcemaps.init()) // initialize sourcemaps first
        .pipe(sass()) // compile SCSS to CSS
        .pipe(postcss([cssnano()]))
        .pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
        .pipe(gulp.dest(`${paths.build}/styles`));
}

function watchTask(){
    return gulp.watch([paths.source + '/scripts/**/*.js', paths.source + '/styles/**/*.css'],
        {interval: 1000, usePolling: true}, //Makes docker work
        gulp.series(
            gulp.parallel(scssBuild, javascriptBuild),
            cacheBustTask,
            htmlBuild
        )
    );    
}

function copyImages(){
    return gulp.src([`${paths.source}/images/**`]).pipe(gulp.dest(`${paths.build}/images`) );
}

function cleanup() {
    // Simply execute del with the build folder path
    return del([paths.build]);
}
 
function browser(){
    browserSync.init({
        server: {
           baseDir: "./build",
           index: "index.html"
        }
    });
}

// Cachebust
function cacheBustTask(){
    var cbString = new Date().getTime();
    return gulp.src([paths.build+'/index.html'])
        .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
        .pipe(gulp.dest(paths.build));
}



exports.default = gulp.series(cleanup,copyImages,htmlBuild,javascriptBuild,scssBuild, gulp.parallel(watchTask,browser));
