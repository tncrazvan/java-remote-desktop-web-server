
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function detach(node) {
        node.parentNode.removeChild(node);
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

    class BinaryPoint32 {
        constructor(x, y) {
            this.binary = this.bin(x, y);
        }
        bin(x, y) {
            return (x << 16) + y;
        }
        get() {
            return this.binary;
        }
    }

    class GamepadEventManager {
        constructor(ps) {
            this.ps = ps;
        }
        pollGamepads() {
            //var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
            let gamepads = navigator.getGamepads();
            for (let i = 0; i < gamepads.length; i++) {
                var gp = gamepads[i];
                if (gp) {
                    this.connected(gp);
                    console.log("Gamepad connected at index ", gp.index, ": ", gp.id, ". It has ", gp.buttons.length, " buttons and ", gp.axes.length, " axes.");
                    clearInterval(this.interval);
                }
            }
        }
        connected(gamepad) {
            this.gamepad = gamepad;
            console.log(gamepad);
        }
        disconnected(e) {
            this.gamepad = undefined;
        }
        tick(gamepad) {
            if (!gamepad)
                return;
            console.log("connected:", gamepad.connected, gamepad.axes[0], gamepad.axes[1], gamepad.axes[2], gamepad.axes[3]);
        }
        watch() {
            window.addEventListener("gamepadconnected", (e) => {
                this.connected(navigator.getGamepads()[e.gamepad.index]);
            });
            window.addEventListener("gamepaddisconnected", (e) => {
                this.disconnected(e);
                if (!('ongamepadconnected' in window)) {
                    // No gamepad events available, poll instead.
                    this.interval = setInterval(this.pollGamepads, 500);
                }
            });
            requestAnimationFrame(() => {
                this.tick(this.gamepad);
            });
        }
    }

    class PositionSynchronizer {
        constructor() {
            this.replied = false;
            this.pressed = false;
            this.x = 0;
            this.y = 0;
            this.lastSentX = 0;
            this.lastSentY = 0;
            this.manageWebSocket();
        }
        manageWebSocket() {
            this.ws = new WebSocket("ws://localhost/mouse/tncrazvan");
            this.ws.onopen = e => {
                this.replied = true;
                this.x = 0;
                this.y = 0;
            };
            this.ws.onmessage = e => {
                this.replied = true;
                this.x = 0;
                this.y = 0;
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
            if (this.y > 0)
                this.y = 0;
            this.y -= PositionSynchronizer.STEP;
        }
        moveDown() {
            this.pressed = true;
            if (this.y < 0)
                this.y = 0;
            this.y += PositionSynchronizer.STEP;
        }
        moveLeft() {
            this.pressed = true;
            if (this.x > 0)
                this.x = 0;
            this.x -= PositionSynchronizer.STEP;
        }
        moveRight() {
            this.pressed = true;
            if (this.x < 0)
                this.x = 0;
            this.x += PositionSynchronizer.STEP;
        }
        send() {
            console.log(this.x, this.y);
            let point = new BinaryPoint32(this.x, this.y);
            this.ws.send(point.get() + '');
            this.lastSentX = this.x;
            this.lastSentY = this.y;
            this.x = 0;
            this.y = 0;
        }
        trySend() {
            if ((this.lastSentX !== this.x || this.lastSentY !== this.y) && this.pressed)
                try {
                    console.log("sending");
                    this.replied = false;
                    this.send();
                }
                catch (e) {
                    console.error(e);
                }
        }
    }
    PositionSynchronizer.STEP = 10;
    PositionSynchronizer.REFRESH_RATE = 10;
    PositionSynchronizer.ARROW_UP = 38;
    PositionSynchronizer.ARROW_DOWN = 40;
    PositionSynchronizer.ARROW_LEFT = 37;
    PositionSynchronizer.ARROW_RIGHT = 39;

    class KeyboardEventManager {
        constructor(ps) {
            this.ps = ps;
        }
        watch() {
            this.manageKeyUp();
            this.manageKeyDown();
        }
        manageKeyUp() {
            document.body.onkeyup = event => {
                this.ps.setPressed(false);
            };
        }
        manageKeyDown() {
            document.body.onkeydown = event => {
                switch (event.keyCode) {
                    case PositionSynchronizer.ARROW_UP:
                        this.ps.moveUp();
                        break;
                    case PositionSynchronizer.ARROW_DOWN:
                        this.ps.moveDown();
                        break;
                    case PositionSynchronizer.ARROW_LEFT:
                        this.ps.moveLeft();
                        break;
                    case PositionSynchronizer.ARROW_RIGHT:
                        this.ps.moveRight();
                        break;
                }
            };
        }
    }

    /* src\App.svelte generated by Svelte v3.25.0 */

    function create_fragment(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
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

    	const POSITION_SYNC = new PositionSynchronizer();
    	const GEM = new GamepadEventManager(POSITION_SYNC);
    	const KEM = new KeyboardEventManager(POSITION_SYNC);

    	function loop() {
    		POSITION_SYNC.trySend();
    	}

    	onMount(() => {
    		GEM.watch();
    		KEM.watch();
    		requestAnimationFrame(loop);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		BinaryPoint32,
    		GamepadEventManager,
    		PositionSynchronizer,
    		KeyboardEventManager,
    		gamepad,
    		gamepadConnected,
    		gamepadDisconnected,
    		POSITION_SYNC,
    		GEM,
    		KEM,
    		loop
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
