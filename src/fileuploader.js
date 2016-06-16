/*global FileUploaderView: true*/
/*global LPFile: true*/
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
    this.waterfall.onready = function()
    {
        setTimeout(function() {
            options.onready();
        }, 500);
    };

    this.model = [];

    this.view = new FileUploaderView(this);
    this.view.init();

    this.preloadImages(options.images);
};

FileUploader.prototype.applySort = function(new_order) 
{
    var new_model = [];

    for (var i in new_order)
    {
        // console.log(new_order[i]);
        new_model.push(this.model[new_order[i]]);
    }

    this.model = new_model;
};

/**
 * preload image
 *
 * instantiate an xhr in order to retrieve image data from remote server
 * this method is used to add previously added images.
 * @param {Int} index indicates position of selected images
 * @param {LPFile} image @see : LPFile
 */
FileUploader.prototype.addImagePreloading = function(index, image) 
{
    var self = this;
    var img = null;
    var blob_image = new Blob();
    blob_image.name = image.name;

    img = self.addImage(blob_image, true);

    // check if image is not accepted
    if (img === undefined)
    {
        return;
    }

    // img.data = e.target.result;
    img.value = image.value;
    img.url = image.src;
    img.percentComplete = 100;

    if (img.is_pdf)
    {
        self.view.showThumb(index, img.getPDFThumbnail());
    }
    else if (img.is_doc)
    {
        self.view.showThumb(index, img.getDOCThumbnail());
    }
    else
    {

        if (self.options.thumbnail_origin == 'local')
        {
            self.view.showThumb(index, img.value);
        }
        else
        {
            var image_src = img.value;
            if (self.options.thumbnail !== '')
            {
                if (typeof(img.value) !== 'object')
                {
                    img.value = $.parseJSON(img.value);
                }

                image_src = img.value[self.options.thumbnail];
            }

            self.view.showThumb(index, image_src);
        }
    }
    self.view.updateurl();
    // };

    // xhr.send();
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
    this.options.onready();
};


/**
 * check if file is a valid format for the user
 * @param  {String}  file_name the file name
 * @return {Boolean}           true if the file extension is in options.
 */
FileUploader.prototype.isValidFile = function(file_name) 
{
    var splitted_name = file_name.split(".");
    var extension = splitted_name[splitted_name.length-1];

    return this.options.files_supported.indexOf(extension) !== -1;
};

/**
 * add new image to model
 *
 * adds an LPFile object to the list of images to upload
 * @param {File} file contains info of the image retrieved from input 
 *
 * @return {LPFile} image from model
 */
FileUploader.prototype.addImage = function(file, is_uploaded) 
{
    var self = this;
    var is_accepted_file = this.isValidFile(file.name) && LPFile.isAcceptedFile(file.name);

    if (is_accepted_file)
    {
        var img = new LPFile({
            uploaded : is_uploaded,
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
                if (img.is_pdf)
                {
                    self.view.showThumb(self.model.indexOf(img), img.getPDFThumbnail());
                }
                else if (img.is_doc)
                {
                    self.view.showThumb(self.model.indexOf(img), img.getDOCThumbnail());
                }
                else
                {
                    if (self.options.thumbnail_origin === 'local')
                    {
                        self.view.showThumb(self.model.indexOf(img), img.data);
                    }
                    else
                    {
                        self.view.showThumb(self.model.indexOf(img), url);
                    }
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
 * return list of LPFile 
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
    var values = [];
    for (var i = 0; i < this.model.length; i++) 
    {
        var image = this.model[i];
        if (image.value !== '')
        {
            if (typeof(image.value) !== 'string')
            {
                image.value = JSON.stringify(image.value);
            }

            values.push(image.value);
        }
    }

    return values;
};

FileUploader.prototype.deleteImage = function(index) 
{
    this.model.splice(index, 1);
};
