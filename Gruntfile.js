/* global module */
/* global require */
'use strict';


module.exports = function(grunt)
{
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        concurrent : 
        {
            serve : [ 'shell', 'watch' ],
            options: {
                logConcurrentOutput: true
            }
        },
        concat: {
            js: {
                src: ['src/**/*.js'],
                dest: 'dist/fileuploader.js',
            },
            css: {
                src : ['css/**/*.css'],
                dest: 'dist/fileuploader.css',
            }
        },

        watch: {
            options : { livereload : true },
            js: {
                files: ['src/**/*.js'],
                tasks: ['concat:js']
            },
            css: {
                files: ['css/**/*.css'],
                tasks: ['concat:css']
            }
        },

        uglify: {
            my_target: {
                files: {
                    'dist/fileuploader.min.js': ['src/**/*.js']
                }
            }
        },

        shell: {
            options: {
                stderr: false
            },
            target: {
                command: 'cd sample && python server.py'
            }
        },

        express : {
            all : {
                options: {
                    port : 8888,
                    hostname : 'localhost',
                    bases : ['.'],
                    livereload : true
                }
            }
        },

        qunit : {
            all: ['tests/index.istanbul.html'],
            options: {
                coverage: {
                  src: ['dist/bodegas.js'],
                  instrumentedFiles: 'temp/',
                  htmlReport: 'report/coverage',
                  coberturaReport: 'report/',
                  linesThresholdPct: 20
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-serve');
    grunt.loadNpmTasks('grunt-express');

    grunt.registerTask('default', ['concat', 'uglify', 'concurrent:serve']);
    grunt.registerTask('build', ['concat', 'uglify', 'qunit']);
    grunt.registerTask('tests', ['express', 'watch']);
};