(function($, document) {
  $.support = {};
	// ie 6, 7 and 8 have trouble with the type and names of dynamically created inputs
	$.support.useHTMLForInputType = false;
	$(function() {
		try {
			var field = document.createElement( "INPUT" );
			document.body.appendChild( field );
			field.setAttribute( "type", "checkbox" );
		} catch(e) {
			$.support.useHTMLForInputType = true;
		} finally {
			field.parentNode && document.body.removeChild( field );
		}
	});

	var create = $.create = (function() {
		function addAttrs( el, obj, context ) {
			for( var attr in obj ){
				switch( attr ) {
				case 'tag' :
					break;
				case 'html' :
					el.innerHTML = obj[ attr ];
					break;
				case 'css' :
					for( var style in obj.css ) {
						$(el).css( style, obj.css[ style ] );
					}
					break;
				case 'text' : case 'child' : case 'children' :
					createNode( obj[attr], el, context );
					break;
				case 'cls' :
					el.className = obj[attr];
					break;
				case 'data' :
					for( var data in obj.data ) {
						$.fn.data( el, data, obj.data[data] );
					}
					break;
				default :
					if( attr.indexOf("on") === 0 && $.isFunction(obj[attr]) ) {
						$.event.add( el, attr.substr(2).replace(/^[A-Z]/, function(a) { return a.toLowerCase(); }), obj[attr] );
					} else {
						$( el ).attr( attr, obj[attr] );
					}
				}
			}
		}

		function createNode(obj, parent, context) {
			if(obj && ($.isArray(obj) || obj.selector === "")) {
				for(var ret = [], i = 0; i < obj.length; i++) {
					var newNode = createNode(obj[i], parent, context);
					if(newNode) {
						ret.push(newNode);
					}
				}
				return ret;
			}
			var el;
			if(typeof(obj) === 'string') {
			  el = context.createTextNode(obj);
			} else if(!obj) {
				return undefined;
			} else if(obj.nodeType === 1) {
				el = obj;
			} else {
        if($.support.useHTMLForInputType && obj.tag && obj.tag.match(/input|button/i)) {
          el = context.createElement("<"+obj.tag + ( obj.type ? " type='"+obj.type+"'" : "" ) + ( obj.name ? " name='"+obj.name+"'" : "" ) + ( obj.checked ? " checked" : "" ) + ">");
          delete obj.type;
          delete obj.name;
        } else {
          el = context.createElement(obj.tag||'DIV');
        }
				addAttrs(el, obj, context);
			}
			if(parent){ parent.appendChild(el); }
			return el;
		};

		return function(elementDef, parentNode) {
			return createNode(elementDef, parentNode, (parentNode && parentNode.ownerDocument) || document);
		};

	})();

  ['after', 'prepend', 'before', 'append'].forEach( function( key, operator ) {
    var fn = $.fn[key];
    $.fn[ key ] = function( html ) {
      var node = null;
      if ( html && html.tag ) {
        node = create( html );
      }
      return fn.call( this, node || html );
    }
  } );

	// inject create into jquery internals so object definitions are treated as first class constructors (overrides non-public methods)
	var clean = $.clean;

  $.fn.clean = function( elems, context, fragment, scripts ) {
    for(var i = 0; i < elems.length; i++) {
      if( elems[i].tag )
        elems[i] = create( elems[i], null, context );
    }
    return clean( elems, context, fragment, scripts );
  };

  window.$ = window.Zepto = function( selector, context ) {
    if ( selector && selector.tag ) {
      selector = create( selector, null, context );
    }
    return $.call( this, selector, context );
  };

  window.Zepto.support = $.support;
  window.Zepto.create = $.create;
})(Zepto, window.document);

