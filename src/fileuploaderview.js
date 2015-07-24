'use strict';

var FileUploaderTemplates =  // jshint ignore : line
{
    'imgup-template' : ' \
        <div class="imgup"> \
            <ul> \
            </ul> \
        </div>',

    'imgup-image-template' : ' \
        <li> \
            <div class="img-container" > \
                <img src="" class="imgup-image" /> \
                <div class="imgup-progress" > \
                    <div class="imgup-progress-bar" ></div> \
                </div> \
                <div>\
                    <a class="imgup-delete-button" href="#!" >x</a>\
                </div>\
            </div> \
        </li>',

    'imgup-image-add-template' : ' \
        <li class="imgup-add-input-container" > \
            <input type="file" class="imgup-add-input" multiple="multiple" /> \
        </li>'
};


/**
 * View of a simple file uploader.
 * contains all DOM calls.
 * @param {FileUploader} controller contains a reference to controller 
 *                                  @see: FileUploader
 */
var FileUploaderView = function(controller)
{
    this.controller = controller;
    this.main_template = '';
    this.img_template = '';
    this.add_img_template = '';
    this.$images = [];
    this.$main_template = undefined;

    this.loadTemplates();
    this.thumbs_loading = [];
    this.is_loading = false;

    this.$container = $('<div class="imageuploader-container" ></div>');
};

/**
 * initialize all necesary DOM for starting add images
 */
FileUploaderView.prototype.init = function() 
{
    // hide obj
    var $input = this.controller.getInput();

    $input.css('visibility', 'hidden');
    $input.attr('type', 'text');
    $input.after(this.$container);
    this.render();
};

/**
 * apply events callbacks over an <input type="file" />
 * @param {Object} $input jQuery of an input
 */
FileUploaderView.prototype.addInputEvent = function($input) 
{
    var self = this;
    $input.change(function(evt)
    {
        var i = 0;
        var files = evt.target.files;

        for (i = 0; i < files.length; i++)
        {
            self.controller.addImage(files[i]);
        }
    });
};

/**
 * add dom for a given image
 * @param {LPImage} img html is generated with img parameters
 */
FileUploaderView.prototype.addImage = function(img) 
{
    this.clearImages();
    var $image_temp = $(this.img_template);
    var $button = $('.imgup-delete-button', $image_temp);

    $.data($button, 'lpparent', $image_temp);
    $.data($image_temp, 'lpimage', img);

    this.applyPercent($image_temp, img.thumbPercent);

    $($image_temp)
        .insertBefore($('.imgup-add-input-container', this.$main_template));

    this.initDeleteButton($button);
    this.$images.push($image_temp);
};

FileUploaderView.prototype.initDeleteButton = function($button) 
{
    var self = this;
    var index = 0;
    var $image = null;

    $button.click(function()
    {
        if (self.controller.isready())
        {
            $image = $.data($button, 'lpparent');
            index = self.$images.indexOf($image);

            self.deleteImage(index);
        }
    });
};

FileUploaderView.prototype.deleteImage = function(index) 
{
    var $image = this.$images[index];

    $image.remove();
    this.$images.splice(index, 1);
    this.controller.deleteImage(index);

    this.updateurl();
};

/**
 * load all templates form @see: FileUploaderTemplates
 */
FileUploaderView.prototype.loadTemplates = function() 
{
    this.main_template = FileUploaderTemplates['imgup-template'];
    this.img_template = FileUploaderTemplates['imgup-image-template'];
    this.add_img_template = FileUploaderTemplates['imgup-image-add-template'];

    if (this.controller.options.templates.list_container_template !== '')
    {
        this.main_template = $(this.controller.options.templates.list_container_template)
                                .html();
    }

    if (this.controller.options.templates.item_template !== '')
    {
        this.img_template = $(this.controller.options.templates.item_template).html();
    }

    if (this.controller.options.templates.input_template !== '')
    {
        this.add_img_template = $(this.controller.options.templates.input_template)
                                    .html();
    }
};

/**
 * clear the list of jQuery images and remove from DOM
 */
FileUploaderView.prototype.clearImages = function() 
{
    if (!this.controller.options.multi)
    {
        $('li', this.$container).each(function()
        {
            if (!$(this).hasClass('imgup-add-input-container'))
                $(this).remove();
        });

        this.$images = [];
    }
};

/**
 * render all new generated dom for image list
 */
FileUploaderView.prototype.render = function() 
{
    var self = this;
    var $main_temp = $(self.main_template);
    var $input_el = null;

    $('ul', $main_temp).append($(self.add_img_template));

    // return $main_temp;
    self.$container.html($main_temp);

    $input_el = $('.imgup-add-input', $main_temp);
    $input_el.attr('multiple', self.controller.options.multi);

    self.$main_template = $main_temp;
    self.addInputEvent( $input_el );
};

/**
 * draw the uploading progress bar.
 * @param  {Int} index      number of image to update
 * @param  {Int} percent    percentage of progress
 */
FileUploaderView.prototype.updateUploadProgress = function(index, percent) 
{
    this.applyPercent(this.$images[index], percent);
};

/**
 * draw the loading progress of thumbnails.
 * @param  {Int} index      number of image to update
 * @param  {Int} percent    percentage of progress
 */
FileUploaderView.prototype.updateThumbProgress = function(index, percent) 
{
    this.applyPercent(this.$images[index], percent);
};

/**
 * hide progress bar when thumbnail data was loaded
 * @param  {Int} index    number of image to update
 */
FileUploaderView.prototype.imageDataLoaded = function(index) 
{
    $('.imgup-progress-bar', this.$images[index]).css('opacity', 1);
    $('.imgup-progress-bar', this.$images[index]).css('width', 0);
};

/**
 * show a thumbnail in an image
 * @param  {Int} index      number of image to update
 * @param  {String} url     route of thumbnail
 */
FileUploaderView.prototype.showThumb = function(index, url) 
{
    var self = this;

    this.thumbs_loading.push({ 
        'img' : $('img', self.$images[index]), 
        'url' : url,
        'index' : index
    });
    this.loadingThumbgs();

    // this.thumbs_loading = [];
    // this.is_loading = false;
};

/**
 * Waterfall for thumbnails progress
 *
 * only load one at time, and once finished load next
 */
FileUploaderView.prototype.loadingThumbgs = function()
{
    if (this.is_loading)
        return;

    var self = this;

    if (this.thumbs_loading.length > 0)
    {
        var thumb = this.thumbs_loading.shift();

        setTimeout(function()
        {
            var img = thumb.img;
            img.loaded = false;

            img.load(function()
            {
                if (!img.loaded)
                {
                    img.load = $.noop();
                    img.loaded = true;
                    img.css('opacity', '1');

                    self.is_loading = false;
                    self.loadingThumbgs();
                }
            });
            img.css('opacity', '0');
            img.attr('src', self.controller.getBaseURL() + thumb.url);

        }, 100);

        self.is_loading = true;

        return;
    }

    this.is_loading = false;
};

/**
 * draw the progress bar.
 * @param  {Int} index      number of image to update
 * @param  {Int} percent    percentage of progress
 */
FileUploaderView.prototype.applyPercent = function($el, percent) 
{
    $('.imgup-progress-bar', $el).css('width', (percent) + '%');
};

/**
 * fill a list of urls in the input
 */
FileUploaderView.prototype.updateurl = function() 
{
    var urls = this.controller.getImagesData();
    var $input = this.controller.getInput();

    $input.val(urls);
};