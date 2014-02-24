function negate(fn) {
  return function () {
		return !fn.apply(this, arguments);
  }
}

function nop() {}

function identity(x) {
  return x;
}

function assert(x, msg) {
	if (!x)
		throw msg;
}

var Enumerable = make({
  container: make.required,
  every: make.required.function,
  some: function (fn, ctx) {
		return !this.every(negate(fn), ctx);
  },
  forEach: function (fn, ctx) {
		this.every(function () {
			fn.apply(this, arguments);
			return true;
		});
  },
  map: function (fn, ctx) {
		var i = this.$Maker.create();

		this.forEach(function (val, key) {
			i.container[key] = fn.apply(ctx, arguments);
		});

		return i;
  },
});

var List = make(function () {
  this.container = [];
}, {
  container: null,
  every: function (fn, ctx) {
		return this.container.every(fn,ctx)
  },
  add: function (x) {
		this.container.push(x);
  },
  length: function () {
  	return this.container.length;
  }
}).inherit(Enumerable);

var Dictionary = make(function () {
  this.container = Object.create(null);
}, {
  container: null,
  every: function (fn, ctx) {
		return Object.keys(this.container).every(function (key) {
  		return fn.call(ctx, this[key], key, this);
  	}, this.container);
  },
  put: function (key, val) {
  	this.container[key] = val;
  },
  get: function (key) {
  	return this.container[key];
  }
}).inherit(Enumerable);

var l = List.create();

l.add(1);

var l2 = l.map(identity);

assert(l2.length() === 1, "Length should be 1");
assert(l2[0] === l[0], "l[0] should be 1");

var d = Dictionary.create();

d.put("Wizard", "Merlin");

var d2 = d.map(identity);

d2.put("Tomte", "Far");

assert(d2.every(function (v) {return typeof v === "string"}), "Values should be strings");

d.put("Age", 1335);

assert(d.some(function (v) {return typeof v === "number"}), "Does contain a number");
