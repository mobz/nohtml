TestCase("Zepto.create", {
	"test namespace": function() {
		assertThat(Zepto.support, hasMember("useHTMLForInputType"), "can't change input type feature detected");
		assertThat(Zepto, hasFunction("create"), "plugin installed in Zepto namespace");
	},

	"test simple create": function() {
		var el = Zepto.create({ tag: "DIV", cls: "foo" });
		assertThat(el.nodeType, is(1), "created DOM ELEMENT_NODE");
		assertThat(el.tagName, is("DIV"), "created a DIV");
	},

	"test complex create": function() {
    Zepto( "<div id='harness'>" ).appendTo( document.body );
    var otherEl = Zepto( "<div class='foo'>foo</div>").get( 0 );
    var testpoint = false;
    var complex = Zepto(
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
				Zepto( { tag: "DIV", id: "inner_create", children: Zepto("<div>1</div><div>2</div><div>3</div>") } ),
				otherEl
      ] }
    );
	},

	"test zepto binding": function() {
		var harness = $("<div id=\"harness\"></div>").appendTo(document.body);

		var div0 = $({ tag: "DIV", id: "div0" });
		assertThat( div0.length, is(1), "Zepto created a node fail");
		assertThat( div0.attr("id"), is("div0"), "Zepto created a node with id fail");
		div0.appendTo(harness);
		assertThat( $("#div0").attr("id"), is("div0"), "Zepto able to bind created element to body fail");

		div0.append({ tag: "DIV", id: "div1", text: "div1" });
		div0.prepend({ tag: "DIV", id: "div2", text: "div2" });
		div0.before({ tag: "DIV", id: "div3", text: "div3" });
		div0.after({ tag: "DIV", id: "div4", text: "div4" });
		assertThat( harness[0].innerHTML, is('<div id="div3">div3</div><div id="div0"><div id="div2">div2</div><div id="div1">div1</div></div><div id="div4">div4</div>'), "Zepto clean overloading fail");

		$("#harness").remove();
	},

	"test radio button select": function() {
		var harness = $("<div id=\"harness\"></div>").appendTo(document.body);

		var r1 = $({ tag: "INPUT", type: "radio", name: "foo", value: "a" });
		var r2 = $({ tag: "INPUT", type: "radio", name: "foo", value: "b" });
		var r3 = $({ tag: "INPUT", type: "radio", name: "foo", value: "c" });
    harness
      .append(r1)
      .append(r2)
      .append(r3);

		r2.trigger( "click" );	// dom click
		assertThat( r2.attr("checked"), is( true ), "clicking on radio 2 changes selected state");
		r3.trigger( "click" );	// dom click
		assertThat( r3.attr("checked"), is( true ), "clicking on radio 3 changes selected state");

		$("#harness").remove();
	},

	"test undef type and name": function() {
		var harness = $("<div id=\"harness\"></div>").appendTo(document.body);

		var i1 = $({ tag: "INPUT" });
		var i2 = $({ tag: "BUTTON" });
		var i3 = $({ tag: "INPUT", type: "radio", name: "foo", value: "c", checked: true });

    harness
      .append(i1)
      .append(i2)
      .append(i3);
		assertThat( i1.attr("type"), is( "text" ), "input given expected default type");
		assertThat( i1.attr("name"), is( "" ), "input given expected default name");
		assertThat( i2.attr("type"), is( "submit" ), "button given expected default type");
		assertThat( i2.attr("name"), is( "" ), "button given expected default name");
		assertThat( i3.attr("type"), is( "radio" ), "radio input works");
		assertThat( i3.attr("name"), is( "foo" ), "radio input has name");

		$("#harness").remove();
	}
});
