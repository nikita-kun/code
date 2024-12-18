let dependencies = {
	"codemirror": {
		"cdns": [ "https://cdn.jsdelivr.net/npm/codemirror@5.65.18/", "src/cdn/"],
		"items": ["lib/codemirror.min.js",
			"lib/codemirror.min.css",
			"theme/material.min.css",
			"mode/xml/xml.min.js",
			"mode/javascript/javascript.min.js",
			"mode/css/css.min.js",
			"mode/htmlmixed/htmlmixed.min.js",
			"addon/dialog/dialog.min.css",
			"addon/dialog/dialog.min.js",
			"addon/hint/show-hint.min.js",
			"addon/hint/show-hint.min.css",
			"addon/hint/anyword-hint.min.js",
			"addon/hint/html-hint.min.js",
			"addon/hint/xml-hint.min.js",
			"addon/hint/javascript-hint.min.js",
			"addon/hint/css-hint.min.js",
			"addon/edit/closebrackets.min.js",
			"addon/edit/closetag.min.js"]
	},
	"eruda": {
		"cdns": ["https://cdn.jsdelivr.net/npm/eruda@3.4.1/", "src/cdn/"],
		"items": ["eruda.min.js"]
	},
	"eruda-features": {
		"cdns": ["https://cdn.jsdelivr.net/npm/eruda-features@2.1.0/", "src/cdn/"],
		"items": ["eruda-features.min.js"]
	},
	"pako": {
		"cdns": ["https://cdn.jsdelivr.net/npm/pako@1.0.11/", "src/cdn/"],
		"items": ["dist/pako.min.js"]
	},
	"src": {
		"cdns": ["src/"],
		"items": ["code.css",
			"storage.js",
			"console.js",
			"default.html",
			"init.js"]
	}
};

let templates = ["eruda/eruda.min.js",
	"eruda-features/eruda-features.min.js",
	"src/storage.js",
	"src/console.js",
	"src/default.html"];
	
let preload = async function () {

	for (let name in dependencies) {
		for (let item in dependencies[name].items) {
			let depId = `${name}/${dependencies[name].items[item]}`;

			if (!document.querySelector(`[embed="${depId}"]`)) {

				for (let cdn in dependencies[name].cdns) {

					let response;
					let depSrc = `${dependencies[name].cdns[cdn]}${dependencies[name].items[item]}`;
					
					try {
						response = await fetch(depSrc);
					} catch (e) {
						console.log(depSrc, e);
					}
					
					if (!response || !(response.statusText === "OK" || response.status === 200))
						continue;

					let type, tag = "script";

					switch (true) {
						case templates.includes(depId):
							tag = "script";
							type = "text/template";
							break;
						case depSrc.endsWith(".css"):
							tag = "style";
							break;
					}

					let embed = document.createElement(tag);
					if (type)
						embed.type = type;
					embed.setAttribute("embed", depId);
					embed.innerHTML = await response.text();
					document.body.appendChild(embed);
					break;

				}
			}
		}
	}
	
	start();
};

preload();
document.querySelector('script[src="src/preload.js"]').remove();