
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

    class GamepadEventManager {
        constructor(cps, ts) {
            this.gamepads = new Array();
            this.keyQ = 81;
            this.keyE = 69;
            this.keyW = 87;
            this.keyS = 83;
            this.keyLeft = 37;
            this.keyRight = 39;
            this.keyUp = 38;
            this.keyDown = 40;
            this.request = {};
            this.status = {};
            this.keys = [
                this.keyQ,
                this.keyE,
                this.keyW,
                this.keyS,
                this.keyLeft,
                this.keyRight,
                this.keyUp,
                this.keyDown
            ];
            this.deltaTLeftStick = 0;
            this.release = 0;
            this.lastX = 0;
            this.lastY = 0;
            this.cps = cps;
            this.ts = ts;
            this.request[this.keyQ] = false;
            this.request[this.keyE] = false;
            this.request[this.keyW] = false;
            this.request[this.keyS] = false;
            this.status[this.keyQ] = false;
            this.status[this.keyE] = false;
            this.status[this.keyW] = false;
            this.status[this.keyS] = false;
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
                this.status[this.keyRight] = false;
                this.status[this.keyLeft] = true;
            }
            else if (x > 0) {
                this.status[this.keyRight] = true;
                this.status[this.keyLeft] = false;
            }
            else {
                this.status[this.keyRight] = false;
                this.status[this.keyLeft] = false;
            }
            if (y < 0) {
                this.status[this.keyUp] = true;
                this.status[this.keyDown] = false;
            }
            else if (y > 0) {
                this.status[this.keyUp] = false;
                this.status[this.keyDown] = true;
            }
            else {
                this.status[this.keyUp] = false;
                this.status[this.keyDown] = false;
            }
            this.keys.forEach(key => {
                let statusKey = this.status[key];
                let requestKey = this.request[key];
                if (statusKey !== requestKey) {
                    if (statusKey) {
                        console.log("pressing", key);
                        this.ts.send(key);
                    }
                    else {
                        console.log("releasing", key);
                        this.ts.send(-key);
                    }
                    this.request[key] = statusKey;
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
        loop(gamepad) {
            if (!this.issetGamepad(gamepad)) {
                console.warn("Closing gamepad loop.");
                return;
            }
            this.sendRightStick(gamepad);
            this.sendLeftStick(gamepad);
            let gamepads = navigator.getGamepads();
            if (gamepads[gamepad.index])
                setTimeout(() => this.loop(gamepads[gamepad.index]), 10);
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

    class CursorPositionSynchronizer {
        constructor() {
            this.manageWebSocket();
        }
        manageWebSocket() {
            this.ws = new WebSocket("ws://razshare.zapto.org/cursor");
            this.ws.onopen = function () {
                console.log("Connected");
            };
            this.ws.onclose = function () {
                console.error("Disonnected");
            };
        }
        send(x, y) {
            x = (x * 10).toFixed(0);
            y = (y * 10).toFixed(0);
            this.ws.send(x + "x" + y);
        }
    }

    class TypingSynchronizer {
        constructor() {
            this.manageWebSocket();
        }
        manageWebSocket() {
            this.ws = new WebSocket("ws://192.168.1.236/typing");
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
    			add_location(textarea, file, 19, 0, 662);
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
    	const GEM = new GamepadEventManager(CURSOR_POSITION_SYNC, TYPING_SYNC);

    	onMount(() => {
    		GEM.watch();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		GamepadEventManager,
    		PositionSynchronizer: CursorPositionSynchronizer,
    		TypingSynchronizer,
    		gamepad,
    		gamepadConnected,
    		gamepadDisconnected,
    		CURSOR_POSITION_SYNC,
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
