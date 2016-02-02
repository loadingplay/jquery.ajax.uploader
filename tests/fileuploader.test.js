/*global QUnit*/
/*global FileUploader*/


QUnit.module('FileUploader', {});

QUnit.test('isPDF', function(assert)
{

    var $div = $('<div></div>');

    assert.ok(LPFile.isPDF('foo.pdf'));
    assert.ok(LPFile.isPDF('foo.PDF'));

    // isAccepted file
    assert.ok(LPFile.isAcceptedFile('foo.png'));
    assert.ok(LPFile.isAcceptedFile('foo.jpg'));
    assert.ok(LPFile.isAcceptedFile('foo.pdf'));
    assert.notOk(LPFile.isAcceptedFile('foo.txt'));
});
