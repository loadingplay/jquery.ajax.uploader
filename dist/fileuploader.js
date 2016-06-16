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

/*global FileUploader */
/*global FileUploaderTemplates */

'use strict';

(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = 'fileuploader';
    var methods = {
        isready : function()
        {
            var ready = true;
            this.each(function()
                {
                    var file_uploader = $.data(this, 'plugin_' + pluginName);

                    if (!file_uploader.isready())
                    {
                        ready = false;
                    }
                });

            return ready;
        },
        loadimages : function(images)
        {
            this.each(function()
            {
                try
                {
                    $.data(this, 'plugin_' + pluginName).preloadImages(images);
                }
                catch (ex)
                {
                    // nothing here
                }
            });
        }
    };

    $.fn[pluginName] = function ( method_or_settings, settings ) 
    {

        var set = {
            base_url : '',
            uploadurl : '/',
            response_type : 'string',
            thumbnail : '',
            thumbnail_origin : 'local', // remote
            hidden_class : 'imgup-hidden',
            multi : true,
            sortable : false,
            highlight_spot: false,
            files_supported : ".png|.jpg",  // all supported files: ".png|.jpg|.pdf|.doc|.docx"
            onready : function(){},
            templates : {
                list_container_template : '',
                item_template : '',
                input_template : ''
            },
            images : []
        };

        // support_pdf @deprecated : this section was added for compatibility reasons
        try
        {
            if (set.support_pdf)
            {
                set.files_supported += "|.pdf";
            }
        }
        catch (e)
        {
            // nothing here...
        }

        if (methods[method_or_settings])
        {
            return methods[method_or_settings].call(this, settings);
        }
        else
        {
            settings = method_or_settings;
        }
        var options = $.extend( {}, set, settings );

        return this.each(function () 
        {
            if (!$.data(this, 'plugin_' + pluginName)) 
            {
                $.data(this, 'plugin_' + pluginName, 
                new FileUploader( this, options ));
            }
        });
    };

})( jQuery, window, document ); // jshint ignore: line


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
