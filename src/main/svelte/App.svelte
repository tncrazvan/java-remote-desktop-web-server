<script lang="ts">
import { Router,Route } from 'svelte-routing';
import InputInterface from './components/InputInterface.svelte';
</script>
<Router>
	<Route path="/" component={InputInterface} />
	<Route path="/input" component={InputInterface} />
	<Route path="/screen" component={InputInterface} />
</Router>