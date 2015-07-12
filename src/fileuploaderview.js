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