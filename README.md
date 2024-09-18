# Wisp

Wisp is a lightweight templating language that outputs a string without requiring a bundler.

> [!NOTE]
> This is a work in progress and very experimental.

### Usage

To use wisp, you just need to pass in a template string.

```js
import { wisp } from "wisp";

wisp.render(template).then((output) => {
  console.log(output);
});
```

### Example

The example below uses reactive logic blocks to dynamically update content at runtime. Content changes automatically when triggered by events, and 'includes' are used to reference external content for better modularity.

```html
<script>
  let showGreeting = true;

  function changeGreeting() {
    showGreeting = !showGreeting;
  }
</script>

<button onclick="changeGreeting()">Change greeting</button>

{#if showGreeting}
    {include('hello.html')}
{:else}
    {include('goodbye.html')}
{/if}
```
