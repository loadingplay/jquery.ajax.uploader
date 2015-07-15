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
'use strict';

var FileUploaderTemplates = 
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
            </div> \
        </li>',

    'imgup-image-add-template' : ' \
        <li class="imgup-add-input-container" > \
            <input type="file" class="imgup-add-input" multiple="multiple" /> \
        </li>'
};

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


FileUploaderView.prototype.init = function() 
{
    // hide obj
    var $input = this.controller.getInput();

    $input.css('visibility', 'hidden');
    $input.attr('type', 'text');
    $input.after(this.$container);
    this.render();
};

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

FileUploaderView.prototype.addImage = function(img) 
{
    this.clearImages();
    var $image_temp = $(this.img_template);
    $.data($image_temp, 'lpimage', img);

    this.applyPercent($image_temp, img.thumbPercent);

    $($image_temp)
        .insertBefore($('.imgup-add-input-container', this.$main_template));
    this.$images.push($image_temp);
};

FileUploaderView.prototype.loadTemplates = function() 
{
    this.main_template = FileUploaderTemplates['imgup-template'];
    this.img_template = FileUploaderTemplates['imgup-image-template'];
    this.add_img_template = FileUploaderTemplates['imgup-image-add-template'];
};

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

FileUploaderView.prototype.render = function() 
{
    var self = this;
    setTimeout(function() 
    {
        var $main_temp = $(self.main_template);
        var $input_el = null;

        $('ul', $main_temp).append(self.add_img_template);

        // return $main_temp;
        self.$container.html($main_temp);

        $input_el = $('.imgup-add-input', $main_temp);
        $input_el.attr('multiple', self.controller.options.multi);

        self.$main_template = $main_temp;
        self.addInputEvent( $input_el );
    }, 10);
};


FileUploaderView.prototype.updateUploadProgress = function(index, percent) 
{
    this.applyPercent(this.$images[index], percent);
};

FileUploaderView.prototype.updateThumbProgress = function(index, percent) 
{
    this.applyPercent(this.$images[index], percent);
};

FileUploaderView.prototype.imageDataLoaded = function(index) 
{
    $('.imgup-progress-bar', this.$images[index]).css('opacity', 1);
    $('.imgup-progress-bar', this.$images[index]).css('width', 0);
};

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
            var img = thumb.img.clone();

            img.load(function()
            {
                thumb.img.replaceWith(img);

                // this.is_loading = false;
                self.loadingThumbgs();
            });
            img.attr('src', self.controller.getBaseURL() + thumb.url);

        }, 500);

        return;
    }

    this.is_loading = false;
};

FileUploaderView.prototype.applyPercent = function($el, percent) 
{
    $('.imgup-progress-bar', $el).css('width', (percent) + '%');
};

FileUploaderView.prototype.updateurl = function() 
{
    var urls = this.controller.getImagesData();
    var $input = this.controller.getInput();

    $input.val(urls);
};
'use strict';


var Waterfall = function()
{
    this.images = [];
    this.upload_images = [];
    this.is_loading = false;
    this.is_uploading = false;
    this.uploading_counter = 0;
};

Waterfall.prototype.clearImages = function() 
{
    this.images = [];
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

        if (self.response_type === 'string')
        {
            self.url = resp;
            self.onupdateurl(resp);
        }
        else
        {
            if (typeof(resp) !== 'object')
            {
                resp = $.parseJSON(resp);
            }
            else
            {
                self.value = JSON.stringify(resp);
            }
            self.url = resp[self.thumbnail];
            self.onupdateurl(resp[self.thumbnail]);
        }

        callback();

    });

};
/*global FileUploader:true*/
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
            multi : true,
            images : []
        };

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

