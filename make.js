/**
 * Prototypal inheritance using an Object maker.
 * @copyright Oskar Segersvärd
 * version   0.1
 */

/*jshint indent: 2, node:true */
/*global define */

(function (global, definition) {
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

  /**
   * @param {Array} arr
   * @param {Function} func
   * @param {Object=} scope
   */
  function forEach(arr, func, scope) {
    if (!arr.length) {
      return;
    }

    arr.forEach(func, scope);
  }

  function forOwn(obj, func, scope) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        func.call(scope, key, obj[key]);
      }
    }
  }

  // Arguments -> Array
  function toArray(args) {
    return Array.prototype.slice.call(args);
  }

  var makerMeths = {
    /** @type {boolean} */
    requirementsChecked: false,

    /**
     * Constructor function for Makers.
     * @return {Object}
     */
    create: function () {
      if (!this.requirementsChecked) {
        validateRequirements(this);
      }

      var o = Object.create(this.meths);

      forEach(this.instas, function (constructor) {
        constructor.call(o);
      });

      return o;
    },

    /**
     * Inherit from other Makers.
     * @param {...Maker} makers
     */
    inherit: function () {
      var meths;

      toArray(arguments).forEach(function (maker) {
        if (!maker) {
          throw new Error('Maker undefined!')
        }
        meths = maker.meths;

        forOwn(meths, function (name, meth) {
          if (!this.meths.hasOwnProperty(name) ||
              isRequirement(this.meths[name])) {
            this.meths[name] = meth;
          }
        }, this);

        forEach(maker.instas, function (func) {
          if (this.instas.indexOf(func) === -1) {
            this.instas.unshift(func);
          }
        }, this);
      }, this);

      return this;
    },

    /**
     * Add method to instances.
     * @param {string} name
     * @param {Function} func
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
   * @return {Maker}
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
   * @return {...Maker} makers
   * @return {Maker}
   */
  make.mixin = function () {
    return make().inherit(arguments);
  };

  /**
   * @param {Function} constructor
   * @return {Maker}
   */
  make.fromConstructor = function (constructor) {
    return make(constructor, constructor.prototype);
  };

  // REQUIREMENTS
  /**
   * @throws An Error if the required key is not defined.
   */
  function validateRequirements(maker) {
    var keys = Object.keys(maker.meths);

    if (keys.length) {
      forEach(keys, function (key) {
        var val = this[key];
        if (isRequirement(val)) {
          throw new Error("Required " + val.type + " '" +
            key + "' not available!");
        }
      }, maker.meths);
    }

    maker.requirementsChecked = true;
  }

  /**
   * @return {boolean}
   */
  function isRequirement(req) {
    return req === Object(req) && (req === requirement ||
      Object.getPrototypeOf(req) === requirement);
  }

  /**
   * Requirement constructor
   * @param {string} type
   */
  function requirement(type) {
    if (typeof type !== 'string' || type === 'type') {
      return;
    }
    if (!requirement[type]) {
      var req = Object.create(requirement);
      req.type = type;
      requirement[type] = req;
    }
    return requirement[type];
  }

  // Requirement type defaults to property
  requirement.type = 'property';

  // Predefined requirements
  [ 'function', 'array', 'object',
    'number', 'boolean', 'string' ].forEach(requirement);

  make.required = requirement;

  return Object.freeze(make);
});
