eruda.init({
	tool: ['console', 'info', 'elements', 'resources', 'network'],
	useShadowDom: true,
	defaults: {
		displaySize: 30,
		transparency: 0.95,
		theme: 'Dark',
		displayIfErr: true
	}
});
eruda._entryBtn._$el[0].innerHTML = '~';

eruda.add({
	name: 'Save as',
	initButton(description, action) {
		var $container = document.createElement('div');
		var $btn = document.createElement('button');
		$btn.classList.add('.eruda-save');

		$container.appendChild($btn);
		$btn.textContent = description;

		$btn.addEventListener('click', () => {
			window.parent.postMessage({action: action}, '*');
			eruda.get('console')._container.notify('Copied', {icon: 'success'});
		});
		return $container;
	},
	init($el) {
		this._$el = $el;
		this._$el[0].innerHTML = `<style>
			.eruda-save .flex-container {
				display: flex; flex-direction: column; justify-content: space-between;
			}
		 .eruda-save .column {
				flex: 1; margin: 10px;
			}
		.eruda-save .elements {
				display: flex; flex-direction: row; flex-wrap: wrap;
			}
			.eruda-save button { color: white; padding: 5px; margin: 3px; border: 1px solid black; cursor: pointer; }
			.eruda-save button:hover { border: 1px solid white }
		</style>
		<div class="eruda-save flex-container">
			<div class="eruda-save column">
				<h2>Offline</h2>
				<div id="offline" class="eruda-save elements"></div>
			</div>
			<div class="eruda-save column">
				<h2>Online</h2>
				<div id="online" class="eruda-save elements"></div>
			</div>
		</div>`;

		const offline = this._$el[0].querySelector('#offline');
		offline.appendChild(this.initButton('Result file', 'result-file'));
		offline.appendChild(this.initButton('Result dataURL', 'result-dataurl'));
		offline.appendChild(this.initButton('Offline editor', 'editor-file'));
		//offline.appendChild(this.initButton('Offline editor dataurl', 'editor-dataurl'));

		const online = this._$el[0].querySelector('#online');
		online.appendChild(this.initButton('Copy editor URL', 'editor-url'));
		online.appendChild(this.initButton('Open editor new tab', 'editor-tab'));
	},
	show() {
		this._$el.show();
	},
	hide() {
		this._$el.hide();
	},
	destroy() {}
});

eruda.add({
	name: 'Readme',
	init($el) {
		this._$el = $el;
		this._$el[0].innerHTML = `<style>.intro{width: 100%; height: 100%; background: #ddf;}</style>
		<iframe class='intro' loading='lazy' src="https://nikita-kun.github.io/code/intro"></iframe>`;
	},
	show() {
		this._$el.show();
	},
	hide() {
		this._$el.hide();
	},
	destroy() {}
});

