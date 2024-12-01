function createStorage() {
	const data = {};

	const handler = {
		get(target, prop) {
			return prop in data ? data[prop] : target[prop];
		},
		set(target, prop, value) {
			data[prop] = value;
			return true;
		},
		deleteProperty(target, prop) {
			if (prop in data) {
				delete data[prop];
				return true;
			}
			return false;
		}
	};

	const storage = new Proxy({
		length: 0,
		clear() {
			for (const key in data) {
				delete data[key];
			}
		},
		key(index) {
			return Object.keys(data)[index] || null;
		},
		getItem(key) {
			return key in data ? data[key] : null;
		},
		setItem(key, value) {
			data[key] = String(value);
		},
		removeItem(key) {
			delete data[key];
		},
		toJSON() {
			return {...data};
		}
	}, handler);


	Object.defineProperty(storage, 'length', {
		get: function () {
			return Object.keys(data).length;
		}
	});

	return storage;
}

Object.defineProperty(window, 'localStorage', {
	value: createStorage(),
	writable: false,
	configurable: false,
});

Object.defineProperty(window, 'sessionStorage', {
	value: createStorage(),
	writable: false,
	configurable: false,
});


var cookie = new String();
Object.defineProperty(document, 'cookie', {
	value: cookie,
	writable: true,
	configurable: false,
});

window.cookie = cookie;
document.cookie = cookie;
document.requestStorageAccess = () => {
}

/*
 window.addEventListener('unhandledrejection', (event) => {
 console.warn('Unhandled rejection:', event);
 });
 window.addEventListener('error', (event) => {
 console.warn('Unhandled error:', event);
 });
 
 fetchOriginal = fetch */