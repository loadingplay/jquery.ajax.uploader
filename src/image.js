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