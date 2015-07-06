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
    grunt.initConfig({
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['concat', 'watch']);
};