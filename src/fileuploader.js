/*global FileUploaderView: true*/
/*global LPImage: true*/
/*global Waterfall: true*/
'use strict';

/**
 * controller for a simple image uploader
 * @param {Object} obj     DOM input that will be replaced
 * @param {JSON} options   list of configurations and callbacks
 */
var FileUploader = function(obj, options)
{
    this.$obj = $(obj);
    this.options = options;
    this.waterfall = new Waterfall();

    this.model = [];
    this.preloadImages(options.images);

    this.view = new FileUploaderView(this);
    this.view.init();
};

/**
 * preload image
 *
 * instantiate an xhr in order to retrieve image data from remote server
 * this method is used to add previously added images.
 * @param {Int} index indicates position of selected images
 * @param {LPImage} image @see : LPImage
 */
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


/**
 * preload a list of images
 *
 * iterates over each image in order to preload a thumb in each one 
 * this method is used to add previously added images.
 * @see FileUploader.addImagePreloading 
 * 
 */
FileUploader.prototype.preloadImages = function(images) 
{
    for (var i = 0; i < images.length; i++) 
    {
        var image = images[i];
        this.addImagePreloading(i, image);
    }
};

/**
 * add new image to model
 *
 * adds an LPImage object to the list of images to upload
 * @param {File} file contains info of the image retrieved from input 
 *
 * @return {LPImage} image from model
 */
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

/**
 * detect if a given text correspond to an image name
 * @param  {String}  name name of image
 * @return {Boolean}      true if the image extensions is jpg or png
 *                        false if any other
 */
FileUploader.prototype.isImage = function(name) 
{
    if (name.toLowerCase().indexOf('.jpg') != -1 ||
        name.toLowerCase().indexOf('.png') != -1)
    {
        return true;
    }

    return false;
};

/**
 * return list of LPImage 
 * @return {Array} list of added images
 */
FileUploader.prototype.getImageList = function() 
{
    return this.model;
};

/**
 * return the currently used <input type="file" /> from dom
 * @return {object} DOM object that is clicked when you want to add images
 */
FileUploader.prototype.getInput = function() 
{
    return this.$obj;
};

/**
 * detect if all images are already uploaded
 * @return {Boolean} true if all images were uploaded
 *                   false if some image is still waiting to be uploaded
 */
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

/**
 * return base_url given in @see: options
 * @return {String} options.base_url
 */
FileUploader.prototype.getBaseURL = function() 
{
    return this.options.base_url;
};

/**
 * return a list of uploaded images URL.
 * @return {Array} images uploaded
 */
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