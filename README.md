# jquery.ajax.uploader
this is a simple mvc ajax file uploader, ready to work with tornado webserver.


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

## Changelog


## TODO

 + read if input is multiple from dom