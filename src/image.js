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
                    console.log(evt);
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