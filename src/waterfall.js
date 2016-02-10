/*global LPFile*/
'use strict';


var Waterfall = function()
{
    this.images = [];
    this.upload_images = [];
    this.is_loading = false;
    this.is_uploading = false;
    this.uploading_counter = 0;
    this.onready = $.noop;
};

Waterfall.prototype.clearImages = function() 
{
    this.images = [];
};

Waterfall.prototype.appendImage = function(image) 
{
    if (!(image instanceof LPFile)) return false;

    if (!image.uploaded)
    {
        this.images.push(image);
        this.loadThumbs();

        return true;
    }

    return false;
};

Waterfall.prototype.loadThumbs = function() 
{
    if (this.is_loading)
        return;

    var self = this;

    if (this.images.length > 0)
    {
        var image = this.images.shift();

        if (!image.uploaded)
        {
            this.is_loading = true;
            image.loadThumb(function()
            {
                self.is_loading = false;
                self.loadThumbs();
                self.upload_images.push(image);

                self.uploadImages();
            });
        }

        return;
    }
    else
    {
        this.onready();
    }

    this.is_loading = false;
};

Waterfall.prototype.uploadImages = function() 
{
    if (this.is_uploading && this.uploading_counter >= 3)
        return;

    var self = this;

    if (this.upload_images.length > 0)
    {
        var image = this.upload_images.shift();

        this.is_uploading = true;
        this.uploading_counter += 1;
        image.upload(function()
        {
            self.uploading_counter -= 1;
            self.is_uploading = false;
            self.uploadImages();
        });

        return;
    }

    this.uploading_counter -= 1;
    this.is_uploading = false;
};
