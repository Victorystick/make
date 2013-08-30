var List = make(function() {
	this.list = [];
}, {
	add: function(val) {
		if (arguments.length) {
			this.list.push(val);
		}
	},

	get: function(i) {
		if (this.hasIndex(i)) {
			return this.list[i];
		}
	},

	hasIndex: function(i) {
		return i >= 0 && i < this.list.length;
	},

	clear: function() {
		this.list = [];
	},

	contains: function(val) {
		return this.indexOf(val) !== -1;
	},

	remove: function(val) {
		if (this.contains(val)) {
			this.list.splice(this.indexOf(val), 1);
		}
	},

	removeIndex: function(i) {
		if (this.hasIndex(i)) {
			this.list.splice(i, 1);
		}
	},

	indexOf: function(val) {
		return this.list.indexOf(val);
	},

	toString: function() {
		return '[' + this.list.toString() + ']';	
	},

	getLength: function() {
		return this.list.length;
	}
});

var Stack = make(function() {}, {
	push: function(val) {
		this.add(val);
	},

	pop: function() {
		var last = this.getLength() - 1;
		var val = this.get(last);
		this.removeIndex(val)
		return val;
	}
}).inherit(List);

var Queue = make.mixin(List)
	.method('poll', function() {
		if (this.getLength() > 0) {
			var val = this.get(0);
			this.removeIndex(0);
			return val;
		}
	});

var Observable = make(function() {
	for (var prop in this) {
		if (prop === 'log' || prop === 'toString') continue;

		if (typeof this[prop] !== 'function') continue;

		this[prop] = (function(prop, func) {

			return function() {
				this.log(prop, JSON.stringify(Array.prototype.slice.call(arguments)));
				return func.apply(this, arguments);
			};

		})(prop, this[prop]);

	}
},{
	log: function(meth, val) {
		console.log('Called "' + meth + '" with ' + val);
	}
});

var ObservableList = make.mixin(List, Observable);

var MutationObserver = make(function() {
	var store = {},
		listeners = {};

	for (var prop in this) {
		Object.defineProperty(this, prop, {
			set: function(val) {
				var old = store[prop];
				inform(prop, old, val);
				store[prop] = val;
			},
			get: function() {
				return store[prop];
			}
		});
		store[prop] = prop;
	}

	function inform(prop, oldVal, newVal) {
		if (!listeners[prop]) return;

		listeners[prop].forEach(function(fn) {
			fn(oldVal, newVal);
		});
	}

	this.changed = function(prop, func) {
		listeners[prop] = listeners[prop]
			? listeners[prop].push(func)
			: [func];
	}

}, {});
