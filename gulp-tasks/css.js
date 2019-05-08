const gulp = require('gulp')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const Fiber = require('fibers')
const magicImporter = require('node-sass-magic-importer')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const gapProperties = require('postcss-gap-properties')
const csswring = require('csswring')
const { isDev } = require('../config/flag')
const { destAssetsDir } = require('../config/path')

const sassImporters = [magicImporter()]

const postcssPlugins = [
  autoprefixer({
    cascade: false,
    grid: 'autoplace',
  }),
  gapProperties({ preserve: false }),
  !isDev && csswring(),
].filter(Boolean)

let isWatchMode = false

const css = () => {
  sass.compiler = require('sass')
  const sassStream = sass({
    importer: sassImporters,
    fiber: Fiber,
  })

  if (isWatchMode) {
    sassStream.on('error', sass.logError)
  }

  return gulp
    .src(['source/css/*.scss', '!source/css/_*.scss'], { sourcemaps: isDev })
    .pipe(rename({ suffix: '.bundle' }))
    .pipe(sassStream)
    .pipe(postcss(postcssPlugins))
    .pipe(gulp.dest(destAssetsDir, { sourcemaps: isDev && '.' }))
}

css.enableWatchMode = () => {
  isWatchMode = true
}

module.exports = css
