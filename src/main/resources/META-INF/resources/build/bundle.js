
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.25.0' }, detail)));
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const log = (message, type = 'log') => {
      if (type === 'error') {
        if (console && typeof console.error === 'function') console.error(message);
      } else {
        if (console && typeof console.info === 'function') console.info(message);
      }
    };

    const error = message => log(message, 'error');

    const isGamepadSupported = () =>
      (navigator.getGamepads && typeof navigator.getGamepads === 'function') ||
      (navigator.getGamepads && typeof navigator.webkitGetGamepads === 'function') ||
      false;

    const emptyEvents = () => ({ action: () => {}, after: () => {}, before: () => {} });

    const MESSAGES = {
      ON: 'Gamepad detected.',
      OFF: 'Gamepad disconnected.',
      INVALID_PROPERTY: 'Invalid property.',
      INVALID_VALUE_NUMBER: 'Invalid value. It must be a number between 0.00 and 1.00.',
      INVALID_BUTTON: 'Button does not exist.',
      UNKNOWN_EVENT: 'Unknown event name.',
      NO_SUPPORT: 'Your web browser does not support the Gamepad API.'
    };

    const gamepad = {
      init: function(gpad) {
        let gamepadPrototype = {
          id: gpad.index,
          buttons: gpad.buttons.length,
          axes: Math.floor(gpad.axes.length / 2),
          axeValues: [],
          axeThreshold: [1.0],
          hapticActuator: null,
          vibrationMode: -1,
          vibration: false,
          mapping: gpad.mapping,
          buttonActions: {},
          axesActions: {},
          pressed: {},
          set: function(property, value) {
            const properties = ['axeThreshold'];
            if (properties.indexOf(property) >= 0) {
              if (property === 'axeThreshold' && (!parseFloat(value) || value < 0.0 || value > 1.0)) {
                error(MESSAGES.INVALID_VALUE_NUMBER);
                return;
              }
              this[property] = value;
            } else {
              error(MESSAGES.INVALID_PROPERTY);
            }
          },
          vibrate: function(value = 0.75, duration = 500) {
            if (this.hapticActuator) {
              switch (this.vibrationMode) {
                case 0:
                  return this.hapticActuator.pulse(value, duration);
                case 1:
                  return this.hapticActuator.playEffect('dual-rumble', {
                    duration: duration,
                    strongMagnitude: value,
                    weakMagnitude: value
                  });
              }
            }
          },
          triggerDirectionalAction: function(id, axe, condition, x, index) {
            if (condition && x % 2 === index) {
              if (!this.pressed[`${id}${axe}`]) {
                this.pressed[`${id}${axe}`] = true;
                this.axesActions[axe][id].before();
              }
              this.axesActions[axe][id].action();
            } else if (this.pressed[`${id}${axe}`] && x % 2 === index) {
              delete this.pressed[`${id}${axe}`];
              this.axesActions[axe][id].after();
            }
          },
          checkStatus: function() {
            let gp = {};
            const gps = navigator.getGamepads
              ? navigator.getGamepads()
              : navigator.webkitGetGamepads
              ? navigator.webkitGetGamepads()
              : [];

            if (gps.length) {
              gp = gps[this.id];
              if (gp.buttons) {
                for (let x = 0; x < this.buttons; x++) {
                  if (gp.buttons[x].pressed === true) {
                    if (!this.pressed[`button${x}`]) {
                      this.pressed[`button${x}`] = true;
                      this.buttonActions[x].before();
                    }
                    this.buttonActions[x].action();
                  } else if (this.pressed[`button${x}`]) {
                    delete this.pressed[`button${x}`];
                    this.buttonActions[x].after();
                  }
                }
              }
              if (gp.axes) {
                const modifier = gp.axes.length % 2; // Firefox hack: detects one additional axe
                for (let x = 0; x < this.axes * 2; x++) {
                  const val = gp.axes[x + modifier].toFixed(4);
                  const axe = Math.floor(x / 2);
                  this.axeValues[axe][x % 2] = val;

                  this.triggerDirectionalAction('right', axe, val >= this.axeThreshold[0], x, 0);
                  this.triggerDirectionalAction('left', axe, val <= -this.axeThreshold[0], x, 0);
                  this.triggerDirectionalAction('down', axe, val >= this.axeThreshold[0], x, 1);
                  this.triggerDirectionalAction('up', axe, val <= -this.axeThreshold[0], x, 1);
                }
              }
            }
          },
          associateEvent: function(eventName, callback, type) {
            if (eventName.match(/^button\d+$/)) {
              const buttonId = parseInt(eventName.match(/^button(\d+)$/)[1]);
              if (buttonId >= 0 && buttonId < this.buttons) {
                this.buttonActions[buttonId][type] = callback;
              } else {
                error(MESSAGES.INVALID_BUTTON);
              }
            } else if (eventName === 'start') {
              this.buttonActions[9][type] = callback;
            } else if (eventName === 'select') {
              this.buttonActions[8][type] = callback;
            } else if (eventName === 'r1') {
              this.buttonActions[5][type] = callback;
            } else if (eventName === 'r2') {
              this.buttonActions[7][type] = callback;
            } else if (eventName === 'l1') {
              this.buttonActions[4][type] = callback;
            } else if (eventName === 'l2') {
              this.buttonActions[6][type] = callback;
            } else if (eventName === 'power') {
              if (this.buttons >= 17) {
                this.buttonActions[16][type] = callback;
              } else {
                error(MESSAGES.INVALID_BUTTON);
              }
            } else if (eventName.match(/^(up|down|left|right)(\d+)$/)) {
              const matches = eventName.match(/^(up|down|left|right)(\d+)$/);
              const direction = matches[1];
              const axe = parseInt(matches[2]);
              if (axe >= 0 && axe < this.axes) {
                this.axesActions[axe][direction][type] = callback;
              } else {
                error(MESSAGES.INVALID_BUTTON);
              }
            } else if (eventName.match(/^(up|down|left|right)$/)) {
              const direction = eventName.match(/^(up|down|left|right)$/)[1];
              this.axesActions[0][direction][type] = callback;
            }
            return this;
          },
          on: function(eventName, callback) {
            return this.associateEvent(eventName, callback, 'action');
          },
          off: function(eventName) {
            return this.associateEvent(eventName, function() {}, 'action');
          },
          after: function(eventName, callback) {
            return this.associateEvent(eventName, callback, 'after');
          },
          before: function(eventName, callback) {
            return this.associateEvent(eventName, callback, 'before');
          }
        };

        for (let x = 0; x < gamepadPrototype.buttons; x++) {
          gamepadPrototype.buttonActions[x] = emptyEvents();
        }
        for (let x = 0; x < gamepadPrototype.axes; x++) {
          gamepadPrototype.axesActions[x] = {
            down: emptyEvents(),
            left: emptyEvents(),
            right: emptyEvents(),
            up: emptyEvents()
          };
          gamepadPrototype.axeValues[x] = [0, 0];
        }

        // check if vibration actuator exists
        if (gpad.hapticActuators) {
          // newer standard
          if (typeof gpad.hapticActuators.pulse === 'function') {
            gamepadPrototype.hapticActuator = gpad.hapticActuators;
            gamepadPrototype.vibrationMode = 0;
            gamepadPrototype.vibration = true;
          } else if (gpad.hapticActuators[0] && typeof gpad.hapticActuators[0].pulse === 'function') {
            gamepadPrototype.hapticActuator = gpad.hapticActuators[0];
            gamepadPrototype.vibrationMode = 0;
            gamepadPrototype.vibration = true;
          }
        } else if (gpad.vibrationActuator) {
          // old chrome stuff
          if (typeof gpad.vibrationActuator.playEffect === 'function') {
            gamepadPrototype.hapticActuator = gpad.vibrationActuator;
            gamepadPrototype.vibrationMode = 1;
            gamepadPrototype.vibration = true;
          }
        }

        return gamepadPrototype;
      }
    };

    const gameControl = {
      gamepads: {},
      axeThreshold: [1.0], // this is an array so it can be expanded without breaking in the future
      isReady: isGamepadSupported(),
      onConnect: function() {},
      onDisconnect: function() {},
      onBeforeCycle: function() {},
      onAfterCycle: function() {},
      getGamepads: function() {
        return this.gamepads;
      },
      getGamepad: function(id) {
        if (this.gamepads[id]) {
          return this.gamepads[id];
        }
        return null;
      },
      set: function(property, value) {
        const properties = ['axeThreshold'];
        if (properties.indexOf(property) >= 0) {
          if (property === 'axeThreshold' && (!parseFloat(value) || value < 0.0 || value > 1.0)) {
            error(MESSAGES.INVALID_VALUE_NUMBER);
            return;
          }

          this[property] = value;

          if (property === 'axeThreshold') {
            const gps = this.getGamepads();
            const ids = Object.keys(gps);
            for (let x = 0; x < ids.length; x++) {
              gps[ids[x]].set('axeThreshold', this.axeThreshold);
            }
          }
        } else {
          error(MESSAGES.INVALID_PROPERTY);
        }
      },
      checkStatus: function() {
        const requestAnimationFrame =
          window.requestAnimationFrame || window.webkitRequestAnimationFrame;
        const gamepadIds = Object.keys(gameControl.gamepads);

        gameControl.onBeforeCycle();

        for (let x = 0; x < gamepadIds.length; x++) {
          gameControl.gamepads[gamepadIds[x]].checkStatus();
        }

        gameControl.onAfterCycle();

        if (gamepadIds.length > 0) {
          requestAnimationFrame(gameControl.checkStatus);
        }
      },
      init: function() {
        window.addEventListener('gamepadconnected', e => {
          const egp = e.gamepad || e.detail.gamepad;
          log(MESSAGES.ON);
          if (!window.gamepads) window.gamepads = {};
          if (egp) {
            if (!window.gamepads[egp.index]) {
              window.gamepads[egp.index] = egp;
              const gp = gamepad.init(egp);
              gp.set('axeThreshold', this.axeThreshold);
              this.gamepads[gp.id] = gp;
              this.onConnect(this.gamepads[gp.id]);
            }
            if (Object.keys(this.gamepads).length === 1) this.checkStatus();
          }
        });
        window.addEventListener('gamepaddisconnected', e => {
          const egp = e.gamepad || e.detail.gamepad;
          log(MESSAGES.OFF);
          if (egp) {
            delete window.gamepads[egp.index];
            delete this.gamepads[egp.index];
            this.onDisconnect(egp.index);
          }
        });
      },
      on: function(eventName, callback) {
        switch (eventName) {
          case 'connect':
            this.onConnect = callback;
            break;
          case 'disconnect':
            this.onDisconnect = callback;
            break;
          case 'beforeCycle':
          case 'beforecycle':
            this.onBeforeCycle = callback;
            break;
          case 'afterCycle':
          case 'aftercycle':
            this.onAfterCycle = callback;
            break;
          default:
            error(MESSAGES.UNKNOWN_EVENT);
            break;
        }
        return this;
      },
      off: function(eventName) {
        switch (eventName) {
          case 'connect':
            this.onConnect = function() {};
            break;
          case 'disconnect':
            this.onDisconnect = function() {};
            break;
          case 'beforeCycle':
          case 'beforecycle':
            this.onBeforeCycle = function() {};
            break;
          case 'afterCycle':
          case 'aftercycle':
            this.onAfterCycle = function() {};
            break;
          default:
            error(MESSAGES.UNKNOWN_EVENT);
            break;
        }
        return this;
      }
    };

    gameControl.init();

    class GamepadEventManager {
        constructor(ps) {
            this.ps = ps;
        }
        connected(gamepad) {
            if (this.gamepad)
                return false;
            this.gamepad = gamepad;
            console.log("Gamepad detected.", gamepad);
            return true;
        }
        disconnected(e) {
            console.log("Gamepad disconnected.", this.gamepad);
        }
        watch() {
            gameControl.on('connect', (gamepad) => {
                if (!this.connected(gamepad))
                    return;
                gamepad.on('up', (e) => {
                    console.log("moving up");
                });
                gamepad.on('down', (e) => {
                    console.log("moving down");
                });
                gamepad.on('left', (e) => {
                    console.log("moving left");
                });
                gamepad.on('right', (e) => {
                    console.log("moving right");
                });
            });
        }
    }

    class GyroscopeEventManager {
        constructor(cps) {
            debugger;
            this.cps = cps;
        }
        handleOrientation(e) {
            debugger;
            console.log("orientation", e);
        }
        handleMotion(e) {
            debugger;
            console.log("motion", e);
        }
        watch() {
            debugger;
            window.addEventListener("deviceorientation", this.handleOrientation, true);
            window.addEventListener("devicemotion", this.handleMotion, true);
        }
    }

    class CursorPositionSynchronizer {
        constructor() {
            this.replied = false;
            this.pressed = false;
            this.direction = CursorPositionSynchronizer.DIRECTION_NONE;
            this.manageWebSocket();
        }
        manageWebSocket() {
            this.ws = new WebSocket("ws://" + location.host + "/cursor");
            this.ws.onopen = function () {
                console.log("Connected");
            };
            this.ws.onclose = function () {
                console.error("Disonnected");
            };
        }
        setPressed(value) {
            this.pressed = value;
        }
        isPressed() {
            return this.pressed;
        }
        moveUp() {
            this.pressed = true;
            this.direction |= CursorPositionSynchronizer.DIRECTION_UP;
        }
        moveDown() {
            this.pressed = true;
            this.direction |= CursorPositionSynchronizer.DIRECTION_DOWN;
        }
        moveLeft() {
            this.pressed = true;
            this.direction |= CursorPositionSynchronizer.DIRECTION_LEFT;
        }
        moveRight() {
            this.pressed = true;
            this.direction |= CursorPositionSynchronizer.DIRECTION_RIGHT;
        }
        stopMoving() {
            this.setPressed(false);
            this.direction = CursorPositionSynchronizer.DIRECTION_NONE;
        }
        send() {
            if (this.lastSentDirection !== undefined && this.lastSentDirection === this.direction) {
                console.log("Same direction as before.");
                return;
            }
            console.log("Sending:", this.direction);
            this.ws.send('' + this.direction);
            this.lastSentDirection = this.direction;
        }
    }
    CursorPositionSynchronizer.DIRECTION_LEFT = 8;
    CursorPositionSynchronizer.DIRECTION_RIGHT = 4;
    CursorPositionSynchronizer.DIRECTION_UP = 2;
    CursorPositionSynchronizer.DIRECTION_DOWN = 1;
    CursorPositionSynchronizer.DIRECTION_NONE = 0;

    class KeyboardEventManager {
        constructor(cps, ts) {
            this.cps = cps;
            this.ts = ts;
        }
        watch() {
            this.manageKeyUp();
            this.manageKeyDown();
        }
        manageKeyUp() {
            document.body.onkeyup = event => {
                switch (event.code) {
                    case "ArrowUp":
                    case "ArrowDown":
                    case "ArrowLeft":
                    case "ArrowRight":
                        this.cps.stopMoving();
                        this.cps.send();
                        break;
                }
            };
        }
        manageKeyDown() {
            document.body.onkeydown = event => {
                switch (event.code) {
                    case "ArrowUp":
                        this.cps.moveUp();
                        this.cps.send();
                        break;
                    case "ArrowDown":
                        this.cps.moveDown();
                        this.cps.send();
                        break;
                    case "ArrowLeft":
                        this.cps.moveLeft();
                        this.cps.send();
                        break;
                    case "ArrowRight":
                        this.cps.moveRight();
                        this.cps.send();
                        break;
                    default:
                        console.log("sending", event.keyCode);
                        //this.ts.send(event.keyCode);
                        break;
                }
            };
        }
    }

    class TypingSynchronizer {
        constructor() {
            this.manageWebSocket();
        }
        manageWebSocket() {
            this.ws = new WebSocket("ws://" + location.host + "/typing");
            this.ws.onopen = function () {
                console.log("Connected");
            };
            this.ws.onclose = function () {
                console.error("Disonnected");
            };
        }
        send(keycode) {
            this.ws.send('' + keycode);
        }
    }

    /* src\main\svelte\App.svelte generated by Svelte v3.25.0 */
    const file = "src\\main\\svelte\\App.svelte";

    function create_fragment(ctx) {
    	let textarea;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			attr_dev(textarea, "name", "");
    			attr_dev(textarea, "id", "");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			add_location(textarea, file, 24, 0, 995);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let gamepad;

    	function gamepadConnected(gp) {
    		gamepad = gp;
    	}

    	function gamepadDisconnected(e) {
    		gamepad = undefined;
    	}

    	const CURSOR_POSITION_SYNC = new CursorPositionSynchronizer();
    	const TYPING_SYNC = new TypingSynchronizer();

    	//const GEM:GamepadEventManager = new GamepadEventManager(CURSOR_POSITION_SYNC);
    	const KEM = new KeyboardEventManager(CURSOR_POSITION_SYNC, TYPING_SYNC);

    	const GYEM = new GyroscopeEventManager(CURSOR_POSITION_SYNC);

    	onMount(() => {
    		KEM.watch();
    		GYEM.watch();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		GamepadEventManager,
    		GyroscopeEventManager,
    		PositionSynchronizer: CursorPositionSynchronizer,
    		KeyboardEventManager,
    		TypingSynchronizer,
    		gamepad,
    		gamepadConnected,
    		gamepadDisconnected,
    		CURSOR_POSITION_SYNC,
    		TYPING_SYNC,
    		KEM,
    		GYEM
    	});

    	$$self.$inject_state = $$props => {
    		if ("gamepad" in $$props) gamepad = $$props.gamepad;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
