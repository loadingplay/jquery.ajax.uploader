/*global FileUploaderView: true*/
/*global LPImage: true*/
'use strict';

var FileUploader = function(obj, options)
{
    this.$obj = $(obj);
    this.options = options;

    this.model = [];

    this.view = new FileUploaderView(this);
    this.view.init();
};

FileUploader.prototype.addImage = function(file) 
{
    var self = this;

    if (this.isImage(file.name))
    {
        var img = new LPImage({
            file : file,
            uploadurl : this.options.uploadurl,
            onprogress : function(percent)
            {
                self.view.updateUploadProgress(self.model.indexOf(img), percent);
            },
            onthumbprogress : function(percent)
            {
                self.view.updateThumbProgress(self.model.indexOf(img), percent);
            },
            onthumbloaded : function(data)
            {
                self.view.showThumb(
                    self.model.indexOf(img), 
                    data, 
                    function()
                    {
                        img.upload();
                    });
            },
            onupdateurl : function()
            {
                self.view.updateurl();
            },
        });

        this.model.push(img);
        img.loadThumb();

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

FileUploader.prototype.getImagesURL = function() 
{
    var urls = [];
    for (var i = 0; i < this.model.length; i++) 
    {
        var image = this.model[i];
        if (image.url !== '')
        {
            urls.push(image.url);
        }
    }

    return urls;
};