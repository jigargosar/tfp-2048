"use strict";

var G = {};

G.Assert = (function (ex, _) {
    ex.notNil = function (value) {
        if (_.isNil(value)) {
            throw new Error("Should be not nil = < " + value + " >")
        }
    };
    ex.argsNotNil = function (values) {
        var mapWithIndex = R.addIndex(R.map);
        mapWithIndex(ex.notNil, values);
    };
    ex.returnNotNil = function returnNotNil(fn) {
        return function () {
            var returnVal = fn.apply(null, arguments);
            ex.notNil(returnVal);
            return returnVal;
        }
    };
    ex.true = function (boolean, msg) {
        if (!boolean)
            throw new Error("Assert true failed: " + msg)
    };
    ex.positiveNumber = function (number, msg) {
        ex.true(_.is(Number, number) && number >= 0, msg)
    };
    ex.string = function (string, msg) {
        ex.true(_.is(String, string), msg)
    };
    ex.throwError = function (tag) {
        return function () {
            throw Error(tag + ": should never be called" + arguments)
        }
    };
    return ex;
})({}, R);

G.DOM = (function (_, a) {
    var bindOwn = function (prop, context) {
        return _.bind(context[prop], context);
    };
    var isNotEmpty = _.complement(_.isEmpty);
    var isNonEmptyString = _.both(_.is(String), isNotEmpty);

    var curryAndReturn2ndArg = function (fn) {
        return _.curryN(2, function () {
                var secondArg = arguments[1];
                a.notNil(secondArg);
                fn.apply(null, arguments);
                return secondArg;
            }
        )
    };

    var addClasses = curryAndReturn2ndArg(function (classList, element) {
        if (_.is(Array, classList)) {
            _.map(bindOwn("add", element.classList), classList);
        }
    });

    var removeClasses = curryAndReturn2ndArg(function (classList, element) {
        if (_.is(Array, classList)) {
            _.map(bindOwn("remove", element.classList), classList);
        }
    });


    var cssAttributesThatCanHaveIntValues = ["top", "left", "width", "height"];
    var appendPxStringIfValueNumber = function (value, key) {
        return _.contains(key, cssAttributesThatCanHaveIntValues) && _.is(Number, value) ? value + "px" : value;
    };
    var updateStyle = curryAndReturn2ndArg(function (style, element) {
            if (_.is(Object, style)) {
                Object.assign(element.style, _.mapObjIndexed(appendPxStringIfValueNumber, style));
            }
        }
    );
    var appendChildren = curryAndReturn2ndArg(function (children, element) {
        _.forEach(bindOwn("appendChild", element), children || []);
    });
    var setTextContent = curryAndReturn2ndArg(function (text, element) {
            if (text) { element.textContent = text; }
        }
    );
    var setAttributes = curryAndReturn2ndArg(function (attrs, element) {
            var setAttribute = _.flip(bindOwn("setAttribute", element));
            _.mapObjIndexed(setAttribute, attrs || {});
        }
    );
    var addEventListeners = curryAndReturn2ndArg(function (listenerMap, element) {
        var addEventListener = _.flip(bindOwn("addEventListener", element));
        _.mapObjIndexed(addEventListener, listenerMap || {});
    });

    var createElementNamed = function (name) {
        return document.createElement(name || "div");
    };

    var createElement = function (selector, attributes, children) {
        var tagName = _.match(/^[\w\-_]*/g, selector)[0] || "div";
        var classList = _.compose(_.map(_.tail), _.match(/\.[\w\-_]+/g))(selector);
        var id = _.map(_.tail, _.match(/#[\w\-_]+/g, selector))[0];
        // var attributes = _.match(/\[[\w\-_]+='[\w\-_]+']/g, selector);
        var element = createElementNamed(tagName);
        if (id) {
            element.id = id
        }
        addClasses(classList, element);

        if (_.type(attributes) === "Object") {
            updateStyle(attributes.style, element);
            var startsWithOn = _.test(/^on\w+$/);
            var listenerNames = _.filter(startsWithOn, _.keys(attributes));
            var listenerValues = _.values(_.pick(listenerNames, attributes));
            var removeOnPrefix = _.replace(/^on/, "");
            var listeners = _.zipObj(_.map(removeOnPrefix, listenerNames), listenerValues);
            addEventListeners(listeners, element);
            var removeFalseAttributes = function (value, name) {
                return !_.test(/.*ed$/g, name) || value;
            };
            var finalAttributes = _.compose(_.pickBy(removeFalseAttributes), _.omit(_.concat(["style"], listenerNames)))(attributes);

            setAttributes(finalAttributes, element);
        } else {
            children = attributes;
        }

        if (_.type(children) === "String") {
            setTextContent(children, element);
        } else if (_.type(children) === "Array") {
            appendChildren(children, element)
        }

        return element;
    };

    var parent = function (element) {
        return element.parentNode;
    };
    var maybeByID = function (id) {
        return document.getElementById(id);
    };
    return {
        createElement: createElement,
        setAttributes: setAttributes,
        updateStyle: updateStyle,
        addClasses: addClasses,
        removeClasses: removeClasses,
        byID: a.returnNotNil(function byID(id) {
                a.notNil(id);
                return maybeByID(id);
            }
        ),
        maybeByID: maybeByID,
        hasClass: _.curry(function (className, element) {
            return element.classList.contains(className);
        }),
        data: _.curry(function (name, element) {
            return element.getAttribute("data-" + name)
        }),
        preventDefault: function preventDefault(fn) {
            return function (event) {
                event.preventDefault();
                if (fn) fn(event);
            }
        },
        parent: parent,
        ancestor: _.curry(function (predicate, element) {
            return _.until(_.either(_.isNil, predicate), parent, element);
        }),
        mount: function (containerID, element) {
            var containerElement = maybeByID(containerID);
            if (containerElement) {
                containerElement.textContent = "";
                containerElement.appendChild(element);
            }
        }
    };
})(R, G.Assert);

G.Widgets = (function (exports, DOM, _) {
    var e = DOM.createElement;
    exports.createAndShowOverlay = function (children) {
        var overlay = e("#overlay.overlay.center-container", {
            onclick: function (event) {
                var target = event.target;
                if (target === overlay || DOM.hasClass("dispose-overlay", target)) {
                    dispose();
                }
            }
        }, children);
        var resizeToFitWindow = function () {
            DOM.updateStyle({height: window.innerHeight, width: innerWidth}, overlay);
        };
        var disposeOnEscape = function (event) {
            var ESC_KEY = 27;
            if (event.keyCode === ESC_KEY) {
                dispose()
            }
        };
        var dispose = function () {
            window.removeEventListener("resize", resizeToFitWindow);
            window.removeEventListener("keydown", disposeOnEscape);
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        };
        window.addEventListener("resize", resizeToFitWindow);
        window.addEventListener("keydown", disposeOnEscape);
        resizeToFitWindow();
        document.body.appendChild(overlay);
        setTimeout(function () {
            var firstInput = _.head(overlay.getElementsByTagName("input"));
            if (firstInput)firstInput.focus();
        }, 0);
        return {
            dispose: dispose
        }
    };
    return exports;
})({}, G.DOM, R);

G.Form = (function (_, e, DOM) {
    var optionElement = function (props) {
        return e("option", props, props.text);
    };
    var selectFormField = function (props) {
        var optionElements = _.map(optionElement, props.options);
        return e("select", {name: props.name}, optionElements);
    };
    var inputFormField = function (fieldData) {
        var props = {
            name: fieldData.name,
            value: fieldData.value || "",
            type: fieldData.type || "text",
            disabled: _.defaultTo(false, fieldData.disabled)
        };
        return e("input", props);
    };
    var formField = function (fieldData) {
        var inputElement = fieldData.type === "select" ? selectFormField(fieldData) : inputFormField(fieldData);
        return e(".row.col.xs12.m8.l9", {}, [
            e("label", fieldData.label),
            inputElement,
            e("label.error.hide", "")
        ]);
    };
    var valuesOf = function (name, form) {
        return _.compose(_.map(_.prop("value")), _.filter(_.propEq("name", name)))(form.elements);
    };
    var valueOf = function (name, form) {
        return _.head(valuesOf(name, form));
    };
    var showErrorFor = function (name, message, form) {
        var input = _.find(_.propEq("name", name), form.elements);
        input.classList.add("error");
        var errorLabel = input.nextSibling;
        errorLabel.classList.remove("hide");
        errorLabel.textContent = message
    };
    var hideErrorFor = function (name, form) {
        var input = _.find(_.propEq("name", name), form.elements);
        input.classList.remove("error");
        var errorLabel = input.nextSibling;
        errorLabel.classList.add("hide");
        errorLabel.textContent = ""
    };
    var validate = _.curry(function (fieldData, form) {
        var validateFn = fieldData.validate;
        var name = fieldData.name;
        var message = validateFn ? validateFn(valueOf(name, form)) : null;
        if (message) {
            showErrorFor(name, message, form);
            return false;
        } else {
            hideErrorFor(name, form);
            return true;
        }
    });
    return {
        create: function (formContent, onSubmit) {
            return e("form", {
                onsubmit: DOM.preventDefault(onSubmit)
            }, [
                e("", formContent)
            ]);
        },
        valueOf: valueOf,
        valuesOf: valuesOf,
        fields: function (fieldDataList) {
            return _.map(formField, fieldDataList)
        },
        validateFields: function (fieldDataList, form) {
            return _.all(_.equals(true), _.map(validate(_.__, form), fieldDataList));
        },
        isNumberInRange: function (fieldValue, min, max) {
            var fieldIntValue = parseInt(fieldValue, 10);
            return fieldIntValue >= min && fieldIntValue <= max;
        }
    };
})(R, G.DOM.createElement, G.DOM);

G.DateTime = (function (_, A) {
    var SECONDS = 1000;
    var MINUTES = 60 * SECONDS;
    var HOURS = 60 * MINUTES;
    var DAYS = 24 * HOURS;
    var parse = function (dateTimeString) {
        var split = _.split(/ |:|-/, dateTimeString);
        var date = new Date(+split[0], +split[1] - 1, +split[2], +split[3], +split[4], +split[5], 0, 0);
        return date.getTime()
    };
    var truncateTime = function (milli) {
        A.positiveNumber(milli);
        var date = new Date(milli);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date.getTime();
    };

    function pad2(num) {
        var numS = String(num);
        return numS.length === 2 ? numS : "0" + num;
    }

    var formatTime = function (milli) {
        A.positiveNumber(milli);
        var date = new Date(+milli);
        return pad2(date.getHours()) + ":" + pad2(date.getMinutes())
    };
    var formatDate = function (milli) {
        A.positiveNumber(milli);
        var date = new Date(+milli);
        return pad2(date.getDate()) + "-" + pad2(date.getMonth() + 1) + "-" + date.getFullYear()
    };
    var formatDateTime = function (milli) {
        return formatDate(milli) + " " + formatTime(milli);
    };
    var pad2AndConcat = _.compose(_.join(""), _.map(pad2));
    var normalizeDate = function (milli) {
        A.positiveNumber(milli);
        var date = new Date(+milli);
        var yearString = String(date.getFullYear());
        return yearString + pad2AndConcat([date.getMonth() + 1, date.getDate()]);
    };
    var normalizeTime = function (milli) {
        A.positiveNumber(milli);
        var date = new Date(+milli);
        return pad2AndConcat([date.getHours(), date.getMinutes()]);
    };
    var parseNormalizedTime = function (normalizedDateTimeString) {
        A.string(normalizedDateTimeString);
        var values = _.match(/^(\d{4,4})(\d{2,2})(\d{2,2})(\d{2,2})(\d{2,2})(.*)$/, normalizedDateTimeString);
        var date = new Date();
        var toInt = function (intInString) {
            return parseInt(intInString, 10)
        };
        date.setFullYear(toInt(values[1]), toInt(values[2]) - 1, toInt(values[3]));
        date.setHours(toInt(values[4]), toInt(values[5]), 0, 0);
        return date.getTime();
    };
    return {
        SECONDS: SECONDS,
        MINUTES: MINUTES,
        HOURS: HOURS,
        DAYS: DAYS,
        parse: parse,
        truncateTime: truncateTime,
        parseAndTruncateTime: _.compose(truncateTime, parse),
        formatDate: formatDate,
        parseAndFormatDate: _.compose(formatDate, parse),
        formatTime: formatTime,
        parseAndFormatTime: _.compose(formatTime, parse),
        formatDateTime: formatDateTime,
        parseAndFormatDateTime: _.compose(formatDateTime, parse),
        normalizeDate: normalizeDate,
        normalizeDateTime: function (milli) {
            return normalizeDate(milli) + normalizeTime(milli);
        },
        parseNormalizedTime: parseNormalizedTime,
        toServerDateTimeFormat: function (milli) {
            var date = new Date(milli);
            var serverDateFormat = _.join("-", [date.getFullYear(), pad2(date.getMonth() + 1), pad2(date.getDate())]);
            var serverTimeFormat = _.compose(_.join(":"), _.map(pad2))([
                date.getHours(), date.getMinutes(), date.getSeconds()
            ]);
            return _.join(" ", [serverDateFormat, serverTimeFormat]);
        }
    }
})(R, G.Assert);

G.Property = function (value) {
    return function () {
        if (arguments.length === 1) {value = arguments[0]}
        return value;
    }
};

G.Util = (function (_) {
    return {
        time: function time(tag, fn) {
            var start = Date.now();
            var returnValue = fn();
            var elapsed = (Date.now() - start) / 1000;
            console.log("End " + tag + " : " + elapsed + "s");
            return returnValue;
        },
        timed: function timed(tag, fn) {
            var timed = function () {
                var args = arguments;
                return this.time(tag, function () {
                    return _.apply(fn, args);
                })
            };
            return _.bind(timed, this);
        },
        tap: _.curry(function (tag, value) {
            console.log(tag, ":", value);
            return value;
        }),
        logR: function (msg, value) {
            console.log(msg, value);
            return value;
        },
        objFromKeys: _.curry(function (valueFn, keys) {
            return _.zipObj(keys, _.map(valueFn, keys));
        }),
        objFromValues: _.curry(function (keyFn, list) {
            return _.zipObj(_.map(keyFn, list), list)
        }),
        partitionWithKeys: function (keyPair, predicate, list) {
            return _.zipObj(keyPair, _.partition(predicate, list))
        },
        parseInt: function (num) {
            return parseInt(num, 0);
        },
        freeze: function (obj) {
            return Object.freeze ? Object.freeze(obj) : obj;
        },
        fnEq: _.curryN(3, function (fn, value, obj) {
            return _.equals(fn(obj), value);
        }),
        mapWithIndex: _.addIndex(_.map),
        roundToOneDecimalPlaces: function (number) {
            var decimalPlaces = 10;
            return Math.round((number) * decimalPlaces) / decimalPlaces
        }
    };
})(R);

G.Store = (function (exports, _) {
    exports.create = function (reducer, initialState) {
        var observer;
        var states = initialState ? [initialState] : [];
        var currentStateIndex = 0;
        var fireObserver = function () {
            if (observer) {
                observer();
            }
        };
        var undo = function () {
            if (currentStateIndex >= states.length - 1) return;
            currentStateIndex++;
            fireObserver()
        };
        var redo = function () {
            if (currentStateIndex <= 0) return;
            currentStateIndex--;
            fireObserver()
        };
        var getState = function () {
            return states[currentStateIndex];
        };
        var dispatch = function (action) {
            if (action.type === "undo") {
                undo();
            } else if (action.type === "redo") {
                redo();
            } else if (_.is(Function, action)) {
                action(dispatch, getState);
            }
            else {
                states = _.slice(currentStateIndex, states.length, states);
                currentStateIndex = 0;
                var prevState = states[currentStateIndex];
                var nextState = reducer(prevState, action);
                states = _.prepend(nextState, states);
                fireObserver();
            }
        };
        return {
            setObserver: function (_observer) {
                observer = _observer;
            },
            dispatch: dispatch,
            actionDispatcher: function (type, values) {
                return function () {
                    return _.is(Function, type) ? dispatch(type) : dispatch(_.merge({type: type}, values));
                };
            },
            getState: getState
        };
    };
    return exports;
})({}, R);

G.SimpleModel = (function (_, u, A) {
    var propToGetter = u.objFromKeys(_.prop);

    var def = function (props, fn) {
        A.true(fn.length >= props.length);
        if (props.length === fn.length) {
            return defineDerivedProp(props, fn);
        } else {
            return defineDerivedFn(props, fn);
        }
    };

    var defineDerivedProp = function (props, reducer) {
        var cacheProps = null;
        var cacheResult = null;
        return function (model) {
            var propValues = _.map(_.apply(_.__, [model]), props);
            if (cacheProps) {
                var zipVal = _.zipWith(_.identical, propValues, cacheProps);
                var depsChanged = _.any(_.equals(false), zipVal);
                if (!depsChanged)
                    return cacheResult;
            }
            cacheProps = propValues;
            cacheResult = _.apply(reducer, propValues);
            return cacheResult;
        }
    };

    var defineDerivedFn = function (props, fn) {
        var derivedFn = _.curry(function (model, otherArgs) {
            var propValues = _.map(_.apply(_.__, [model]), props);
            return _.apply(fn, _.concat(propValues, otherArgs));
        });
        derivedFn.curryLength = fn.length - props.length + 1;
        return derivedFn;
    };

    var createDerivedFnInvokers = function (functionDefs) {
        return _.mapObjIndexed(function (fn, fnName) {
            return _.curryN(fn.curryLength || 1, function () {
                    var model = _.last(arguments);
                    return model[fnName](model, _.init(arguments));
                }
            )
        }, functionDefs);
    };

    var duplicateKeyError = function (key, left, right) {
        throw new Error("Duplicate key found: " + key);
    };

    var mergeStateWithDerivedPropSelectors = _.curry(function (derivedPropSelectors, state) {
        return u.freeze(_.mergeWithKey(duplicateKeyError, derivedPropSelectors, state));
    });

    var createDerivedPropGetters = function (selectorNames) {
        return u.objFromKeys(function (selectorName) {
            return function (model) {
                return model[selectorName](model);
            }
        }, selectorNames);
    };


    return function (propNames, createDerivedPropsFn) {
        var propGetters = _.merge({self: _.identity}, propToGetter(propNames));
        var newDerivedProps = function () {
            return createDerivedPropsFn(propGetters, def);
        };
        var derivedPropGetters = createDerivedFnInvokers(newDerivedProps());
        var getters = _.mergeWithKey(duplicateKeyError, derivedPropGetters, propGetters);
        // var newDerivedFns = function () {
        //     return createDerivedFns ? createDerivedFns(getters, defineDerivedFn) : {};
        // };
        return {
            stateToModel: function (state) {
                return mergeStateWithDerivedPropSelectors(newDerivedProps(), state);
            },
            getters: getters,
            update: function (values, model) {
                var safeValues = _.pick(propNames, values);
                return u.freeze(_.merge(model, safeValues));
            }
        };
    }
})(R, G.Util, G.Assert);

G.Math2D = {};
G.Math2D.Int = (function (_, u, A) {

    var isNumber = _.complement(isNaN);
    var validateArgsAreNumber = function (fn) {
        return _.curryN(fn.length, function () {
            A.true(_.all(isNumber, arguments));
            return _.apply(fn, arguments);
        });
    };

    var floatToInt = function (float) {
        return float | 0;
    };

    var normalizeReturnValues = function (fn) {
        return _.curryN(fn.length, function () {
            var returnVal = _.apply(fn, arguments);
            return _.map(floatToInt, returnVal);
        });
    };

    var decorator = _.compose(normalizeReturnValues, validateArgsAreNumber);

    return {
        point: decorator(function (x, y) {
            return {x: x, y: y};
        }),
        dimension: decorator(function (width, height) {
            return {width: width, height: height}
        }),
        rect: decorator(function (x, y, width, height) {
            return {x: x, y: y, width: width, height: height}
        }),
        rectOverlap: _.curry(function (r1, r2) {
            return r1.x <= r2.x + r2.width - 1 &&
                r2.x <= r1.x + r1.width - 1 &&
                r1.y <= r2.y + r2.height - 1 &&
                r2.y <= r1.y + r1.height - 1
        })

    }
})(R, G.Util, G.Assert);

