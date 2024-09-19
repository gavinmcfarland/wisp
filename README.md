# Wisp

Wisp is a lightweight reactive templating language. It's like if EJS, Handlebars and Svelte had a baby.

> [!NOTE]
> This is a work in progress and very experimental.

### Install

```shell
npm install github:gavinmcfarland/wisp --save-dev
```

## Usage

To use wisp, you just need to pass in a template string.

```js
import { wisp } from "wisp";

wisp.render(template).then((output) => {
    console.log(output);
});
```

### Example

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

## Features

-   ### Render a template

    `wisp.render(template: string | Path, opts?: Opts)`

    #### Options

    ```ts
    type Helper = (...args: any[]) => any;

    interface Opts {
        baseDir: string;
        helpers: {
            [key: string]: Helper;
        };
    }
    ```

    -   **`baseDir`** The path you want all includes to work from.
    -   **`helpers`** And array-like object of helper functions

-   ### Logic blocks

    Content can be conditionally rendered by wrapping it in an if block.

    ```html
    {#if timeForTea}
        <p>Time for tea!</p>
    {/if}
    ```

-   ### Logic blocks

    Content can be split into files for better organisation.

    ```html
    { include('about.html') }
    ```

-   ### Rendered block

    Create your own helpers

    ```html
    <p>Copyright { thisYear() }</p>
    ```

    They can be pipped as well.

    ```html
    <p>{ 'hello world' | uppercase}</p>
    ```

    And applied to files.

    ```html
    <p>{ include('script.html') | escape }</p>
    ```

-   ### Rendered block <mark>experimental</mark>

    This only applies the code contained after the template has been rendered.

    ```html
    <script>
        {#rendered}
            console.log(iframe)
        {/rendered}
    </script>
    ```
