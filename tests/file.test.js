/*global QUnit*/
/*global LPFile*/

'use strict';

var image;
var base64data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIW…AAOpgAABdvkl/FRgAAABJJREFUeNpi+P//PwAAAP//AwAF/gL+XhGkvgAAAABJRU5ErkJggg==';
var base64blobdata = 'data:text/plain;base64,aVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFFQUFBQUJDQUlBQUFDUWQxUGVBQUFBQ1hCSVcmQUFPcGdBQUJkdmtsL0ZSZ0FBQUJKSlJFRlVlTnBpK1AvL1B3QUFBUC8vQXdBRi9nTCtYaEdrdmdBQUFBQkpSVTVFcmtKZ2dnPT0=';


QUnit.module(
    'LPFile', 
    { 
        setup : function()
        {
            image = new LPFile();
        },
        teardown: function(){}
    });


if (!DISABLE_ASYNC)  // @todo: check why with istanbul is not working async test
{
    QUnit.test('loadThumb', function(assert)
    {
        var laoded = assert.async();
        var progress = assert.async();
        var callback = assert.async();

        image.file = image.generateBlob(base64data, 'text/plain', 512);
        image.onthumbloaded = function(data)
        {
            assert.equal(data, base64blobdata, 'get image encoded');
            laoded();
        };

        image.onthumbprogress = function(percentage)
        {
            assert.equal(percentage, 100, 'on thumb progress');
            progress();
        };
        image.loadThumb(function()
        {
            assert.ok(true, 'callback was called');
            callback();
        });
    });
}

QUnit.test('generateBlob', function(assert)
{
    var blob = image.generateBlob(base64data, 'text/plain', 512);

    assert.ok(blob instanceof Blob, 'return an istance of blob');
    assert.equal(blob.type, 'text/plain');
});

QUnit.test('getThumbnailURI', function(assert)
{
    // initialize
    assert.equal(typeof(image), 'object', 'instance was created');
    assert.equal(image.getThumbnailURI('url'), 'url', 'get thumbnail url from string');


    image.thumbnail = 'foo';
    image.response_type = 'json';

    assert.equal(image.getThumbnailURI({
        'foo' : 'this is foo',
        'bar' : 'this is bar'
    }), 'this is foo', 'get thumbnail from json object');


    assert.equal(image.getThumbnailURI('{\
        "foo" : "this is foo",\
        "bar" : "this is bar"\
    }'), 'this is foo', 'get thumbnail from json object, when  json is string');


});
