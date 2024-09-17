import { writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

import { renderLogicBlock } from './src/renderLogicBlock.js'
import { renderInclude } from './src/renderInclude.js'

// Write to file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirPath = path.join(__dirname, 'dist');
const filePath = path.join(dirPath, 'index.html');

// try {
// 	const output = renderInclude(templateString, baseDir);
// 	console.log(output);
// } catch (err) {
// 	console.error(err.message);
// }

// // Call the function to render the template for client-side evaluation
// const output = renderTemplate(`
// <script>
//         function runningInsideFigma() {
//             return Math.random() > 0.5; // Returns true/false randomly for demo
//         }
// </script>

// {#if (runningInsideFigma())}
// 	<div>websocket-relay</div>
// {:else}
// 	<div>iframe-preview</div>
// {/if}
// `);

// Render include

// const templateString = `
// {include('header.html')}
// <div>Main content here</div>
// {include('footer.html')}`;

const templateString = `
<script>
        function runningInsideFigma() {
            return Math.random() > 0.5; // Returns true/false randomly for demo
        }
</script>

{#if (runningInsideFigma())}
	{include('header.html')}
{:else}
	{include('footer.html')}
{/if}
`;

const baseDir = path.join(__dirname, 'test');  // The base directory where files will be searched

const renderedIncludes = renderInclude(templateString, baseDir)
const output = renderLogicBlock(renderedIncludes)


try {
	// Create directory if it doesn't exist
	await mkdir(dirPath, { recursive: true });

	// Write file inside the newly created directory
	await writeFile(filePath, output);
	console.log('File has been written successfully inside the directory!');
} catch (err) {
	console.error('An error occurred:', err);
}
