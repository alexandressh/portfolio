const gulp = require('gulp');
const sass = require('gulp-sass');
const browsersync = require("browser-sync").create();
const newer = require("gulp-newer");
const imagemin = require("gulp-imagemin");
const replace = require('gulp-replace');
const uglify = require('gulp-uglify');
const del = require('del');
const fs = require('fs');

var fileContent = fs.readFileSync("src/img/bighead.svg", "utf8");

function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./dist/"
    },
    port: 3000
  });
  done();
}

function compilaSass() {
  return gulp
    .src("src/scss/**/*.scss")
      .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
      .pipe(gulp.dest('./dist/css'))
      .pipe(browsersync.stream());
}

function compilaHtml() {
  return gulp
    .src('src/**/*.html')
      .pipe(replace('[>svgFile]', fileContent))
      .pipe(gulp.dest('./dist'))
      .pipe(browsersync.stream());
}

function compilaJavascript() {
  return gulp
    .src('src/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js'))
    .pipe(browsersync.stream());
}

function copiaImagens() {
  return gulp
    .src("./src/img/**/*")
    .pipe(newer("./dist/img"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest("./dist/img"));
}

function clean() {
  return del('./dist/');
}


function watchFiles() {
  gulp.watch('src/scss/**/*.scss', compilaSass);
  gulp.watch('src/**/*.html', compilaHtml);
  gulp.watch('src/js/**/*', compilaJavascript);
  gulp.watch('src/img/**/*', copiaImagens);
}


const build = gulp.series(clean, gulp.parallel(compilaHtml, compilaJavascript, compilaSass, copiaImagens))
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

exports.default = build;
exports.watch = watch;