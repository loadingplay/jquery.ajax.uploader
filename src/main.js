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
            multi : true
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

