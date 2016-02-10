# jquery.ajax.uploader  [![Build Status](https://travis-ci.org/k1ltr0/jquery.ajax.uploader.svg?branch=master)](https://travis-ci.org/k1ltr0/jquery.ajax.uploader)
this is a simple mvc ajax file uploader, ready to work with tornado webserver.

## install and execute

``` sh
$ npm install
```


```sh
$ bower install
```

```sh
$ grunt
```

```sh
$ open http://localhost:8888/
```

## Example

include jquery
```html
<script type="text/javascript" src="/static/bower_components/jquery/dist/jquery.min.js"></script>
```

include fileuploader.js
```html
<script type="text/javascript" src="/static/dist/fileuploader.js"></script>
```

also fileuploader.css
```html
<link rel="stylesheet" type="text/css" href="/static/dist/fileuploader.css">
```

add a simple input file

```html
<input type="file" class="imgup-add-input" multiple="multiple" />
```

initialize plugin

```javascript
$("input[name=file]").fileuploader();
```

all together

```html
<link rel="stylesheet" type="text/css" href="/static/dist/fileuploader.css">
<script type="text/javascript" src="/static/bower_components/jquery/dist/jquery.min.js"></script>
<script type="text/javascript" src="/static/dist/fileuploader.js"></script>

<input type="file" class="imgup-add-input" multiple="multiple" />

<script type="text/javascript" >
$(document).ready(function()
{
    $("input[name=file]").fileuploader();
});
</script>
```

## All options


```javascript
{
    base_url : '',
    uploadurl : '/',
    response_type : 'string',
    thumbnail : '',
    thumbnail_origin : 'local', // remote
    hidden_class : 'imgup-hidden',
    multi : true,  // disable multi-select
    sortable : false,  // enable sortable
    highlight_spot: false,
    support_pdf : false,  // enables PDF files support
    templates : {  // html templates
        list_container_template : '',
        item_template : '',
        input_template : ''
    },
    images : []  // images to preload
}
```

## Changelog


## TODO

 + read if input is multiple from dom
