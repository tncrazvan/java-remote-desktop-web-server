
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

    class GamepadButtonManager {
        constructor(code, delay = 0, action = () => console.log("Button", this.code, "has been pressed")) {
            this.time = 0;
            this.delay = 0;
            this.code = -1;
            this.gamepad = undefined;
            this.margin = 20;
            this.signalsPressed = 0;
            this.signalsReleased = 0;
            this.delay = delay;
            this.code = code;
            this.action = action;
        }
        setAction(callback) {
            this.action = callback;
        }
        setPressed(pressed) {
            if (pressed)
                this.time = Date.now();
            else
                this.time = 0;
        }
        isPressed() {
            return this.time > 0;
        }
        detect(gamepad) {
            for (let i = 0; i < gamepad.buttons.length; i++) {
                if (i === this.code) {
                    if (this.isPressed() && !gamepad.buttons[i].pressed) {
                        if (this.signalsReleased < this.margin) {
                            this.signalsReleased++;
                            break;
                        }
                        this.signalsReleased = 0;
                        const end = Date.now();
                        const age = (end - this.time);
                        if (age >= this.delay) {
                            this.action(this, age);
                        }
                        else {
                            console.warn("Button", this.code, "has only been pressed for", age, "milliseconds, expected", this.delay, "milliseconds.");
                        }
                        this.setPressed(false);
                    }
                    else if (!this.isPressed() && gamepad.buttons[i].pressed) {
                        if (this.signalsPressed < this.margin) {
                            this.signalsPressed++;
                            break;
                        }
                        this.signalsPressed = 0;
                        this.setPressed(true);
                    }
                    break;
                }
            }
        }
    }

    class GamepadEventManager {
        constructor(cps, mbs, ts) {
            this.gamepads = new Array();
            this.keyLeft = 37;
            this.keyRight = 39;
            this.keyUp = 38;
            this.keyDown = 40;
            this.mouseRight = 2;
            this.keyboardRequest = {};
            this.keyboardStatus = {};
            this.keyboardKeys = [
                this.keyLeft,
                this.keyRight,
                this.keyUp,
                this.keyDown
            ];
            this.mouseKeys = [
                this.mouseRight
            ];
            this.deltaTLeftStick = 0;
            this.release = 0;
            this.gamepadButtons = new Map();
            this.lastX = 0;
            this.lastY = 0;
            this.cps = cps;
            this.ts = ts;
            this.mbs = mbs;
        }
        /**
         *
         * @param code gamepad button code.
         * @param delay action will be trigger only if the button
         * has been pressed for this ammount of time (milliseconds).
         * @param action action to trigger.
         */
        setButtonEventListener(code, delay, callback) {
            const manager = new GamepadButtonManager(code, delay, (gbm, age) => {
                const result = callback(age);
                if (result.mouse && result.mouse.length && result.mouse.length > 0) {
                    result.mouse.forEach((c, i) => {
                        if (i === 0)
                            this.mbs.send(c);
                        else {
                            setTimeout(() => this.mbs.send(c), i * 10);
                        }
                    });
                }
                if (result.keyboard && result.keyboard.length && result.keyboard.length > 0) {
                    result.keyboard.forEach((c, i) => {
                        if (i === 0)
                            this.ts.send(c);
                        else {
                            setTimeout(() => this.ts.send(c), i * 10);
                        }
                    });
                }
            });
            this.gamepadButtons.set(code, manager);
        }
        getCps() {
            return this.cps;
        }
        setGamepad(gamepad) {
            this.gamepads[gamepad.index] = gamepad;
        }
        unsetGamepad(gamepad) {
            this.gamepads[gamepad.index] = undefined;
        }
        issetGamepad(gamepad) {
            return this.gamepads[gamepad.index] !== undefined;
        }
        //private lastCodeSent = -1;
        sendLeftStick(gamepad) {
            const min = 1;
            let x = parseFloat(gamepad.axes[0].toFixed(1));
            let y = parseFloat(gamepad.axes[1].toFixed(1));
            x = x == -0 || (x > 0 && x <= 0.1 * min) || (x < 0 && x >= -0.1 * min) ? 0 : x;
            y = y == -0 || (y > 0 && y <= 0.1 * min) || (y < 0 && y >= -0.1 * min) ? 0 : y;
            if (x < 0) {
                this.keyboardStatus[this.keyRight] = false;
                this.keyboardStatus[this.keyLeft] = true;
            }
            else if (x > 0) {
                this.keyboardStatus[this.keyRight] = true;
                this.keyboardStatus[this.keyLeft] = false;
            }
            else {
                this.keyboardStatus[this.keyRight] = false;
                this.keyboardStatus[this.keyLeft] = false;
            }
            if (y < 0) {
                this.keyboardStatus[this.keyUp] = true;
                this.keyboardStatus[this.keyDown] = false;
            }
            else if (y > 0) {
                this.keyboardStatus[this.keyUp] = false;
                this.keyboardStatus[this.keyDown] = true;
            }
            else {
                this.keyboardStatus[this.keyUp] = false;
                this.keyboardStatus[this.keyDown] = false;
            }
            this.keyboardKeys.forEach(key => {
                let statusKey = this.keyboardStatus[key];
                let requestKey = this.keyboardRequest[key];
                if (statusKey !== requestKey) {
                    if (statusKey) {
                        console.log("pressing", key);
                        this.ts.send(key);
                    }
                    else {
                        console.log("releasing", key);
                        this.ts.send(-key);
                    }
                    this.keyboardRequest[key] = statusKey;
                }
            });
        }
        sendRightStick(gamepad) {
            const min = 1;
            let x = parseFloat(gamepad.axes[2].toFixed(1));
            let y = parseFloat(gamepad.axes[3].toFixed(1));
            x = x == -0 || (x > 0 && x <= 0.1 * min) || (x < 0 && x >= -0.1 * min) ? 0 : x;
            y = y == -0 || (y > 0 && y <= 0.1 * min) || (y < 0 && y >= -0.1 * min) ? 0 : y;
            if (x !== 0 || y !== 0)
                this.cps.send(x, y);
        }
        sendButtons(gamepad) {
            gamepad.buttons.forEach((btn, i) => {
                if (btn.pressed) {
                    console.log("Button", i, "is pressed");
                }
            });
            gamepad.buttons.forEach((btn, i) => {
                if (this.gamepadButtons.has(i)) {
                    let manager = this.gamepadButtons.get(i);
                    manager.detect(gamepad);
                }
            });
        }
        loop(gamepad) {
            if (!this.issetGamepad(gamepad)) {
                console.warn("Closing gamepad loop.");
                return;
            }
            this.sendRightStick(gamepad);
            this.sendLeftStick(gamepad);
            this.sendButtons(gamepad);
            let gamepads = navigator.getGamepads();
            if (gamepads[gamepad.index])
                setTimeout(() => this.loop(gamepads[gamepad.index]), 0);
        }
        connected($this, e) {
            $this.setGamepad(e.gamepad);
            console.log("Gamepad connected", e.gamepad);
            setTimeout(() => this.loop(e.gamepad), 10);
        }
        watch() {
            window.addEventListener("gamepadconnected", (e) => this.connected(this, e));
        }
    }

    class MouseButtonSynchronizer {
        constructor() {
            this.manageWebSocket();
        }
        manageWebSocket() {
            this.ws = new WebSocket("ws://razshare.zapto.org/mouse-button");
            this.ws.onopen = function () {
                console.log("Mouse Button Synchronizer Connected");
            };
            this.ws.onclose = function () {
                console.error("Mouse Button Synchronizer Disonnected");
            };
        }
        send(btnCode) {
            this.ws.send("" + btnCode);
        }
    }

    class MousePositionSynchronizer {
        constructor() {
            this.manageWebSocket();
        }
        manageWebSocket() {
            this.ws = new WebSocket("ws://razshare.zapto.org/mouse-position");
            this.ws.onopen = function () {
                console.log("Cursor Position Synchronizer Connected");
            };
            this.ws.onclose = function () {
                console.error("Cursor Position Synchronizer Disonnected");
            };
        }
        send(x, y) {
            this.ws.send((x * 10).toFixed(0) + "x" + (y * 10).toFixed(0));
        }
    }

    class TypingSynchronizer {
        constructor() {
            this.manageWebSocket();
        }
        manageWebSocket() {
            this.ws = new WebSocket("ws://192.168.1.236/typing");
            this.ws.onopen = function () {
                console.log("Typing Synchronizer Connected");
            };
            this.ws.onclose = function () {
                console.error("Typing Synchronizer Disonnected");
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
    			add_location(textarea, file, 64, 0, 2318);
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

    const BUTTON_X = 0;
    const BUTTON_SQUARE = 2;
    const BUTTON_TRIANGLE = 2;
    const BUTTON_CIRCLE = 3;
    const BUTTON_LEFT_TRIGGER_1 = 4;
    const BUTTON_RIGHT_TRIGGER_1 = 5;
    const BUTTON_LEFT_TRIGGER_2 = 6;
    const BUTTON_RIGHT_TRIGGER_2 = 7;
    const BUTTON_SELECT = 8;
    const BUTTON_START = 9;
    const BUTTON_LEFT_STICK = 10;
    const BUTTON_RIGHT_STICK = 11;
    const BUTTON_ARROW_UP = 12;
    const BUTTON_ARROW_DOWN = 13;
    const BUTTON_ARROW_LEFT = 14;
    const BUTTON_ARROW_RIGHT = 15;

    // MOUSE KEY CODES
    const BUTTON_1 = 1024;

    const BUTTON_3 = 4096;

    //KEYBOARD KEY CODES
    const BUTTON_SPACE = 32;

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

    	const MOUSE_POSITION_SYNC = new MousePositionSynchronizer();
    	const MOUSE_BUTTON_SYNC = new MouseButtonSynchronizer();
    	const TYPING_SYNC = new TypingSynchronizer();
    	const GEM = new GamepadEventManager(MOUSE_POSITION_SYNC, MOUSE_BUTTON_SYNC, TYPING_SYNC);

    	onMount(() => {
    		GEM.setButtonEventListener(BUTTON_X, 0, time => {
    			return { keyboard: [BUTTON_SPACE, -BUTTON_SPACE] };
    		});

    		GEM.setButtonEventListener(BUTTON_SELECT, 0, time => {
    			return { mouse: [BUTTON_1, -BUTTON_1] };
    		});

    		GEM.setButtonEventListener(BUTTON_START, 0, time => {
    			return { mouse: [BUTTON_3, -BUTTON_3] };
    		});

    		let rightClickPressed = false;

    		GEM.setButtonEventListener(BUTTON_RIGHT_STICK, 200, time => {
    			if (rightClickPressed) {
    				rightClickPressed = !rightClickPressed;
    				return { mouse: [-BUTTON_3] }; //RELEASE BUTTON
    			} else {
    				rightClickPressed = !rightClickPressed;
    				return { mouse: [BUTTON_3] }; //PRESS BUTTON
    			}
    		});

    		GEM.watch();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		GamepadEventManager,
    		GamepadButtonManager,
    		MouseButtonSynchronizer,
    		MousePositionSynchronizer,
    		TypingSynchronizer,
    		BUTTON_X,
    		BUTTON_SQUARE,
    		BUTTON_TRIANGLE,
    		BUTTON_CIRCLE,
    		BUTTON_LEFT_TRIGGER_1,
    		BUTTON_RIGHT_TRIGGER_1,
    		BUTTON_LEFT_TRIGGER_2,
    		BUTTON_RIGHT_TRIGGER_2,
    		BUTTON_SELECT,
    		BUTTON_START,
    		BUTTON_LEFT_STICK,
    		BUTTON_RIGHT_STICK,
    		BUTTON_ARROW_UP,
    		BUTTON_ARROW_DOWN,
    		BUTTON_ARROW_LEFT,
    		BUTTON_ARROW_RIGHT,
    		BUTTON_1,
    		BUTTON_3,
    		BUTTON_SPACE,
    		gamepad,
    		gamepadConnected,
    		gamepadDisconnected,
    		MOUSE_POSITION_SYNC,
    		MOUSE_BUTTON_SYNC,
    		TYPING_SYNC,
    		GEM
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
