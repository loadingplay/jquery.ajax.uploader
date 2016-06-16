'use strict';

var LPFile = function(data)
{
    this.name = '';
    this.size = '';
    this.file = '';

    this.data = '';
    this.value = '';
    this.url = '';

    // events

    this.onthumbprogress = $.noop;
    this.onprogress = $.noop;
    this.onupdateurl = $.noop;
    this.uploadurl = '/';
    this.onthumbloaded = $.noop;
    this.response_type = 'string';
    this.thumbnail = '';
    this.uploaded = false;
    this.is_pdf = false;
    this.is_doc = false;

    if (data !== undefined)
    {
        this.file = data.file !== undefined ? data.file : '';
        if (typeof(this.file) === 'object')
        {
            this.name = this.file.name !== undefined ? this.file.name : '';
            this.size = this.file.size !== undefined ? this.file.size : '';
        }

        this.onthumbprogress = data.onthumbprogress === undefined ? $.noop : data.onthumbprogress;
        this.onprogress = data.onprogress === undefined ? $.noop : data.onprogress;
        this.onupdateurl = data.onupdateurl === undefined ? $.noop : data.onupdateurl;
        this.uploadurl = data.uploadurl === undefined ? '/' : data.uploadurl;
        this.onthumbloaded = data.onthumbloaded === undefined ? $.noop : data.onthumbloaded;
        this.response_type = data.response_type === undefined ? 'string' : data.response_type;
        this.thumbnail = data.thumbnail === undefined ? 'thumbnail' : data.thumbnail;
        this.uploaded = data.uploaded === undefined ? false : data.uploaded;

        // console.log(data.support_pdf);
        this.is_pdf = LPFile.isPDF(this.name);
        this.is_doc = LPFile.isDOC(this.name);
    }

    this.thumbPercent = 0;
    this.percentComplete = 0;


    if (this.thumbnail !== '')
    {
        this.response_type = 'json';
    }

};

LPFile.prototype.loadThumb = function(callback) 
{
    var self = this;
    var reader = new FileReader();
    var image = this.file;

    reader.onload = function(e) 
    {
        self.data = e.target.result;
        self.onthumbloaded(self.data);

        setTimeout(function()
        {
            callback();
        }, 100);
    };

    reader.onprogress = function(data)
    {
        if (data.lengthComputable)
        {
            self.thumbPercent = parseInt((data.loaded / data.total) * 100);
            self.onthumbprogress(self.thumbPercent);
            return;
        }

        self.thumbPercent = 100;
    };

    reader.readAsDataURL(image);
};

LPFile.prototype.generateBlob = function(b64Data, contentType, sliceSize) 
{
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = b64Data; // atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
};

LPFile.prototype.upload = function(callback) 
{
    var self = this;
    var data = new FormData();
    data.append('name', this.name);
    data.append('size', this.size);
    data.append('data', this.generateBlob(this.data, 'text/plain', 512));

    $.ajax({
        contentType: false,
        processData: false,
        cache: false,
        url : self.uploadurl,
        type: 'POST',
        xhr : function()
        {
            var xhr = $.ajaxSettings.xhr();

            if (xhr.upload) 
            {
                xhr.upload.addEventListener('progress', function(event) 
                {
                    var position = event.loaded || event.position;
                    self.percentComplete = Math.ceil(position/event.total * 100);
                    self.onprogress(self.percentComplete);
                }, false);
            }
            return xhr;
        },
        beforeSend : function(xhr, o)
        {
            o.data = data;
        }
    })
    .done(function(resp)
    {
        self.value = resp;
        self.onupdateurl(self.getThumbnailURI(resp));
        callback();
    });

};


LPFile.prototype.getThumbnailURI = function(resp) 
{
    if (this.response_type === 'string')
    {
        this.url = resp;
        return resp;
    }
    else
    {
        if (typeof(resp) !== 'object')
        {
            resp = $.parseJSON(resp);
        }
        else
        {
            this.value = JSON.stringify(resp);
        }
        this.url = resp[this.thumbnail];
        return resp[this.thumbnail];
    }
};

LPFile.prototype.getPDFThumbnail = function() 
{
    return "https://84static.loadingplay.com/static/images/200_63e0df68422fbcd4404f9b6efebdb3fc_1454400396_pdfs.png";
};

LPFile.prototype.getDOCThumbnail = function() 
{
    return "https://84static.loadingplay.com/static/images/200_ffeb16b005f724fa55b75549ffd0306f_docicon.png";
};


/**
 * detect if a given text correspond to an image name
 * @param  {String}  name name of image
 * @return {Boolean}      true if the image extensions is jpg or png
 *                        false if any other
 */
LPFile.isImage = function(name) 
{
    return (name.toLowerCase().indexOf('.jpg') !== -1 ||
        name.toLowerCase().indexOf('.png') !== -1);
};

/**
 * detect if a file is pdf
 * @param  {Sting}  name file name with extension included
 * @return {Boolean}      True if the file ends with .pdf or .PDF
 */
LPFile.isPDF = function(name) 
{
    return name.toLowerCase().indexOf('.pdf') !== -1
};

/**
 * detect if a file is pdf
 * @param  {Sting}  name file name with extension included
 * @return {Boolean}      True if the file ends with .pdf or .PDF
 */
LPFile.isDOC = function(name) 
{
    return (name.toLowerCase().indexOf('.doc') !== -1);
};

/**
 * detect if a file name is allowed to upload
 * @param  {String}  name file name with extension included
 * @return {Boolean}      true if file is pdf, jpg or png
 */
LPFile.isAcceptedFile = function(name) 
{
    return (LPFile.isImage(name) || LPFile.isPDF(name) || LPFile.isDOC(name));
};
