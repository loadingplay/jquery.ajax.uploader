'use strict';

var FileUploaderTemplates =  // jshint ignore : line
{
    'imgup-template' : ' \
        <div class="imgup" name="THEY HATIIN" > \
            <ul class="img-ulist" name="THEY SEE ME ROOOLLIN"> \
            </ul> \
        </div>',

    'imgup-image-template' : ' \
        <li> \
            <div class="img-container" > \
                <img src="" class="imgup-image" pos-x="50" pos-y="50"/> \
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
        </li>',

    'imgup-highlight-template' : '\
        <div class="img-container" > \
            <img src="{{ src }}" class="imgup-image-biger"/> \
        </div>\
    '
};


/**
 * View of a simple file uploader.
 * contains all DOM calls.
 * @param {FileUploader} controller contains a reference to controller 
 *                                  @see: FileUploader
 */
var FileUploaderView = function(controller)
{
    var self = this;
    this.controller = controller;
    this.main_template = '';
    this.img_template = '';
    this.add_img_template = '';
    this.highlight_template = '';
    this.$images = [];
    this.$main_template = undefined;

    this.loadTemplates();
    this.thumbs_loading = [];
    this.is_loading = false;
    this.fading = false;

    this.$container = $('<div class="imageuploader-container" ></div>');

    if (this.controller.options.sortable)
    {
        this.initSortable(function(new_order)
            {
                self.controller.applySort(new_order);
                self.updateurl();
                self.controller.options.onready();
            });
    }
};


FileUploaderView.prototype.initSortable = function(callback) 
{
    var self = this;
    var selector = 'li:not(.imgup-add-input-container)';

    this.includeJqueryUI(function()
    {

        // add all index
        var onSort = function()
        {
            var index = 0;
            $(selector, $(this)).each(function()
            {
                if (!$(this).hasClass('ui-sortable-placeholder')) 
                {
                    $(this).attr('index', index);
                    index++;
                }
            });
        };

        // retrive new order for model
        var onUpdate = function(e)
        {
            var new_order = [];
            $(selector, $(this)).each(function()
            {
                var index = parseInt($(this).attr('index'));
                new_order.push(index);
            });

            callback(new_order);
        };

        $('ul.img-ulist', self.$container).sortable({
            'items' : selector,
            'sort' : onSort,
            'update' : onUpdate
        });
    });
};


FileUploaderView.prototype.includeJqueryUI = function(callback) 
{
    if (jQuery.ui == undefined)
    {
        jQuery.getScript('https://code.jquery.com/ui/1.11.4/jquery-ui.js', function()
        {
            callback();
        });
    }
    else
    {
        setTimeout(function()
        {
            callback();
        }, 1000);
    }
};

/**
 * initialize all necesary DOM for starting add images
 */
