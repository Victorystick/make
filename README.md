make
====

A simple mixin library, defined with an UMD.

The make function takes any number of constructors and prototypes.
````javascript
make(/* constructors and prototypes */);
````
Already defined constructors can be incorperated into make by calling the `fromConstructor` method.


In the following example we define a naïve EventTarget mixin. Which we can create instances of.
````javascript
var EventTarget = make(function () {
  this._eventHandlers = {};
}, {
  on: function (type, callback) {
    if (!this._eventHandlers[type]) {
      this._eventHandlers[type] = [];
    }
    this._eventHandlers[type].push(callback);
  },
  off: function (type, callback) {
    this._eventHandlers[type].splice(
      this._eventHandlers[type].indexOf(callback), 1);
  },
  pub: function (type, data) {
    this._eventHandlers[type].forEach(function (fn) {
      fn(data);
    });
  }
});

var et = EventTarget.create();
````

Once a set of behaviour has been defined, it is easy to compose them. This can be done using the `mixin` method.
````javascript
var Queue = make(function () {
  this.queue = [];
}, {
  push: function (x) {
    this.queue.push(x);
  },
  pop: function (x) {
    return this.queue.pop();
  }
});

var EventedQueue = make.mixin(Queue, EventTarget);
````

Sometimes you may want to define more abstract behaviour, for instance a set of functions like the Array methods. By defining some properties of the extended objects to be required, make can warn you if you attempt to create something which does not have the required property. Below is a set of Enumberable functions. To mix them in, you need to have implemented an `every` method and a `container` property
````javascript
function negate(fn) {
  return function () {
		return !fn.apply(this, arguments);
  }
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
  }
});

var List = make([Enumerable], function () {
  this.container = [];
}, {
  container: null,
  every: function (fn, ctx) {
		return this.container.every(fn,ctx)
  }
});

var Dictionary = make([Enumerable], function () {
  this.container = Object.create(null);
}, {
  container: null,
  every: function (fn, ctx) {
		return Object.keys(this.container).every(function (key) {
  		return fn.call(ctx, this[key], key, this);
  	}, this.container);
  }
});

````
