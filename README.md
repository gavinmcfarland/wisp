# Wisp

Wisp is a lightweight templating language that outputs a string without requiring a bundler.

> [!NOTE]
> This is a work in progress and very experimental.

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

{#if showGreeting} {include('hello.html')} {:else} {include('goodbye.html')}
{/if}
```
