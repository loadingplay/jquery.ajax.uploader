/*global QUnit*/
/*global FileUploader*/


QUnit.module('FileUploader', {});

QUnit.test('isCSV', function(assert) 
{
    var $div = $('<div></div>');

    assert.ok(LPFile.isCSV('foo.csv'));
    assert.ok(LPFile.isCSV('foo.CSV'));

    // isAccepted file
    assert.ok(LPFile.isAcceptedFile('foo.png'));
    assert.ok(LPFile.isAcceptedFile('foo.jpg'));
    assert.ok(LPFile.isAcceptedFile('foo.pdf'));
    assert.ok(LPFile.isAcceptedFile('foo.csv'));
    assert.notOk(LPFile.isAcceptedFile('foo.txt'));
});

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

QUnit.test('isDOC', function(assert)
{
    var $div = $('<div></div>');

    assert.ok(LPFile.isDOC('foo.doc'));
    assert.ok(LPFile.isDOC('foo.DOC'));
    assert.ok(LPFile.isDOC('foo.docx'));
    assert.ok(LPFile.isDOC('foo.DOCX'));

    // isAccepted file
    assert.ok(LPFile.isAcceptedFile('foo.png'));
    assert.ok(LPFile.isAcceptedFile('foo.jpg'));
    assert.ok(LPFile.isAcceptedFile('foo.pdf'));
    assert.ok(LPFile.isAcceptedFile('foo.doc'));
    assert.ok(LPFile.isAcceptedFile('foo.docx'));
    assert.notOk(LPFile.isAcceptedFile('foo.txt'));
});
