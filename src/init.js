var params = {};
var editor;

if (window.location.href.includes('?'))
	document.head.innerHTML += `<meta http-equiv="refresh" content="0; url=${window.location.href.replace('?', '#')}" />`;

const htmlInput = document.getElementById('htmlInput');
const resizer = document.querySelector('.resizer');
const editorContainer = document.getElementById('editor');
const renderedContent = document.getElementById('renderedContent');
let isDragging = false;

function refresh() {

	const html = editor.getValue();
	htmlInput.innerHTML = html;
	const title = getTitle(html);

	updateTitle(title);

	if (html.length > 30000 && !params.htmlmixed)
		editor.setOption("mode", 'none');
	else if (editor.getOption('mode') === 'none')
		editor.setOption("mode", 'htmlmixed');

	window.location.href = `#${title ? 'title=' + title + '&' : ''}pak=${encodeURIComponent(btoa(pako.deflate(html, {to: 'string'})))}`;
	let open = '<head>', close='</head>', insertIndex = 0;
	switch (true){
		case html.indexOf("<head>") >= 0: 
			open = '', close = '';
			insertIndex = html.indexOf("<head>") + "<head>".length;
			break;
		case html.indexOf("<body>") >= 0:
			insertIndex = html.indexOf("<body>"); 
			break;
		case html.indexOf("</html>") >= 0:
			insertIndex = html.indexOf("</html>"); 
			break;
	}
	
	let modifiedHtml = '<!DOCTYPE html>' +
			html.slice(0, Math.max(insertIndex,0))
			+ open
			+ '<script>' + document.querySelector('[embed="src/storage.js"]').innerHTML + '<\/script>'
			+ '<script>' + document.querySelector('[embed="eruda/eruda@3.4.1"]').innerHTML + '<\/script>'
			+ '<script>' + document.querySelector('[embed="eruda/eruda-monitor@1.1.1"]').innerHTML + '<\/script>'
			+ '<script>' + document.querySelector('[embed="eruda/eruda-timing@2.0.1"]').innerHTML + '<\/script>'
			+ '<script>' + document.querySelector('[embed="eruda/eruda-features@2.1.0"]').innerHTML + '<\/script>'
			+ '<script>' + document.querySelector('[embed="src/console.js"]').innerHTML + '<\/script>'
			+ close
			+ html.slice(insertIndex);

	const encodedHtml = encodeURIComponent(modifiedHtml);
	const dataUrl = 'data:text/html;charset=utf-8,' + encodedHtml;
	renderedContent.src = dataUrl;
	renderedContent.focus();
}

function saveAsHTMLFile(data, name = 'result') {
	const link = document.createElement("a");
	const fragmentElement = document.createElement('fragment');
	fragmentElement.innerHTML = data;
	
	const titleElement = fragmentElement.querySelector('title'); 
	if (titleElement && titleElement.innerText)
		name = titleElement.innerText;
		
	link.href = URL.createObjectURL(new Blob([data], {type: "text/html"}));
	link.download = name + ".html";
	link.click();
}


function saveEditorAsHTMLFile(onlyReturnData = false) {
	let name = 'result';
	const link = document.createElement("a");
	let head = document.createElement('fragment');
	let body = document.createElement('fragment');
	head.innerHTML = document.querySelector('head').innerHTML;
	body.innerHTML = document.querySelector('body').innerHTML;

	body.querySelector(".CodeMirror").remove();
	name = head.querySelector("title").innerHTML.replaceAll(":", "");
	
	if (!document.body.hasAttribute("offline")){
		body.innerHTML += `<script>start();<\/script>`;
		name = "OFFLINE " + name;
	}
	
	head.querySelector("title").innerHTML = name;
	
	let data = `<!DOCTYPE html>
	<html lang="en" offline>
	<head>${head.innerHTML}</head>
	<body offline>${body.innerHTML}</body></html>`;
	
	if (onlyReturnData)
		return data;
	
	link.href = URL.createObjectURL(new Blob([data], {type: "text/html"}));	
	link.download = name + ".html";
	link.click();
}

function getTitle(data) {
	const link = document.createElement("a");
	const fragmentElement = document.createElement('fragment');
	fragmentElement.innerHTML = data;
	const titleElement = fragmentElement.querySelector('title');
	return titleElement && titleElement.innerText ? titleElement.innerText.replaceAll(' ', '') : null;
}

function updateTitle(title, prepend = "CODE: "){
	document.title = `${document.body.hasAttribute("offline") ? "OFFLINE " : ""}${prepend}${title ? title : ""}`;
}

