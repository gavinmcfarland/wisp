# Wisp

Wisp is a lightweight templating language that outputs a string without requiring a bundler.

> [!NOTE]
> This is a work in progress and very experimental.

### Install

This library has not been published to npm yet. So install it from github.

```shell
npm install github:gavinmcfarland/wisp
```

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
    { include('hello.html') }
{:else}
    { include('goodbye.html') }
{/if}
```

### Features

- `logic blocks`: Content can be conditionally rendered by wrapping it in an if block.

  ```html
  {#if timeForTea}
  <p>Time for tea!</p>
  {/if}
  ```

- `includes`: Content can be split into files for better organisation.

  ```html
  { include('about.html') }
  ```

- `rendered`: This only applies the code contained after the template has been rendered. <mark>experimental</mark>

    ```html
    <script>
        {#rendered}
            console.log(iframe)
        {/rendered}
    </script>

- `helpers`: Create your own helpers

    ```html
    <p>Copyright { thisYear() }</p>
    ```

    They can be pipped as well.

    ```html
    <p>{ 'hello world' | uppercase}</p>
    ```

    And applied to files.

    ```html
    <p>{ include('script.html') | escape }
    ```

