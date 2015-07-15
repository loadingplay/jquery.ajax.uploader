/*global FileUploaderView: true*/
/*global LPImage: true*/
/*global Waterfall: true*/
'use strict';

var FileUploader = function(obj, options)
{
    this.$obj = $(obj);
    this.options = options;
    this.waterfall = new Waterfall();

    this.model = [];
    this.preloadImages();

    this.view = new FileUploaderView(this);
    this.view.init();
};

FileUploader.prototype.addImagePreloading = function(index, image) 
{
    var blob = null;
    var xhr = new XMLHttpRequest(); 
    var self = this;
    var img = null;
    xhr.open('GET', self.options.base_url + image.src); 
    xhr.responseType = 'blob';//force the HTTP response, response-type header to be blob
    xhr.onload = function(e) 
    {
        blob = xhr.response;//xhr.response is now a blob object
        blob.name = image.name;

        img = self.addImage(blob);

        img.data = e.target.result;
        img.value = image.value;
        img.url = image.src;

        self.view.showThumb(index, img.value);
        self.view.updateurl();
    };

    xhr.send();
};

FileUploader.prototype.preloadImages = function() 
{
    for (var i = 0; i < this.options.images.length; i++) 
    {
        var image = this.options.images[i];
        this.addImagePreloading(i, image);
    }
};

FileUploader.prototype.addImage = function(file) 
{
    var self = this;

    if (this.isImage(file.name))
    {
        var img = new LPImage({
            file : file,
            uploadurl : this.options.uploadurl,
            response_type : this.options.response_type,
            thumbnail : this.options.thumbnail,
            onprogress : function(percent)
            {
                self.view.updateUploadProgress(self.model.indexOf(img), percent);
            },
            onthumbprogress : function(percent)
            {
                self.view.updateThumbProgress(self.model.indexOf(img), percent);
            },
            onthumbloaded : function()
            {
                self.view.imageDataLoaded(self.model.indexOf(img));
            },
            onupdateurl : function(url)
            {
                self.view.updateurl(self.model.indexOf(img), url);
                if (self.options.thumbnail_origin === 'local')
                {
                    self.view.showThumb(self.model.indexOf(img), img.data);
                }
                else
                {
                    self.view.showThumb(self.model.indexOf(img), url);
                }
            },
        });

        if (!this.options.multi)
        {
            this.model = [];
            this.waterfall.clearImages();
        }

        this.model.push(img);
        this.waterfall.appendImage(img);

        this.view.addImage(img);
        return img;
    }
};

FileUploader.prototype.isImage = function(name) 
{
    if (name.toLowerCase().indexOf('.jpg') != -1 ||
        name.toLowerCase().indexOf('.png') != -1)
    {
        return true;
    }

    return false;
};

FileUploader.prototype.getImageList = function() 
{
    return this.model;
};


FileUploader.prototype.getInput = function() 
{
    return this.$obj;
};

FileUploader.prototype.isready = function() 
{
    for (var i = 0; i < this.model.length; i++) 
    {
        var uploaded = (this.model[i].percentComplete == 100);
        if (!uploaded)
        {
            return false;
        }
    }

    return true;
};

FileUploader.prototype.getBaseURL = function() 
{
    return this.options.base_url;
};

FileUploader.prototype.getImagesData = function() 
{
    var urls = [];
    for (var i = 0; i < this.model.length; i++) 
    {
        var image = this.model[i];
        if (image.value !== '')
        {
            urls.push(image.value);
        }
    }

    return urls;
};