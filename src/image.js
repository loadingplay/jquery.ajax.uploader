'use strict';

var LPImage = function(data)
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
    }

    this.thumbPercent = 0;
    this.percentComplete = 0;


    if (this.thumbnail !== '')
    {
        this.response_type = 'json';
    }

};

LPImage.prototype.loadThumb = function(callback) 
{
    var self = this;
    var reader = new FileReader();

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

    reader.readAsDataURL(this.file);
};

LPImage.prototype.generateBlob = function(b64Data, contentType, sliceSize) 
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

LPImage.prototype.upload = function(callback) 
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
                    var position = event.loaded || event.position;
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


LPImage.prototype.getThumbnailURI = function(resp) 
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