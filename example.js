var List = make(function (opt) {
	this.list = opt.list || [];
}, {
	add: function () {
		while (var i = 0; i < arguments.length; i++) {
			this.list.push(arguments[i]);
		}
	},

	get: function (i) {
		if (this.hasIndex(i)) {
			return this.list[i];
		}
	},

	hasIndex: function (i) {
		return i >= 0 && i < this.list.length;
	},

	clear: function () {
		this.list = [];
	},

	contains: function (val) {
		return this.indexOf(val) !== -1;
	},

	remove: function (val) {
		if (this.contains(val)) {
			this.list.splice(this.indexOf(val), 1);
		}
	},
	
	removeAll: function (val) {
		this.list = this.list.filter(function (other) {
			return val === other;
		});
	},

	removeIndex: function (i) {
		if (this.hasIndex(i)) {
			this.list.splice(i, 1);
		}
	},

	indexOf: function (val) {
		return this.list.indexOf(val);
	},

	toString: function () {
		return '[' + this.list.toString() + ']';	
	},

	getLength: function () {
		return this.list.length;
	}
});

var Stack = make({
	push: function (val) {
		this.add(val);
	},

	pop: function () {
		var last = this.getLength() - 1;
		var val = this.get(last);
		this.removeIndex(val)
		return val;
	}
}).inherit(List);

var Queue = make.mixin(List)
	.method('poll', function () {
		if (this.getLength() > 0) {
			var val = this.get(0);
			this.removeIndex(0);
			return val;
		}
	});

var Deque = make.mixin(Stack, Queue);
