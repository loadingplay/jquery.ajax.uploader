// module.exports = function(grunt)
// {
//     grunt.registerTask('speak', function()
//         {
//             console.log("im speaking");
//         });

//     grunt.registerTask('yell', function()
//         {
//             console.log("im yelling");
//         });

//     grunt.registerTask('default', ['speak', 'yell']);
// };

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
            js: {
                files: ['src/**/*.js'],
                tasks: ['concat']
            },
            css: {
                files: ['css/**/*.css'],
                tasks: ['concat']
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
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-serve');

    grunt.registerTask('default', ['concat', 'uglify', 'concurrent:serve']);
};