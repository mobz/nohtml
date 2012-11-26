JQueryNoHtml = TestCase("jQuery.create");

JQueryNoHtml.prototype = {
	testNameSpace: function() {
		assertThat(jQuery.support, hasMember("useHTMLForInputType"), "can't change input type feature detected");
		assertThat(jQuery, hasFunction("create"), "plugin installed in jquery namespace");
	},
	testSimpleCreate: function() {
		var el = jQuery.create({ tag: "DIV", cls: "foo" });
		assertThat(el.nodeType, is(1), "created DOM ELEMENT_NODE");
		assertThat(el.tagName, is("DIV"), "created a DIV");
	},
	
	testComplexCreate: function() {
		$("<div id=\"harness\"></div>").appendTo(document.body);
		var otherEl = $("<div class=\"foo\">foo</div>")[0];
		var testpoint = false;
		var complex = $.create(
			{ tag: "DIV", children: [
				// use the zeroth div to test setting attributes
				{ tag: "DIV",
					css: { border: "1px solid black", backgroundColor: "red" },
					cls: "class1 class2 class3",
					random123: "attribute456",
					id: "this_is_my_id",
					lang: "en-AU"
				},
				{ tag: "DIV", children: [
					"",
					0,
					true === true ? false : false,
					undefined,
					null,
					{}
				]	},
				{ tag: "DIV", 
					id: 'datadiv',
					onclick: function() { testpoint = true; },
					child: { tag: "input", type: "hidden", value: "shhh" },
					data: { foo: "bar", baz: 3, rel: otherEl }
				},
				{ tag: "DIV", 
					html: "<span title=\"something\">Something</span> else"
				},
				{ tag: "DIV", children: [
					{ tag: 'TABLE', cls: 'atable', children: [ 
						{ tag: "TBODY", children: [
							{ tag: 'TR', children: [
								{ tag: 'TD', text: "one" },
								{ tag: 'TD', text: "two" },
								{ tag: 'TD', text: "three" },
								{ tag: 'TD', id: 'moo', text: "four" }
							] }
						] }
					] }
				] },
				$.create( { tag: "DIV", id: "inner_create", children: $("<div>1</div><div>2</div><div>3</div>") } ),
				otherEl
			] }, document.getElementById("harness")
		);

		var root = $(complex);
		assertThat( root.children().length, is(7), "complex has 7 children fail");

		var div0 = $(complex.firstChild);
		assertThat( div0.hasClass("class2"), is(true), "div0 has class2 fail");
		assertThat( div0.css("border-left-width"), is("1px"), "div0 css set fail");
		assertThat( div0.attr('id'), is("this_is_my_id"), "set id attribute fail");
		assertThat( div0.attr('lang'), is("en-AU"), "set standard attribute fail");
		assertThat( div0.attr('random123'), is("attribute456"), "set non standard attribute fail");
		
		var div1 = div0.next();
		assertThat( div1[0].childNodes.length, is(2), "do not create falsy elements fail");
		assertThat( div1[0].childNodes[0].nodeType, is(3), "create empty text node fail");
		assertThat( div1[0].childNodes[1].nodeType, is(1), "create div in correct index fail");

		var div2 = $("#datadiv");
		assertThat( div2.length, is(1), "find created child element by id fail");
		div2.trigger("click");
		assertThat( testpoint, is(true), "click event set and fire fail");
		assertThat( div2.data('foo'), is("bar"), "data (direct) string set fail");
		assertThat( $.data(div2[0], 'rel'), is(otherEl), "data (static) reference set fail");
		assertThat( root.find("input").val(), is("shhh"), "find input element and match value fail");
		assertThat( root.find("input").attr("type"), is("hidden"), "modify ipput type at runtime fail");
		
		var div3 = div2.next();
		assertThat( div3.find("SPAN[title=something]").text(), is("Something"), "set innerHTML, find child by title and get text fail");

		var div4 = div3.next();
		assertThat( div4.find("TD").length, is(4), "create table and find children by tag name fail");
		assertThat( div4.find("#moo").text(), is("four"), "find child by id and get text fail");
		assertThat( div4.find("TABLE").hasClass("atable"), is(true), "find child and match class name fail");
		
		assertThat( $("#inner_create").length, is(1), "$.create inside $.create fail");
		assertThat( $("#inner_create").find("DIV").length, is(3), "$() inside $.create fail");
		assertThat( $("#inner_create").next().hasClass("foo"), is(true), "attach existing dom node to create structure fail");

		$("#harness").remove();
	},
	
	testJQueryBindings: function() {
		var harness = $("<div id=\"harness\"></div>").appendTo(document.body);
		
		var div0 = $({ tag: "DIV", id: "div0" });
		assertThat( div0, instanceOf(jQuery), "jquery didn't choke on a template fail");
		assertThat( div0.length, is(1), "jquery created a node fail");
		assertThat( div0.attr("id"), is("div0"), "jquery created a node with id fail");
		div0.appendTo(harness);
		assertThat( $("#div0").attr("id"), is("div0"), "jquery able to bind created element to body fail");
		
		div0.append({ tag: "DIV", id: "div1", text: "div1" });
		div0.prepend({ tag: "DIV", id: "div2", text: "div2" });
		div0.before({ tag: "DIV", id: "div3", text: "div3" });
		div0.after({ tag: "DIV", id: "div4", text: "div4" });
		assertThat( harness[0].innerHTML, is('<div id="div3">div3</div><div id="div0"><div id="div2">div2</div><div id="div1">div1</div></div><div id="div4">div4</div>'), "jquery clean overloading fail");

		$("#harness").remove();
	},
	
	testRadioButtonSelect: function() {
		var harness = $("<div id=\"harness\"></div>").appendTo(document.body);
		
		var r1 = $({ tag: "INPUT", type: "radio", name: "foo", value: "a", checked: true }).appendTo( harness );
		var r2 = $({ tag: "INPUT", type: "radio", name: "foo", value: "b", checked: false }).appendTo( harness );
		var r3 = $({ tag: "INPUT", type: "radio", name: "foo", value: "c" }).appendTo( harness );
		
		r2[0].click();	// dom click
		assertThat( r2.attr("checked"), is( "checked" ), "clicking on radio 2 changes selected state");
		r3[0].click();	// dom click
		assertThat( r3.attr("checked"), is( "checked" ), "clicking on radio 3 changes selected state");
		
		$("#harness").remove();
	},
	
	testUndefTypeAndName: function() {
		var harness = $("<div id=\"harness\"></div>").appendTo(document.body);
		
		var i1 = $({ tag: "INPUT" }).appendTo( harness );
		var i2 = $({ tag: "BUTTON" }).appendTo( harness );
		var i3 = $({ tag: "INPUT", type: "radio", name: "foo", value: "c", checked: true }).appendTo( harness );
				
		assertThat( i1.prop("type"), is( "text" ), "input given expected default type");
		assertThat( i1.prop("name"), is( "" ), "input given expected default name");
		assertThat( i2.prop("type"), is( "submit" ), "button given expected default type");
		assertThat( i2.prop("name"), is( "" ), "button given expected default name");
		assertThat( i3.prop("type"), is( "radio" ), "radio input works");
		assertThat( i3.prop("name"), is( "foo" ), "radio input has name");
		
		$("#harness").remove();
	}
};
