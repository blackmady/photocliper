const defaultDisplayMap = {};
module.exports= {
  getType(v) {
    return Object.prototype.toString.call('').slice(8, -1)
  },
  isObject(v) {
    return typeof v === 'object'
  },
  isNumber(v) {
    return typeof v === 'number';
  },
  isArray(v) {
    return Array.isArray(v)
  },
  isBoolean(v) {
    return typeof v === 'boolean'
  },
  isFunction(v) {
    return typeof v === 'function'
  },
  isPercent(v) {
    return /%$/.test(v + '');
  },
  isPlainObject(v) {
    return utils.getType(v === 'Object');
  },
  //类数组转数组
  toArray(v) {
    return Array.prototype.map.call(v, n => n);
  },
  bind(context, ...methods) {
    methods.forEach(method => {
      context[method] = context[method].bind(context);
    });
  },
  destroy(context) {
    Object.getOwnPropertyNames(context).forEach(prop => {
      delete context[prop];
    });
    context.__proto__ = Object.prototype;
  },
  extend() {
    const isArray = this.isArray
    const isObject = this.isObject
    const isBoolean = this.isBoolean
    const isFunction = this.isFunction
    const isPlainObject = this.isPlainObject
    let options, name, src, copy, copyIsArray,
      target = arguments[0] || {},
      toString = Object.prototype.toString,
      i = 1,
      length = arguments.length,
      deep = false;

    // 处理深拷贝
    if (isBoolean(target)) {
      deep = target;

      // Skip the boolean and the target
      target = arguments[i] || {};
      i++;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (!isObject(target) && !isFunction(target)) {
      target = {};
    }

    // 如果没有合并的对象，则表示 target 为合并对象，将 target 合并给当前函数的持有者
    if (i === length) {
      target = this;
      i--;
    }

    for (; i < length; i++) {

      // Only deal with non-null/undefined values
      if ((options = arguments[i]) != null) {

        // Extend the base object
        for (name in options) {
          src = target[name];
          copy = options[name];

          // 防止死循环
          if (target === copy) {
            continue;
          }

          // 深拷贝对象或者数组
          if (deep && copy &&
            ((copyIsArray = isArray(copy)) || isPlainObject(copy))) {

            if (copyIsArray) {
              copyIsArray = false;
              src = src && isArray(src) ? src : [];
            } else {
              src = src && isPlainObject(src) ? src : {};
            }

            target[name] = extend(deep, src, copy);

          } else if (copy !== undefined) { // 仅忽略未定义的值
            target[name] = copy;
          }
        }
      }
    }

    // Return the modified object
    return target;
  },
  createElement(parentNode, className, id, prop) {
    let elem = document.createElement('DIV');

    if (typeof className === 'object') {
      prop = className;
      className = null;
    }

    if (typeof id === 'object') {
      prop = id;
      id = null;
    }

    if (typeof prop === 'object') {
      for (let p in prop) {
        elem.style[p] = prop[p];
      }
    }

    if (className) elem.className = className;
    if (id) elem.id = id;

    parentNode.appendChild(elem);

    return elem;
  },
  removeElement(elem) {
    elem.parentNode && elem.parentNode.removeChild(elem);
  },
  /**
   * 让隐藏元素正确执行程序（IE9及以上浏览器）
   * @param elems  {DOM|Array} DOM元素或者DOM元素组成的数组
   * @param func   {Function}  需要执行的程序函数
   * @param target {Object}    执行程序时函数中 this 的指向
   */
  hideAction(elems, func, target) {
    if (typeof elems !== 'object') {
      elems = [];
    }

    if (typeof elems.length === 'undefined') {
      elems = [elems];
    }

    const hideElems = [],
      hideElemsDisplay = [];

    for (let i = 0, elem; elem = elems[i++];) {

      while (elem instanceof HTMLElement) {

        const nodeName = elem.nodeName;

        if (!elem.getClientRects().length) {
          hideElems.push(elem);
          hideElemsDisplay.push(elem.style.display);

          let display = defaultDisplayMap[nodeName];
          if (!display) {
            const temp = document.createElement(nodeName);
            document.body.appendChild(temp);
            display = window.getComputedStyle(temp).display;
            temp.parentNode.removeChild(temp);

            if (display === 'none') display = 'block';
            defaultDisplayMap[nodeName] = display;
          }

          elem.style.display = display;
        }

        if (nodeName === 'BODY') break;
        elem = elem.parentNode;
      }
    }

    if (typeof (func) === 'function') func.call(target || this);

    let l = hideElems.length;
    while (l--) {
      hideElems.pop().style.display = hideElemsDisplay.pop();
    }
  },
  // 返回指定属性在当前浏览器中的兼容前缀
  // 如果无需兼容前缀，则返回一个空字符串
  // all 是一个布尔值，如果为 true，则会返回包含前缀的属性名
  support(prop, all) {
    const returnProp = all ? prop : '';
    const testElem = document.documentElement;
    if (prop in testElem.style) return returnProp;

    const testProp = prop.charAt(0).toUpperCase() + prop.substr(1),
      prefixs = ['Webkit', 'Moz', 'ms', 'O'];

    for (let i = 0, prefix; prefix = prefixs[i++];) {
      if ((prefix + testProp) in testElem.style) {
        return '-' + prefix.toLowerCase() + '-' + returnProp;
      }
    }

    return returnProp;
  },
  attr(elem, prop, value) {
    if (typeof prop === 'object') {
      for (let p in prop) {
        elem[p] = prop[p];
      }
      return elem;
    }

    if (value === undefined) {
      return elem[prop];
    } else {
      elem[prop] = value;
      return elem;
    }
  },
  css(elem, prop, value) {
    const isObject = utils.isObject
    const isNumber = utils.isNumber
    const cssNumber = {
      'animationIterationCount': true,
      'columnCount': true,
      'fillOpacity': true,
      'flexGrow': true,
      'flexShrink': true,
      'fontWeight': true,
      'lineHeight': true,
      'opacity': true,
      'order': true,
      'orphans': true,
      'widows': true,
      'zIndex': true,
      'zoom': true
    };
    if (isObject(prop)) {
      for (let p in prop) {
        value = prop[p];
        if (isNumber(value) && !cssNumber[prop]) value += 'px';
        elem.style[p] = value;
      }
      return elem;
    }
    if (value === undefined) {
      return window.getComputedStyle(elem)[prop];
    } else {
      if (isNumber(value) && !cssNumber[prop]) value += 'px';
      elem.style[prop] = value;
      return elem;
    }
  },
  $(selector, context) {
    const toArray = utils.toArray
    if (selector instanceof HTMLElement) {
      return [selector];
    } else if (typeof selector === 'object' && selector.length) {
      return toArray(selector);
    } else if (!selector || typeof selector !== 'string') {
      return [];
    }

    if (typeof context === 'string') {
      context = document.querySelector(context);
    }

    if (!(context instanceof HTMLElement)) {
      context = document;
    }

    return toArray(context.querySelectorAll(selector));
  },
  getScale(w1, h1, w2, h2) {
    let sx = w1 / w2;
    let sy = h1 / h2;
    return sx > sy ? sx : sy;
  },
  pointRotate(point, angle) {
    let radian = angleToRadian(angle),
      sin = Math.sin(radian),
      cos = Math.cos(radian);
    return {
      x: cos * point.x - sin * point.y,
      y: cos * point.y + sin * point.x
    };
  }, angleToRadian(angle) {
    return angle / 180 * Math.PI;
  },
  loaclToLoacl(layerOne, layerTwo, x, y) {
    const hideAction = utils.hideAction
    x = x || 0;
    y = y || 0;
    let layerOneRect, layerTwoRect;
    hideAction([layerOne, layerTwo], function () {
      layerOneRect = layerOne.getBoundingClientRect();
      layerTwoRect = layerTwo.getBoundingClientRect();
    });
    return {
      x: layerTwoRect.left - layerOneRect.left + x,
      y: layerTwoRect.top - layerOneRect.top + y
    };
  },
  globalToLoacl(layer, x, y) {
    const hideAction = utils.hideAction
    x = x || 0;
    y = y || 0;
    let layerRect;
    hideAction(layer, function () {
      layerRect = layer.getBoundingClientRect();
    });
    return {
      x: x - layerRect.left,
      y: y - layerRect.top
    };
  }
}