document.addEventListener('DOMContentLoaded', async function () {
	let console = eruda.get('console');
	eruda.get('info')._infos = eruda.get('info')._infos.filter((i) => {
		return ["Device", "User Agent"].includes(i.name);
	});
	eruda.get('info')._render();
	//eruda.get('snippets')._snippets = eruda.get('snippets')._snippets.filter((i)=>{return ["Search Text","Border All","Fit Screen","Load Benchmark Plugin"].includes(i.name)});
	//eruda.get('snippets')._render()

	console.config.set('displayIfErr', false);
	console.config.set('displayExtraInfo', false);
	console.config.set('displayUnenumerable', true);

	//console.config.set('catchGlobalErr', false);
	//console.config.set('asyncRender', false);

	eruda.remove('settings');

	new MutationObserver((mutations) => {
		var pre = 'luna-console-';
		mutations.forEach((m) => {
			Array.from(m.addedNodes).forEach((n) => {
				var el = n && n.querySelector ? n.querySelector(`pre.${pre}code`) : null;
				if (el && el.innerHTML && el.innerHTML.startsWith(pre))
					el.innerHTML = el.innerHTML.replace(RegExp(`${pre}`,'g'),'')
			});
		});
	}).observe(eruda._$el[0], {
		childList: true,
		subtree: true
	});

	eruda.add(erudaFeatures);

	eruda.show();

	//Features to Info
	eruda._$el[0].querySelectorAll('.luna-tab-item[data-id=features]').forEach((el) => el.style = 'display:none');
	eruda.get('features')._initFeatures();
	setTimeout(() => {
		eruda.get('info')._style.el.innerHTML += eruda.get('features')._style.el.innerHTML;
		var featuresDiv = document.createElement('div');
		featuresDiv.classList.add('eruda-features');
		featuresDiv.innerHTML = eruda.get('features')._$el[0].innerHTML;
		featuresDiv.querySelectorAll('a').forEach((a) => {
			a.href = a.href.replace('http://', 'https://');
		});
		eruda.get('info').add('Features', featuresDiv.outerHTML);
		eruda.remove('features');
	}, 10000);


	//Desktop console
	var newDiv = document.createElement("div");
	newDiv.classList.add("eruda-console");
	newDiv.classList.add("eruda-tool");
	var container = eruda._$el[0].querySelector('.eruda-console');
	newDiv.id = "eruda-console-flex";

	while (container.firstElementChild) {
		const el = container.firstElementChild;
		el.remove();
		newDiv.appendChild(el);
	}

	container.append(newDiv);
	var style = document.createElement('style');
	style.innerHTML = `#eruda-console-flex{
		display: flex;
		flex-direction: column;
		padding-bottom:0;
	}	
	#eruda-console #eruda-console-flex .eruda-js-input{
		position:relative;
	}
	#eruda-console #eruda-console-flex .eruda-control {
		position: relative;
	}
	#eruda-console #eruda-console-flex .eruda-js-input.eruda-active{
		min-height: calc(100% - 120px);
		position: unset;
		border-top: 2px solid #3d3d3d;
		padding-top:0px;
	}
	.luna-console-logs{
		user-select:text;
	}
	#eruda-console #eruda-console-flex .eruda-js-input.eruda-active textarea{
	}
	#eruda-info .eruda-features li {
		width: unset;
	}`;
	eruda._$el[0].appendChild(style);

	eruda.startTyping = function (input = undefined) {
		eruda.show();
		eruda.show('console');
		var textarea = eruda._$el[0].querySelector('.eruda-js-input textarea');
		if (input !== undefined)
			textarea.value = input;

		window.getSelection().removeAllRanges();
		textarea.focus();
	};

	//Enabling copying of selected log element
	eruda._$el[0].querySelector('.luna-console-logs').setAttribute('tabindex', 0);
	eruda._$el[0].querySelector('.luna-console-logs').addEventListener('dblclick', () => {
		eruda.copySelectedLog();
	});
	eruda._$el[0].querySelector('.luna-console-logs').addEventListener('keydown', (event) => {
		if (event.key == 'c' && event.ctrlKey && !window.getSelection().toString()) {
			event.preventDefault();
			eruda.copySelectedLog();
		}
	});

	eruda.copySelectedLog = function () {
		var textarea = eruda._$el[0].querySelector('.eruda-console textarea');
		var selectedLog = eruda.get('console')._selectedLog.args[0];

		if (!selectedLog)
			return;
		selectedLog = selectedLog.message || selectedLog;
		selectedLog = !selectedLog.toString().startsWith('[object') ? selectedLog : JSON.stringify(selectedLog);

		eruda._$el[0].querySelector('.eruda-console .eruda-control .eruda-copy').click();
		eruda.startTyping(selectedLog);
		textarea.select();
		textarea.setSelectionRange(0, textarea.value.length);
		document.execCommand('copy');
	};

	//submit on Alt+Enter
	var clearButton = document.createElement('div');
	clearButton.innerHTML = 'Clear';
	clearButton.classList.add('eruda-button');
	clearButton.classList.add('eruda-clear');
	clearButton.addEventListener('click', () => eruda.startTyping(''));
	eruda._$el[0].querySelector('.eruda-button.eruda-execute').innerHTML = 'OK';
	eruda._$el[0].querySelector('.eruda-button.eruda-execute').parentNode.insertBefore(clearButton, eruda._$el[0].querySelector('.eruda-button.eruda-execute'));
	eruda._$el[0].querySelector('.eruda-console textarea').addEventListener('keydown', (event) => {
		if (event.altKey && event.key == 'Enter') {
			event.preventDefault();
			eruda._$el[0].querySelector('.eruda-execute').click();
		}
	});
	document.addEventListener('keydown', (event) => {
		if (event.key == 'Escape') {
			eruda.hide();
		}
		if (event.key == 's' && event.ctrlKey) {
			event.preventDefault();
			window.parent.postMessage({action: 'refresh'}, '*');
		}
		if (event.code === 'Backquote' && !event.target.matches('input, textarea, #eruda')) {
			event.preventDefault();
			eruda.startTyping();
		}
		if (event.key == 'e' && event.ctrlKey) {
			event.preventDefault();
			window.parent.postMessage({action: 'editor-focus'}, '*');
		}
	});

	eruda._$el[0].querySelector('.eruda-entry-btn').ondblclick = () => {
		window.parent.postMessage({action: 'refresh'}, '*');
	};

	eruda._$el[0].querySelector('.eruda-execute').addEventListener('click', () => setTimeout(() => {
			try {
				eruda._$el[0].querySelector('.eruda-js-input > textarea').value = eruda.get('console')._logger.logs.filter((log) => log.type == 'input').at(-1).args.join();
			} catch (e) {
				console.error(e);
			}
		}, 100));

});
