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