//simplified licia.copy from eruda, find a way to avoid duplication, message data to iframe? >.<
function copyText(text) {
	var el = document.createElement('textarea');
	el.style = `fontSize: '12pt', position: 'absolute', left: '-9999px'`;
	el.value = text;
	document.body.appendChild(el);
	el.setAttribute('readonly', '');
	el.select();
	el.setSelectionRange(0, el.value.length);
	try {
		document.execCommand('copy');
	} catch (e) {
		console.error(e);
	} finally {
		document.body.removeChild(el);
	}
}

function start() {
	window.location.href.replace(/[#&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
		value = decodeURIComponent(value);
		if (key === 'pak') {
			key = 'input';
			value = pako.inflate(atob(value), {to: 'string'});
		}
		params[key] = parseInt(value) == value ? parseInt(value) : value;
	});

	if (params.input)
		htmlInput.innerHTML = params.input;

	if (params.result) {
		editorContainer.style.maxHeight = "0%";
	}

	if (params.url) {
		fetch(params.url)
				.then((data) => {
					return data.text();
				})
				.then((text) => {
					editor.setValue(text);
					refresh();
				});
	}

	if (!htmlInput.innerHTML)
		htmlInput.innerHTML = document.querySelector("[embed='src/default.html']").innerHTML;

	editor = CodeMirror.fromTextArea(htmlInput, {
		mode: "htmlmixed",
		theme: "material",
		autoCloseBrackets: true,
		autoCloseTags: true,
		indentWithTabs: true,
		matchBrackets: true,
		tabSize: 2,
		lineWrapping: true,
		lineNumbers: true,
		extraKeys: {
			"Ctrl-Space": "autocomplete",
			"Ctrl-E": () => {
			}
		}
	});

	editor.setSize("100%", "100%");
	refresh();
}

document.addEventListener('keydown', (event) => {
	if (event.key === 's' && event.ctrlKey) {
		event.preventDefault();
		refresh();
	}
});

window.addEventListener('message', async function (event) {
	try {
		var action = event.data.action ? event.data.action : null;
	} catch (e) {
		console.error(e);
	}

	console.log(event.data);
	switch (action) {
		case 'result-file':
			saveAsHTMLFile(editor.getValue());
			break;
		case 'editor-file':
			saveEditorAsHTMLFile();
			break;
		case 'editor-dataurl':
			copyText(`data:text/html;charset=utf-8;base64,${btoa(saveEditorAsHTMLFile(true))}`);
			break;
		case 'result-dataurl':
			copyText(`data:text/html;charset=utf-8;base64,${btoa(editor.getValue())}`);
			break;
		case 'editor-url':
			if (document.querySelector('body[offline]'))
				copyText("https://nikita-kun.github.io/code/"+window.location.hash);
			else 
				copyText(location.href);
			break;
		case 'editor-tab':
				window.open(location.href);
			break;
		/*case 'result-url':
			copyText(`${location.origin}${location.pathname}#result=1&${(getTitle(editor.getValue())) ? 'title=' + getTitle(editor.getValue()) + '&' : ''}${location.hash.substring(1)}`);
			break;*/
		/*case 'result-tab': window.open(`${location.origin}${location.pathname}#result=1&${(getTitle(editor.getValue())) ? 'title='+getTitle(editor.getValue())+'&' : ''}${location.hash.substring(1)}`); break; */
		case 'refresh':
			refresh();
			break;
		case 'editor-focus':
			editor.focus();
			break;
	}
});

resizer.addEventListener('mousedown', (event) => {
	isDragging = true;
	event.preventDefault();
	renderedContent.style.pointerEvents = 'none';
	document.body.style.cursor = 'ns-resize';
});

document.addEventListener('mousemove', (event) => {
	if (isDragging) {
		event.preventDefault();
		const containerRect = document.querySelector('body').getBoundingClientRect();
		const offsetY = event.clientY - containerRect.top;
		const totalHeight = containerRect.height;
		const newHeightEditor = (offsetY / totalHeight) * 100;
		const newHeightIframe = 100 - newHeightEditor;
		editorContainer.style.maxHeight = newHeightEditor + '%';
		renderedContent.style.maxHeight = newHeightIframe + '%';
	}
});

document.addEventListener('mouseup', () => {
	isDragging = false;
	renderedContent.style.pointerEvents = 'auto';
	document.body.style.cursor = '';
});