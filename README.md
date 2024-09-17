# Wisp

A lightweight templating language for HTML.

> [!NOTE]
> This is a work in progress and very experimental.

### Usage

#### Logic blocks

Use logic blocks in your templates to dynamically include different content at runtime.

```html
<script>
  function showGreeting() {
    return Math.random() > 0.5; // Returns true/false randomly for demo
  }
</script>

{#if (showGreeting())}
    <p>Hello!</p>
    {:else}
    <p>Goodbye!</p>
{/if}
```

#### Inlcudes

Include content from different files.

```html
{include('header.html')}
<main>Main content</main>
{include('footer.html')}
```
