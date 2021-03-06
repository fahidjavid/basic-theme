/**
 * Gulp file setup
 */

    /*-----------------------------------------------------------------------------------*/
    /* Project configuration
    /*-----------------------------------------------------------------------------------*/
    var theme 		= 'basic-press', // Project name, used for build zip.
        url 		= 'basicpress.dev', // Local Development URL for BrowserSync. Change as-needed.
        build 		= './build-theme/', // Files that you want to package into a zip go here
        pluginName  = 'basic-press-framework',
        pluginDesti = './inc/plugins/',
        buildInclude 	= [

            // include common file types
            '**/*.php',
            '**/*.html',
            '**/*.css',
            '**/*.js',
            '**/*.svg',
            '**/*.ttf',
            '**/*.otf',
            '**/*.eot',
            '**/*.woff',
            '**/*.woff2',

            // include specific files and folders
            'screenshot.png',

            // exclude files and folders
            '!node_modules/**/*',
            '!img/raw/**/*'

        ];


    /*-----------------------------------------------------------------------------------*/
    /* Loading gulp plugins
    /*-----------------------------------------------------------------------------------*/
    var gulp = require('gulp'),
        sass = require('gulp-sass'),
        browserSync = require('browser-sync').create(),
        autoprefixer = require('gulp-autoprefixer'), // Autoprefixing magic
        notify       = require('gulp-notify'),
        plumber      = require('gulp-plumber'), // Helps prevent stream crashing on errors
        zip          = require('gulp-zip'), // Using to zip up our packaged theme into a tasty zip file that can be installed in WordPress!
        filter       = require('gulp-filter'),
        cmq          = require('gulp-combine-media-queries'),
        newer        = require('gulp-newer'),
        rimraf       = require('gulp-rimraf'), // Helps with removing files and directories in our run tasks
        imagemin     = require('gulp-imagemin'),
        cache        = require('gulp-cache');


    /*-----------------------------------------------------------------------------------*/
    /* Gulp tasks and processes
    /*-----------------------------------------------------------------------------------*/

    // Automate Process - Compiling Sass and Injecting PHP + CSS + JS through watch (live).
    gulp.task('default', function() {

        browserSync.init({
            proxy: url
        });

        gulp.watch('scss/**/*.scss', ['sass']);
        gulp.watch("**/*.php").on('change', browserSync.reload);
    });

    // Task - Browser Sync
    gulp.task('browser-sync', function() {
        browserSync.init({
            // Read here http://www.browsersync.io/docs/options/
            proxy: url,

            // port: 8080,

            // Tunnel the Browsersync server through a random Public URL
            // tunnel: true,

            // Attempt to use the URL "http://my-private-site.localtunnel.me"
            // tunnel: "ppress",

            // Inject CSS changes
            injectChanges: true
        });
    });

    // Task - Compiling Sass + Injecting CSS
    gulp.task('sass', function () {
        gulp.src('scss/**/*.scss')
            .pipe(sass({
                errLogToConsole: true,

                //outputStyle: 'compressed',
                // outputStyle: 'compact',
                // outputStyle: 'nested',
                outputStyle: 'expanded',
                precision: 10
            }))
            .pipe(plumber())
            .pipe(autoprefixer('last 2 version', '> 1%', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
            .pipe(plumber.stop())
            .pipe(filter('**/*.css')) // Filtering stream to only css files
            // .pipe(cmq()) // Combines Media Queries
            .pipe(gulp.dest('css'))
            .pipe(browserSync.stream())
            .pipe(notify({ message: 'Styles task complete', onLast: true }));
    });

    // Task - Image optimization
    gulp.task('images', function() {

    // Add the newer pipe to pass through newer images only
        return 	gulp.src(['img/raw/**/*.{png,jpg,gif}'])
            .pipe(newer('img/'))
            .pipe(rimraf({ force: true }))
            .pipe(imagemin({ optimizationLevel: 7, progressive: true, interlaced: true }))
            .pipe(gulp.dest('img/'))
            .pipe( notify( { message: 'Images task complete', onLast: true } ) );
    });

    // Build Plugin Zip
    gulp.task('plugin-zip', function () {
        return gulp.src( [

            // Include
            '../../plugins/'+ pluginName +'/**/*',

            // Exclude
            '!../../plugins/'+ pluginName +'/**/.DS_Store',
        ] )
            .pipe ( zip ( pluginName +'.zip' ) )
            .pipe ( gulp.dest ( pluginDesti ) )
            .pipe ( notify ( { message : 'Plugin Zip is created.', onLast : true } ) );
    });

    // Build Theme Zip
    gulp.task('theme-zip', function () {
        return gulp.src( [
            // Include
            './**/*',

            // Exclude
            '!./prepros.cfg',
            '!./**/.DS_Store',
            '!./less/**',
            '!./less',
            '!./node_modules/**',
            '!./node_modules',
            '!./package.json',
            '!./gulpfile.js',
            '!./img/raw/**',
            '!./img/raw'
        ])
            .pipe ( zip ( theme + '.zip' ) )
            .pipe ( gulp.dest ( '../' ) )
            .pipe ( notify ( {
                message : 'Theme zip is ready.',
                onLast : true
            } ) );
    });

    // Task - Clean gulp cache
    gulp.task('clear', function () {
        cache.clearAll();
    });