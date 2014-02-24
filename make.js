/**
 * Prototypal inheritance using an Object maker.
 * @copyright Oskar Segersvärd
 * version   0.1
 */

/*jshint indent: 2, node:true, eqnull:true */
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

  function toString(thing) {
    return Object.prototype.toString.call(thing);
  }

  function forOwn(obj, func, scope) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        func.call(scope, key, obj[key]);
      }
    }
  }

  function extend(target, source) {
    forOwn(source, function (key, val) {
      target[key] = val;
    });
    return target;
  }

  function toArray(args, x) {
    if (toString(args) === '[object Arguments]') {
      return Array.prototype.slice.call(args, x || 0);
    }
    if (Array.isArray(args)) {
      return args;
    }
    if (args != null) {
      return [];
    }
    return [args];
  }

  var makerMeths = {
    /** @type {boolean} */
    requirementsChecked: false,

    /**
     * Constructor function for Makers.
     * @param {Object=} opts
     * @return {Object}
     */
    create: function (opts) {
      if (!this.requirementsChecked) {
        validateRequirements(this);
      }

      var o = Object.create(this.meths);

      this.instas.forEach(function (constructor) {
        constructor.call(o, opts || Object.create(null));
      });

      return o;
    },

    /**
     * Inherit from other Makers.
     * @param {...Maker} makers
     */
    inherit: function () {
      toArray(arguments).forEach(function (maker) {
        if (!maker) {
          throw new Error('Maker undefined!');
        }

        forOwn(maker.meths, function (name, meth) {
          if (!this.hasOwnProperty(name) || isRequirement(this[name])) {
            this[name] = meth;
          }
        }, this.meths);

        maker.instas.forEach(function (func) {
          if (this.indexOf(func) === -1) {
            this.unshift(func);
          }
        }, this.instas);
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
   * @param {...Function|Object}
   * @return {Maker}
   */
  function make() {
    var maker = Object.create(makerMeths);

    maker.meths = {};
    maker.instas = [];

    toArray(arguments).forEach(function (param) {
      if (typeof param === 'object') {
        extend(maker.meths, param);
      } else if (typeof param === 'function') {
        maker.instas.push(param);
      }
    });

    if (!maker.meths.hasOwnProperty('$Maker')) {
      maker.meths.$Maker = maker;

      if (!maker.meths.hasOwnProperty('$clone')) {
        maker.meths.$clone = function () {
          return extend(maker.create(), this);
        };
      }
    }

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

    keys.forEach(function (key) {
      var val = this[key];
      if (isRequirement(val)) {
        throw new Error("Required " + val.type + " '" +
          key + "' not available!");
      }
    }, maker.meths);

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
