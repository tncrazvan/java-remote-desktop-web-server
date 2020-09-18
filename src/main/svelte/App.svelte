<script lang="ts">
import { Route,Router } from 'svelte-routing';
import ConsumerPage from './pages/ConsumerPage.svelte';
import ProducerPage from './pages/ProducerPage.svelte';

</script>

<Router>
	<Route path="/producer" component={ProducerPage} />
	<Route path="/consumer" component={ConsumerPage} />
</Router>
<!-- <GamepadInputInterface /> -->