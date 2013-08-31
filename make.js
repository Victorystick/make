/**
 * Prototypal inheritance using an Object maker.
 * @copyright Oskar Segersvärd
 * version   0.1
 */

/*jshint indent: 2, node:true */
/*global define */

(function(global, definition) {
  'use strict';

  // Node
  if (typeof exports === 'object') {
    module.exports = definition();

  // RequireJS
  } else if (typeof define === 'function' && define.amd) {
    define(definition);

  // <script>
  } else {
    global.make = definition();
  }

})(this, function () {
  'use strict';

  function forEach(arr, func, scope) {
    if (!arr.length) return;

    arr.forEach(func, scope);
  }

  var makerMeths = {
    /** @type {boolean} */
    requireCheckNeeded: true,

    /**
     * Constructor function for Makers.
     */
    create: function () {
      var keys;
      if (this.requireCheckNeeded && (keys = Object.keys(this.meths))) {
        if (keys.length) {
          forEach(keys, function(key) {
            if (this[key] === make.required) {
              throw new Error('Required property ' + key + ' not available!');
            }
          }, this.meths);
          this.requireCheckNeeded = false;
        }
      }

      var o = Object.create(this.meths);

      forEach(this.instas, function (constructor) {
        constructor.call(o);
      });

      return o;
    },

    /**
     * Inherit from other Maker.
     */
    inherit: function (maker) {
      var name, meths = maker.meths;

      for (name in meths) {
        if (meths.hasOwnProperty(name) &&
            !this.meths.hasOwnProperty(name)
            || this.meths[name] === make.required) {
          this.meths[name] = meths[name];
        }
      }

      maker.instas.forEach(function (func) {
        if (this.instas.indexOf(func) === -1) {
          this.instas.push(func);
        }
      }, this);

      return this;
    },

    /**
     * Add method to instances.
     */
    method: function (name, func) {
      this.meths[name] = func;

      return this;
    },

    /**
     * Add initializer
     */
    initer: function (func) {
      this.instas.push(func);

      return this;
    }
  };

  /**
   * Make a new Maker based on the makerMeths.
   * @param {Function|Object=} constructor
   * @param {Object=} methods
   */
  function make(constructor, methods) {
    var maker = Object.create(makerMeths);

    if (typeof constructor === 'object') {
      methods = constructor;
      constructor = undefined;
    }

    maker.meths = methods || {};
    maker.instas = constructor ? [constructor] : [];
    maker.definedProps = [];

    return maker;
  }

  /**
   * Makes a new Maker which is a mixin of the given Makers.
   */
  make.mixin = function () {
    var mixins = Array.prototype.slice.call(arguments),
      i,
      o = make();

    for (i in mixins) {
      if (mixins.hasOwnProperty(i)) {
        o.inherit(mixins[i]);
      }
    }

    return o;
  };

  /**
   * @param {Function} constructor
   */
  make.fromConstructor = function(constructor) {
    return make(constructor, constructor.prototype);
  };

  /**
   * Constant object used to define requirements.
   */
  make.required = {};

  Object.keys(make).forEach(function(key) {
    Object.freeze(make[key]);
  });

  return Object.freeze(make);
});
