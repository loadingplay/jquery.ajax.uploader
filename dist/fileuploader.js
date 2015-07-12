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
                self.view.showThumb(self.model.indexOf(img), data);
            },
            onupdateurl : function()
            {
                self.view.updateurl();
            },
        });

        this.model.push(img);
        img.upload();

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
};


FileUploaderView.prototype.init = function() 
{
    // hide obj
    var $input = this.controller.getInput();

    $input.css('visibility', 'hidden');
    $input.attr('type', 'text');
    $input.after('<div class="imageuploader-container" ></div>');
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


FileUploaderView.prototype.render = function() 
{
    var self = this;
    setTimeout(function() 
    {
        var $main_temp = $(self.main_template);
        $('ul', $main_temp).append(self.add_img_template);

        // return $main_temp;
        $('.imageuploader-container').html($main_temp);
        this.$main_template = $main_temp;
        self.addInputEvent( $('.imgup-add-input', $main_temp) );
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

FileUploaderView.prototype.showThumb = function(index, data) 
{
    var self = this;

        var $img = $('img', self.$images[index]);
        var $new_img = $img.clone();
        $new_img.on('load', function()
        {
            $img.replaceWith($new_img);
        });
        $new_img.attr('src', data);
};

FileUploaderView.prototype.applyPercent = function($el, percent) 
{
    $('.imgup-progress-bar', $el).css('width', (percent) + '%');
};

FileUploaderView.prototype.updateurl = function() 
{
    var urls = this.controller.getImagesURL();
    var $input = this.controller.getInput();

    $input.val(urls);
};
'use strict';

var LPImage = function(data)
{
    this.name = data.file.name === undefined ? '' : data.file.name;
    this.size = data.file.size === undefined ? '' : data.file.size;
    this.file = data.file;
    this.url = '';
    this.onthumbprogress = data.onthumbprogress === undefined ? $.noop() : data.onthumbprogress;
    this.onprogress = data.onprogress === undefined ? $.noop() : data.onprogress;
    this.onupdateurl = data.onupdateurl === undefined ? $.noop() : data.onupdateurl;
    this.uploadurl = data.uploadurl === undefined ? '/' : data.uploadurl;
    this.onthumbloaded = data.onthumbloaded === undefined ? $.noop() : data.onthumbloaded;

    this.thumbPercent = 0;
    this.percentComplete = 0;
};

LPImage.prototype.loadThumb = function(callback) 
{
    var self = this;
    var reader = new FileReader();

    reader.onload = function(e) 
    {
        self.data = e.target.result;
        self.onthumbloaded(self.data);
        callback();
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

LPImage.prototype.upload = function() 
{
    this.loadThumb(function()
    {
        // var self = this;
        // var data = {
        //         'name' : this.name,
        //         'size' : this.size
        //     };

        // $.ajax({
        //     url : this.uploadurl, 
        //     method : 'POST',
        //     cache : false,
        //     data : data,
        //     xhr : function()
        //     {
        //         var xhr = new window.XMLHttpRequest();
        //         //Download progress
        //         xhr.addEventListener(
        //             'progress', 
        //             function (evt) 
        //             {
        //                 if (evt.lengthComputable) 
        //                 {
        //                     self.percentComplete = Math.round((evt.loaded / evt.total) * 100);
        //                     self.onprogress(self.percentComplete);
        //                 }
        //                 else
        //                 {
        //                     self.percentComplete = 100;
        //                     self.onprogress(self.percentComplete);
        //                 }
        //             }, false);
        //         return xhr;
        //     }
        // })
        // .done(function(data)
        //     {
        //         self.url = data;
        //         self.onupdateurl();
        //     });
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
            uploadurl : '/'
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

