// This script is deverable

"use strict";
window.addEventListener('load', function(e) {
	function element(id) {
		return document.getElementById(id);
	}


	var errors = [];
	var BrowserPlatform = jsx.Platform.extend({
		load: function (name) {
			var src = element(name);
			if(src != null) {
				return src.value;
			}

			// synchronous XHR
			var xhr = new XMLHttpRequest();
			xhr.open("GET", name, false);
			xhr.send(null);
			return xhr.responseText;
		},

		error: function (s) {
			console.error(s);
			errors.push(s);
		}
	});
	var platform = new BrowserPlatform();

	var list   = element('source-list');

	var input  = element('input');
	var output = element('output');

	function saveInput(input) {
			var s = input.selectionStart;
		var session = {
			source:         input.value,
			selectionStart: input.selectionStart,
			selectionEnd:   input.selectionEnd
		};

		sessionStorage.setItem("jsx.session", JSON.stringify(session));
	}

	function retrieveInput(input) {
		var serializedSession = sessionStorage.getItem("jsx.session");
		if(serializedSession) {
			var session = JSON.parse(serializedSession);

			input.value = session.source;
			input.setSelectionRange(session.selectionStart,
									session.selectionEnd);

			compile({ mode: 'compile' });
		}
	}

	function compile(options) {
		console.log('compile with ' + JSON.stringify(options));

		saveInput(input);

		output.value = '';

		var c = new jsx.Compiler(platform);
		switch(options.mode) {
		case "compile":
			c.setMode(jsx.Compiler.MODE_COMPILE);
			break;
		case "parse":
			c.setMode(jsx.Compiler.MODE_PARSE);
			  break;
		 default:
			alert("unknown mode: " + options.mode);
			return;
		}

		c.addSourceFile('input');

		var success = c.compile();
		console.log(c);

		if (success) {
			output.style.color = "black";
			output.value = c.getOutput();
		}
		else if(errors.length !== 0){
			output.style.color = "red";
			output.value = "ERROR!\n\n" + errors.join("\n");
			errors.length = 0;
		}
	}

	function forEach(collection, block) {
		for(var i = 0; i < collection.length; ++i) {
			block(collection[i]);
		}
	}

	// set up example souce files
	forEach(list.children, function(li) {
		if(li.className !== "source-file") return;

		var a = li.children[0];
		a.addEventListener('click', function(event) {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if(xhr.readyState !== 4)   return;
				if(xhr.status     !== 200) return;

				input.value = xhr.responseText;

				forEach(list.children, function(li) {
					li.className = "";
				});
				li.className = "active";

				setTimeout(function() {
					compile({ mode: "compile" });
				}, 0);
			};
			xhr.open("GET", "example/" + a.innerHTML);
			xhr.send(null);
		});
	});

	// hack to input TAB by the tab key
	input.addEventListener('keydown', function(event) {
		var TAB = "\t"
		if(event.keyCode === TAB.charCodeAt(0)) {
			event.stopPropagation();
			event.preventDefault();
			var s = input.selectionStart;
			var c = input.value;

			input.value = c.substring(0, s) +
						  TAB +
						  c.substring(s, c.length);
			var pos = s + TAB.length;
			input.setSelectionRange(pos, pos);
		}
	});

	window.addEventListener('keyup', function(event) {
		if(event.ctrlKey) {
			var COMPILE_KEY = "C".charCodeAt(0);
			var PARSE_KEY   = "P".charCodeAt(0);;

			if(event.keyCode === COMPILE_KEY) {
				compile({ mode: 'compile' });
			}
			else if(event.keyCode === PARSE_KEY) {
				compile({ mode: 'parse' });
			}
		}
	});

	element('compile').addEventListener('click',
			function(e) { compile({mode: 'compile'}) });
	element('parse').addEventListener('click',
			function(e) { compile({mode: 'parse'}) });

	retrieveInput(input);

	input.focus();
});