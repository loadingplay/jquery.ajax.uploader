/*global QUnit*/
/*global FileUploader*/


QUnit.module('JQuery bugs', {});

QUnit.test('test change type forbiden', function(assert)
{
    var done = assert.async();
    $(".html-test").load("html/basic.html", function()
    {

        var view = new FileUploaderView({
            options : {
                sortable : false,
                templates : {
                    list_container_template : ''
                }
            },
            getInput : function(){
                return $('input[name=file]');
            }
        });

        view.init();
        assert.ok(true, "passed the last init without exception for type change");
        done();
    });
});
