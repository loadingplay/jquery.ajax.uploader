var FileUploaderTemplates = 
{
    "imgup-template" : ' \
        <div class="imgup"> \
            <ul> \
            </ul> \
        </div>',

    "imgup-image-template" : ' \
        <li> \
            <div class="img-container" > \
                <img src="" class="imgup-image" /> \
                <div class="imgup-progress" > \
                    <div class="imgup-progress-bar" ></div> \
                </div> \
            </div> \
        </li>',

    "imgup-image-add-template" : ' \
        <li class="imgup-add-input-container" > \
            <input type="file" class="imgup-add-input" multiple="multiple" /> \
        </li>'
}



var FileUploaderView = function(controller)
{
    this.controller = controller;
    this.main_template = "";
    this.img_template = "";
    this.add_img_template = "";

    this.loadTemplates();
}


FileUploaderView.prototype.init = function() 
{
    // hide obj
    var self = this;
    var $input = this.controller.getInput();

    $input.css("visibility", "hidden");
    $input.attr("type", "text");
    $input.after("<div class='imageuploader-container' ></div>");
    this.render();
};

FileUploaderView.prototype.addInputEvent = function($input) 
{
    var self = this;
    $input.change(function(evt)
    {
        self.addFiles(evt.target.files);
    });
};

FileUploaderView.prototype.addFiles = function(files) 
{
    var i = 0;

    for (i = 0; i < files.length; i++)
    {
        this.addImage(files[i]);
    }
};


FileUploaderView.prototype.addImage = function(file) 
{
    var self = this;
    var reader = new FileReader();
    var name = file.name;
    var size = file.size;

    reader.onload = function(e) 
    {
        self.controller.addImage(name, size, e.target.result);
        self.render();
    }

    reader.readAsDataURL(file);
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
        var images = self.controller.getImageList();

        for (var i = 0; i < images.length; i++) 
        {
            var image = images[i];
            var $image_temp = $(self.img_template);

            self.applyPercent($image_temp, image.percentComplete);

            $(".imgup-image", $image_temp).attr("src", image.data);
            $("ul", $main_temp).append($image_temp);
        }

        $("ul", $main_temp).append(self.add_img_template);

        // return $main_temp;
        $(".imageuploader-container").html($main_temp);
        self.addInputEvent( $(".imgup-add-input", $main_temp) );
    }, 10);
};


FileUploaderView.prototype.updateView = function(index, percent) 
{
    this.applyPercent($(".imgup>ul li:nth-child("+ index +")"), percent);
};

FileUploaderView.prototype.applyPercent = function($el, percent) 
{
    $(".imgup-progress", $el).css("height", (100 - percent) + "px");
};

FileUploaderView.prototype.updateurl = function() 
{
    var urls = this.controller.getImagesURL();
    var $input = this.controller.getInput();

    $input.val(urls);
};
var LPImage = function(data)
{
    this.name = data.name === undefined ? "" : data.name;
    this.size = data.size === undefined ? "" : data.size;
    this.data = data.data === undefined ? "" : data.data;
    this.url = "";
    this.onprogress = data.onprogress === undefined ? $.noop() : data.onprogress;
    this.onupdateurl = data.onupdateurl === undefined ? $.noop() : data.onupdateurl;
    this.uploadurl = data.uploadurl === undefined ? "/" : data.uploadurl;

    this.percentComplete = 0;
};


LPImage.prototype.upload = function() 
{
    var self = this;
    var data = {
            "name" : this.name,
            "size" : this.size,
            "data" : this.data
        };

    $.ajax({
        url : this.uploadurl, 
        method : "POST",
        cache : false,
        data : data,
        xhr : function()
        {
            var xhr = new window.XMLHttpRequest();
            //Download progress
            xhr.addEventListener(
                "progress", 
                function (evt) 
                {
                    if (evt.lengthComputable) 
                    {
                        self.percentComplete = Math.round((evt.loaded / evt.total) * 100);
                        self.onprogress(self.percentComplete);
                    }
                }, false);
            return xhr;
        }
    })
    .done(function(data)
        {
            self.url = data;
            self.onupdateurl();
        });
};
(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = 'fileuploader';

    $.fn[pluginName] = function ( settings ) 
    {

        var set = {
            uploadurl : "/"
        };

        var options = $.extend( {}, set, settings );

        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) 
            {
                $.data(this, 'plugin_' + pluginName, 
                new FileUploader( this, options ));
            }
        });
    };

})( jQuery, window, document ); // jshint ignore: line


var FileUploader = function(obj, options)
{
    this.$obj = $(obj);
    this.options = options;

    this.model = [];

    this.view = new FileUploaderView(this);
    this.view.init();
}

FileUploader.prototype.addImage = function(name, size, data) 
{
    var self = this;
    if (this.isImage(name))
    {
        var img = new LPImage({
            name : name,
            size : size,
            data : data,
            uploadurl : this.options.uploadurl,
            onprogress : function(percent)
            {
                self.view.updateView(self.model.indexOf(img), percent);
            },
            onupdateurl : function()
            {
                self.view.updateurl();
            }
        });

        img.upload();

        this.model.push(img);

        return img;
    }
};

FileUploader.prototype.isImage = function(name) 
{
    if (name.indexOf(".jpg") != -1 ||
        name.indexOf(".png") != -1)
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

FileUploader.prototype.getImagesURL = function() 
{
    var urls = [];
    for (var i = 0; i < this.model.length; i++) 
    {
        var image = this.model[i];
        urls.push(image.url);
    };

    return urls;
};