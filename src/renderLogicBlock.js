// Configure the start and end delimiters
let startDelimiter = "{";
let endDelimiter = "}";

export function renderLogicBlock(templateString) {
	// Escape delimiters for use in regular expressions
	const escapeRegex = (str) => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

	const escapedStart = escapeRegex(startDelimiter);
	const escapedEnd = escapeRegex(endDelimiter);

	// Updated Regex for matching {#if condition} ... {:else} ... {/if} with configurable delimiters
	const ifRegex = new RegExp(
		`${escapedStart}#if\\s*([^${escapedEnd}]+)${escapedEnd}([\\s\\S]*?)${escapedStart}:else${escapedEnd}([\\s\\S]*?)${escapedStart}/if${escapedEnd}`,
		'g'
	);

	// Extract scripts and template
	let clientScript = '';
	let templateContent = templateString;

	// Find all script tags in the template and extract them
	const scriptMatches = templateString.match(/<script>([\s\S]*?)<\/script>/g);
	if (scriptMatches) {
		scriptMatches.forEach((script) => {
			clientScript += script.replace(/<\/?script>/g, '') + '\n';
			templateContent = templateContent.replace(script, ''); // Remove script from template
		});
	}

	// Process clientScript to replace variable declarations with reactive variables
	const variableDeclarationRegex = /(let|var|const)\s+(\w+)\s*=\s*(.*?);/g;
	let processedClientScript = clientScript.replace(variableDeclarationRegex, (match, declType, varName, varValue) => {
		return `reactiveVar("${varName}", ${varValue});`;
	});

	// Process clientScript to define functions on the window object
	const functionDeclarationRegex = /function\s+(\w+)\s*\(([^\)]*)\)\s*\{([\s\S]*?)\}/g;
	processedClientScript = processedClientScript.replace(functionDeclarationRegex, (match, funcName, params, body) => {
		return `window.${funcName} = function(${params}) {${body}}`;
	});

	// Prepare the output string that will be sent to the client
	const output = `
        <script>
            // Define reactiveVar function
            function reactiveVar(name, initialValue) {
                let value = initialValue;
                Object.defineProperty(window, name, {
                    get() { return value; },
                    set(newValue) {
                        value = newValue;
                        render(); // Re-render the template
                    },
                    configurable: true
                });
            }

            // Delimiters
            const startDelimiter = ${JSON.stringify(startDelimiter)};
            const endDelimiter = ${JSON.stringify(endDelimiter)};

            // Escape delimiters for use in regular expressions
            const escapeRegex = (str) => str.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');
            const escapedStart = escapeRegex(startDelimiter);
            const escapedEnd = escapeRegex(endDelimiter);

            // Updated regex to capture {#if} ... {:else} ... {/if} blocks with configurable delimiters
            const ifRegex = new RegExp(
                escapedStart + '#if\\\\s*([^' + escapedEnd + ']+)' + escapedEnd +
                '([\\\\s\\\\S]*?)' +
                escapedStart + ':else' + escapedEnd +
                '([\\\\s\\\\S]*?)' +
                escapedStart + '/if' + escapedEnd,
                'g'
            );

            const template = \`${templateContent.trim()}\`;

            // Define render function
            function render() {
                // Evaluate and replace the template's conditionals with actual HTML
                const evaluatedTemplate = template.replace(ifRegex, function(_, condition, ifBlock, elseBlock) {
                    try {
                        const result = eval(condition); // Evaluate the condition in the current context
                        return result ? ifBlock.trim() : elseBlock.trim(); // Replace with the appropriate block
                    } catch (e) {
                        console.error('Error evaluating condition:', e);
                        return elseBlock.trim(); // Fallback to else block if evaluation fails
                    }
                });

                // Update the content in the DOM
                if (!render.wrapper) {
                    render.wrapper = document.createElement('div');
                    document.body.appendChild(render.wrapper);
                }
                render.wrapper.innerHTML = evaluatedTemplate;
            }

            ${processedClientScript.trim()}

            document.addEventListener('DOMContentLoaded', () => {
                render(); // Initial render
            });
        </script>
    `;

	return output.trim(); // Return the final string
}
