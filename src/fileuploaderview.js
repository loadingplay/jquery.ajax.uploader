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