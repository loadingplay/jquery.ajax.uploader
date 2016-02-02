/*global QUnit*/
/*global Waterfall*/
/*global LPFile*/

'use strict';

var base64data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIW…AAOpgAABdvkl/FRgAAABJJREFUeNpi+P//PwAAAP//AwAF/gL+XhGkvgAAAABJRU5ErkJggg==';
var waterfall;

QUnit.module(
    'Waterfall', 
    {
        setup: function()
        {
            waterfall = new Waterfall();
        }
    });


QUnit.test('clearImages', function(assert)
{
    assert.ok(waterfall instanceof Waterfall, 'is intance');

    waterfall.images.push({ 'foo' : 'foo' });
    waterfall.clearImages();

    assert.deepEqual(waterfall.images, [], 'image list is empty');
});

QUnit.test('appendImage', function(assert)
{
    // LPFile instance shold be added
    var image = new LPFile();
    image.uploaded = false; // image uploaded flag must be set to true
    image.file = image.generateBlob(base64data, 'text/plain', 512);

    assert.ok(waterfall.appendImage(image), 'and instance of LPFile addedd');

    waterfall.clearImages();

    // should accept only instances of LPFile
    waterfall.appendImage({'foo' : 'foo'});

    assert.equal(waterfall.images.length, 0, 'no LPFile instance can\'t be added');
});
