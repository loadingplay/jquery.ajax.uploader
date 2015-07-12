'use strict';


// var LPImageUploadPool = function()
// {
//     this.images = [];
//     this.uploaded_images = [];
//     this.uploading = false;
// };


// LPImageUploadPool.prototype.addImage = function(image) 
// {
//     if (this.uploaded_images.indexOf(image) !== -1)
//     {
//         this.images.append(image);
//     }

//     if (!this.uploading)
//     {
//         this.processUpload();
//     }
// };


// LPImageUploadPool.prototype.processUpload = function() 
// {
//     if (this.images.length > 0)
//     {
//         var img = 
//     }
// };



var Waterfall = function()
{
    this.images = [];
    this.upload_images = [];
    this.is_loading = false;
    this.is_uploading = false;
};

Waterfall.prototype.appendImage = function(image) 
{
    this.images.push(image);
    this.loadThumbs();
};

Waterfall.prototype.loadThumbs = function() 
{
    if (this.is_loading)
        return;

    var self = this;

    if (this.images.length > 0)
    {
        var image = this.images.shift();

        this.is_loading = true;
        image.loadThumb(function()
        {
            self.is_loading = false;
            self.loadThumbs();
            self.upload_images.push(image);

            self.uploadImages();
        });

        return;
    }

    this.is_loading = false;
};

Waterfall.prototype.uploadImages = function() 
{
    if (this.is_uploading)
        return;

    var self = this;

    if (this.upload_images.length > 0)
    {
        var image = this.upload_images.shift();

        this.is_uploading = true;
        image.upload(function()
        {
            self.is_uploading = false;
            self.uploadImages();
        });

        return;
    }

    this.is_uploading = false;
};


var LPImage = function(data)
{
    this.name = data.file.name === undefined ? '' : data.file.name;
    this.size = data.file.size === undefined ? '' : data.file.size;
    this.file = data.file;
    this.data = '';
    this.value = '';
    this.url = '';

    // events
    this.onthumbprogress = data.onthumbprogress === undefined ? $.noop() : data.onthumbprogress;
    this.onprogress = data.onprogress === undefined ? $.noop() : data.onprogress;
    this.onupdateurl = data.onupdateurl === undefined ? $.noop() : data.onupdateurl;
    this.uploadurl = data.uploadurl === undefined ? '/' : data.uploadurl;
    this.onthumbloaded = data.onthumbloaded === undefined ? $.noop() : data.onthumbloaded;
    this.response_type = data.response_type === undefined ? 'string' : data.response_type;
    this.thumbnail = data.thumbnail === undefined ? 'thumbnail' : data.thumbnail;

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
    var data = new FormData();
    data.append('name', this.name);
    data.append('size', this.size);
    data.append('data', generateBlob(this.data, 'text/plain', 32));

    var self = this;

    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4){
            try {
                var resp = request.response;
                self.value = request.response;

                if (self.response_type === 'string')
                {
                    self.url = resp;
                    self.onupdateurl(resp);
                }
                else
                {
                    resp = $.parseJSON(request.response);
                    self.url = resp[self.thumbnail];
                    self.onupdateurl(resp[self.thumbnail]);
                }

                callback();
            } 
            catch (e)
            {
                // nothing here
            }
        }
    };

    request.upload.addEventListener('progress', function(e)
    {
        var position = e.loaded || e.position;
        self.percentComplete = Math.ceil(position/e.total) * 100;
        self.onprogress(self.percentComplete);
    }, false);


    request.open('POST', self.uploadurl);
    request.send(data);

};