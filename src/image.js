'use strict';


// var LPImageUploadPool = function()
// {
//     this.images = [];
//     this.uploaded_images = [];
//     this.uploading = false;
// };


// LPImageUploadPool.prototype.addImage = function(image) 
// {
//     if (this.uploaded_images.indexOf(image) !== -1)
//     {
//         this.images.append(image);
//     }

//     if (!this.uploading)
//     {
//         this.processUpload();
//     }
// };


// LPImageUploadPool.prototype.processUpload = function() 
// {
//     if (this.images.length > 0)
//     {
//         var img = 
//     }
// };


var LPImage = function(data)
{
    this.name = data.file.name === undefined ? '' : data.file.name;
    this.size = data.file.size === undefined ? '' : data.file.size;
    this.file = data.file;
    this.data = '';
    this.url = '';
    this.onthumbprogress = data.onthumbprogress === undefined ? $.noop() : data.onthumbprogress;
    this.onprogress = data.onprogress === undefined ? $.noop() : data.onprogress;
    this.onupdateurl = data.onupdateurl === undefined ? $.noop() : data.onupdateurl;
    this.onupdateurl = data.onupdateurl === undefined ? $.noop() : data.onupdateurl;
    this.uploadurl = data.uploadurl === undefined ? '/' : data.uploadurl;
    this.onthumbloaded = data.onthumbloaded === undefined ? $.noop() : data.onthumbloaded;

    this.thumbPercent = 0;
    this.percentComplete = 0;
};

LPImage.prototype.loadThumb = function() 
{
    var self = this;
    var reader = new FileReader();

    reader.onload = function(e) 
    {
        self.data = e.target.result;
        self.onthumbloaded(self.data);
        // setTimeout(function()
        // {
        //     callback();
        // }, 100);
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
    var data = {
        'name' : this.name,
        'size' : this.size,
        'data' : this.data
    };

    $.ajax({
        url : this.uploadurl,
        method : 'POST',
        cache : false,
        data : data,
        xhr : function()
        {
            var xhr = new window.XMLHttpRequest();
            //Download progress
            xhr.addEventListener(
                'progress', 
                function (evt) 
                {
                    if (evt.lengthComputable) 
                    {
                        // this.percentComplete = Math.round((evt.loaded / evt.total) * 100);
                        // this.onprogress(this.percentComplete);
                    }
                    else
                    {
                        // this.percentComplete = 100;
                        // this.onprogress(this.percentComplete);
                    }
                }, false);
            return xhr;
        },

    }).done(function(data)
    {
        this.url = data;
        this.onupdateurl();
    });
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
};