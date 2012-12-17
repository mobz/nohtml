# noHtml

Blatantly attempting to subsume the cachet of the noSQL movement, noHtml is a powerful browser templating system that completly bypasses the HTML layer and generates DOM structures from directly from javascript. This current release has a single implementation targetting jQuery and has additional jQuery specific features.

## So what does it do

jquery-nohtml has a very simple manifesto

* provide a templating language which
  * merges templates and data easily
  * but does not get in the way of expressive javascript,
  * protects me from [security vulnerabilities](https://www.owasp.org/index.php/Cross-site_Scripting_XSS)
  * and allows event binding directly within templates
  * while still being blindingly fast

## Give me a simple example

Each noHtml template is simply a plain old javascript object. The format of object looks like the html you want to produce

``` js
// the template
var welcome = { tag: "DIV", cls: "welcome", text: "Hello World!" };

// using the template
$( welcome ).appendTo( "#target" );
```

## How do I combine templates and JSON

Where noHtml really shines is working with data. Typically to do this we define a function which returns a template

``` js
// the template
function welcome(name) {
  return { tag: "DIV", cls: "welcome", text: "Hello " + name };
}

// using the template
$( welcome("Ben") ).appendTo( "#target" );
```

## Whats so good about that?

You will notice a few things that are different from other templating languages.

* there are no angle brackets < anywhere >
* it's all javascript / json
* the template is passed directly to the jquery constructor

_The_ reason that noHtml is so powerful is that it is *all* javascript. Standard templating languages force you to do things like <% name %> or ${name} in the middle of a string of html, to get at javascript. Things that should be easy like looping, calling functions and accessing variables are _hard_.

To make using noHtml easier we have elevated templates to the status of first class constructors in jQuery, and all jQuery methods and plugins that accept HTML strings, also accept noHtml templates.

## What attributes can a template object have?

* `tag` (default: "DIV"), this tag is usually required and determines what type of dom element is created. All elements from (X)HTML4 XHTML1.0 and HTML5 as well as custom elements are supported
* `cls` this is a shortcut for setting the class of the element 
* `id` sets the id
* `css` accepts a map of css values, which are applied to the object eg `css: { border: "1px solid green", height: "12px" }`
* `text` sets the text content of the element
* `child` creates a single child (inner) element
* `children` creates one or more child elements ( in an array )
* `data` accepts a map of data values which are assigned to the element using the [jQuery data](http://api.jquery.com/jQuery.data/) api
* `on*` any function passed in to a property starting with on creates an event handler tied the named event
eg `onclick: function() { alert("clicked!") }`
* `anything else` creates an attribute on the element with the name and value passed in.
* also `html` allows you to set raw innerHTML of the element, this should be avoided however and is included only to support legacy systems.

* `jqmData` the src file jquery.mobile-nohtml.js is a special build of noHtml that allows adding of correctly namespaced jqueryMobile specific attributes
eg `jqmData: { role: "page", theme: "d", backBtn: false }`

## Binding events

As described above it is possible to bind event handlers directly in the template, this is a very powerful and unique feature of nohtml templates.

Because the template is written in javascript, the bound event has access (via closures) to all the local variables available when then template is generated. In addition because the event is bound inline, creating dom structures and binding events becomes a single step process, rather forcing you to create the dom structures then find the nodes and attaching event handlers.

The created events are jQuery events rather than pure DOM events

``` js
// create a text field with inline validation
function usernameField( val ) {
  return { tag: "INPUT", type: "text", name: "username", value: val, onblur: function() {
    if( $(this).val().length < 6) {
      alert( "Your username must be at least 6 characters" );
      $(this).addClass("error");
    } else {
      $(this).removeClass("error");
    }
  } };
}
```

Of course, you do not have to actually define the function inline like that, you could break it out and simply refer to the function:

``` js
{ tag: "INPUT", ... onblur: validateUsername }
```

## Defining inner (child) elements 

NoHtml provides many ways to allow children of elements to be created, and dom structures of any size and depth can be created

the `child`, `children` and `text` properties all do the same thing, accept various types of data and create dom nodes out of them

* `string` if a string is provided, Text DOM node is created in the element
eg `text: "Hello World!"`
* `object` if an object is passed into the templating engine to create a DOM Element Node
eg `child: { tag: "DIV", cls: "foo" }`
* `DOM Element` you can directly pass a DOM element in and it will be removed from is current location and appended to the element
eg `child: document.getElementById("foo")`
* `jQuery Object` a jQuery object can also be passed in, and all elements in the matched set are added as children of the element
eg `children: $("#fruit LI.edible")`
* `Array` an array of any of the above types (including mixing types) causes created or matched elements to be added as children of the element
eg `children: [ "This is a ", { tag: "B", text: "big" }, "deal!", { tag: "BR" } ]`
* `false`, `null`, `undefined` these are treated as a no-op and ignored. This can be useful if you want to conditionally include some markup in a template
eg `children: [ this.label, ( this.required ? { tag: "SPAN", cls: "required", text: "*"} : null ) ]`

As a metter of convention, use `text` for strings, `child` for any single element and `children` for an array of elements

## Looping?

While you can create nohtml templates using stardard `for(;;)` or `while()` style loops, your templates will look extra sexy using the [map](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/map) function

``` js
// an unordered list of fruit
var fruits = [ "Apple", "Pear", "Guava", "Rockmelon", "Sapote" ];

// the template
function unorderedList(list) {
  return { tag: "UL", children: list.map(function(item) {
    return { tag: "LI", text: item };
  } ) };
}

// using the template
$( unorderedList( fruits ) ).appendTo( "#target" );
```

``` js
// create a table
function table(data) {
  return { tag: "TABLE", children: [
    { tag: "TBODY", children: data.rows.map( function(row) {
      return { tag: "TR", children: row.map( function( cell ) {
        return { tag: "TD", text: cell };
      } ) };
    } ) }
  ] };
}
```

Note that the `map` function is not natively available in some older browser (eg IE7), but can be [easily implemented](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/map#Compatibility)

## Templates and Inheritance

One of the truly sucky things about any other templating language is how infexible they are. Sure you can combine a template with some json and produce something nice. NoHtml templates allow you to go further. Because noHtml templates _are_ themselves json data, you can inject the templates into other template, and generally manipulate the templates with the full power of javascript.

``` js
  // very simpe example of template inheritance
  // textField
function textField( props ) {
  return { tag: "INPUT", type: "text", cls: props.cls, name: props.name, value: props.val, onblur: props.validation };
}
  // create a password field which inherits it's behaviour from the textField template
function passwordField( props ) {
  return $.extend( textField(prop), { type: "password" });
}
```

## Recursion??

Using recusion in templating is pretty rare, but of course, if you can do it in javascript, you can do it in noHtml. This neat little bit of code creates a icon with any number of overlay images, defined using a classes that mapped to a sprite.

``` js
// the template
function docWithFeatures( features, innerContent ) {
  return features.split( " " ).reverse().reduce( function( child, icon ) {
    return { tag: "DIV", cls: "overlay-" + icon, child: child };
  }, innerContent );
};

// using the template
row.find(".documentName").prepend( docWithFeatures("xls readonly public svn", "click to open") );
```

## Another example

``` js
// a hcard microformat that displays details of a person
function hcard(person) {
  return { tag: "DIV", cls: "vcard", children: [
    { tag: "SPAN", cls: "fn n", children: [
      { tag: "A", cls: "url", href: person.url },
      { tag: "SPAN", cls: "given-name", text: person.firstname },
      { tag: "SPAN", cls: "family-name", text: person.surname }
    ]},
    { tag: "SPAN", cls: "nickname", text: person.handle },
    { tag: "A", cls: "email", href: "mailto:" + person.email }
  ]};
}
```

## Browser Support

jquery-nohtml should work with all browsers that jquery supports, but is specifically known to work with
* IE 6+
* Firefox 2+
* Safari 3+ (including iphone)
* Chrome 3+ (including android browsers)