FileUploaderView.prototype.init = function() 
{
    // hide obj
    var $input = this.controller.getInput();

    $input.css('visibility', 'hidden');

    try
    {
        $input.attr('type', 'text');
    }
    catch (e)
    {
        // fix for jquery 1.8.4
        $input.each(function()
        {
            this.type = 'text';
        });
    }

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
 * @param {LPFile} img html is generated with img parameters
 */
FileUploaderView.prototype.addImage = function(img) 
{
    this.clearImages();
    var self = this;
    var $image_temp = $(this.img_template);
    var $button = $('.imgup-delete-button', $image_temp);
    var $input = $('.imgup-add-input-container', this.$main_template);

    $.data($button, 'lpparent', $image_temp);
    $.data($image_temp, 'lpimage', img);

    this.applyPercent($image_temp, img.thumbPercent);

    $($image_temp)
        .insertBefore($input);

    if (!this.controller.options.multi)
    {
        $input.addClass(this.controller.options.hidden_class);
    }

    // HIGHLIGHT --- beginning//
    if (this.controller.options.highlight_spot)
    {
        //CAMBIO DE VIEW, desaparece lista imagenes y entra la imagen en greande
        $image_temp.on('click', function(event)
        {
            if (!self.fading && self.controller.isready())
            {
                self.fading = true;
                var $div_mayor = $(this).closest('div.imgup');
                var $ul = $(this).closest('ul.img-ulist');
                var $img_clicked = $(this).find('img.imgup-image');
                var img_src = $img_clicked.attr('src');
                // console.log('%_x: ' + $img_clicked.attr('pos-x') + '\n%_y: ' + $img_clicked.attr('pos-y') + '\n');

                $ul.fadeOut('slow', function()
                {
                    var aux_tmp = '<div class="img-container" id="img-container-big"> <img id="big-img" src="'+ img_src +'" class="imgup-image-biger"/> <i id="dot-aim" class="fa fa-cloud tiny" style="color: red; position: absolute;"></i> </div> <button class="done">DONE</button>';
                    $div_mayor.append(aux_tmp);
                    
                    var $dot = $('i#dot-aim');
                    var image_pos = $('img#big-img').position();
                    var image_height = $('img#big-img').height();
                    var image_width = $('img#big-img').width();
                    var porcentual_x = $img_clicked.attr('pos-x');
                    var porcentual_y = $img_clicked.attr('pos-y');
                    var DRAGGING = false;

                    var $button_done = $div_mayor.find('button.done');

                    $dot.css({"left": + (image_pos.left - $dot.width()/2 + image_width*porcentual_x*0.01) + "px", "top": + (image_pos.top - $dot.height()/2 + image_height*porcentual_y*0.01) + "px"});

                    $('#big-img').on('dragstart', function(event)
                    {
                        //para que no se arrastre la imagen al fijar el numero
                        event.preventDefault();
                    });

                    $(document).on('mousemove', function(event)
                    {
                        if (DRAGGING){
                            if ( event.pageX > image_pos.left && event.pageX < (image_pos.left + image_width) ){
                                porcentual_x = 100*(event.pageX - image_pos.left)/image_width;
                            }
                            if ( event.pageY > image_pos.top && event.pageY < (image_pos.top + image_height) ){
                                porcentual_y = 100*(event.pageY - image_pos.top)/image_height;
                            }
                            $dot.css({"left": + (image_pos.left - $dot.width()/2 + image_width*porcentual_x*0.01) + "px", "top": + (image_pos.top - $dot.height()/2 + image_height*porcentual_y*0.01) + "px"});
                            // console.log('%_x: ' + porcentual_x + '\n%_y: ' + porcentual_y + '\n');
                        }                      
                    });

                    $(document).on('mousedown', function(event)
                    {
                        if ( event.which == 1 && event.pageY > image_pos.top && event.pageY < (image_pos.top + image_height) ){
                            if ( event.pageX > image_pos.left && event.pageX < (image_pos.left + image_width) ){
                                DRAGGING = true;
                            }
                        }
                    });

                    $(document).on('mouseup', function(event)
                    {
                        if (event.which == 1 && DRAGGING){
                            porcentual_x = 100*(event.pageX - image_pos.left)/image_width;
                            porcentual_y = 100*(event.pageY - image_pos.top)/image_height;
                            if(porcentual_x > 100) porcentual_x = 100;
                            if(porcentual_y > 100) porcentual_y = 100;
                            if(porcentual_x < 0) porcentual_x = 0;
                            if(porcentual_y < 0) porcentual_y = 0;

                            $dot.css({"left": + (image_pos.left - $dot.width()/2 + image_width*porcentual_x*0.01) + "px", "top": + (image_pos.top - $dot.height()/2 + image_height*porcentual_y*0.01) + "px"});

                            // console.log('%_x: ' + porcentual_x + '\n%_y: ' + porcentual_y + '\n');
                        }
                        DRAGGING = false;
                    });

                    //Boton para volver al view original -lista de imagenes-
                    $button_done.on('click', function()
                    {
                        var this_button = this;

                        $(document).off('mousemove');
                        $(document).off('mouseup');
                        $(document).off('mousedown');

                        $img_clicked.attr('pos-x', porcentual_x);
                        $img_clicked.attr('pos-y', porcentual_y);

                        self.fading = false;

                        $('#img-container-big').fadeOut('fast');
                        $(this).fadeOut('fast', function()
                        {
                            $('#img-container-big').remove();
                            this_button.remove();
                            $ul.fadeIn('fast');
                        });                        
                    });
                });            
            }
        });
    }
    // HIGHLIGHT --- end //

    this.initDeleteButton($button);
    this.$images.push($image_temp);
};

FileUploaderView.prototype.initDeleteButton = function($button) 
{
    var self = this;
    var index = 0;
    var $image = null;

    $button.click(function(e)
    {
        e.preventDefault();

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
    var $input = $('.imgup-add-input-container', this.$main_template);

    $image.remove();
    this.$images.splice(index, 1);
    this.controller.deleteImage(index);

    this.updateurl();
    this.controller.options.onready();

    if (this.$images.length === 0)
    {
        $input.removeClass(this.controller.options.hidden_class);
    }
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
    var multi = this.controller.options.multi;
    var self = this;
    var $main_temp = $(self.main_template);
    var $input_el = null;

    $('ul', $main_temp).append($(self.add_img_template));

    // return $main_temp;
    self.$container.html($main_temp);

    $input_el = $('.imgup-add-input', $main_temp);
    $input_el.attr('multiple', multi);

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
