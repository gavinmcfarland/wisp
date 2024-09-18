// Configure the start and end delimiters
let startDelimiter = "{";
let endDelimiter = "}";

export function renderLogicBlock(templateString) {
	// Escape delimiters for use in regular expressions
	const escapeRegex = (str) => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

	const escapedStart = escapeRegex(startDelimiter);
	const escapedEnd = escapeRegex(endDelimiter);

	// Regex for matching {#if condition} ... {:else} ... {/if} with configurable delimiters
	const ifRegex = new RegExp(
		`${escapedStart}#if\\s*([^${escapedEnd}]+)${escapedEnd}([\\s\\S]*?)${escapedStart}:else${escapedEnd}([\\s\\S]*?)${escapedStart}/if${escapedEnd}`,
		'g'
	);

	// Regex for matching {#rendered} ... {/rendered} blocks and their contents
	// FIXME: Rendered tag is a bit experimental. Like it's only relly applicable to js, and I don't think it solves the core problem
	const renderedRegex = new RegExp(
		`${escapedStart}#rendered${escapedEnd}([\\s\\S]*?)${escapedStart}/rendered${escapedEnd}`,
		'g'
	);

	// Extract scripts and template content
	let clientScript = '';
	let templateContent = templateString;
	let renderedBlocks = [];

	// Find all script tags in the template and extract them
	const scriptMatches = templateString.match(/<script>([\s\S]*?)<\/script>/g);
	if (scriptMatches) {
		scriptMatches.forEach((script) => {
			let scriptContent = script.replace(/<\/?script>/g, ''); // Remove <script> tags

			// Remove {#rendered} blocks and their contents from the clientScript and store them
			scriptContent = scriptContent.replace(renderedRegex, (match, renderedBlock) => {
				renderedBlocks.push(renderedBlock); // Store the rendered block for later execution
				return ''; // Remove it from the script content
			});

			clientScript += scriptContent + '\n';
			templateContent = templateContent.replace(script, ''); // Remove script from template
		});
	}

	// Remove {#rendered} blocks and their contents from the template content
	templateContent = templateContent.replace(renderedRegex, (match, renderedBlock) => {
		renderedBlocks.push(renderedBlock); // Store the rendered block for later execution
		return ''; // Remove it from the template content
	});

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
            (function() {
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

                ${processedClientScript.trim()}

                const startDelimiter = ${JSON.stringify(startDelimiter)};
                const endDelimiter = ${JSON.stringify(endDelimiter)};

                const escapeRegex = (str) => str.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');
                const escapedStart = escapeRegex(startDelimiter);
                const escapedEnd = escapeRegex(endDelimiter);

                const ifRegex = new RegExp(
                    escapedStart + '#if\\\\s*([^' + escapedEnd + ']+)' + escapedEnd +
                    '([\\\\s\\\\S]*?)' +
                    escapedStart + ':else' + escapedEnd +
                    '([\\\\s\\\\S]*?)' +
                    escapedStart + '/if' + escapedEnd,
                    'g'
                );

                let template = \`${templateContent.trim()}\`;

                function render() {

                    // Replace if conditionals with the corresponding blocks
                    const evaluatedTemplate = template.replace(ifRegex, function(_, condition, ifBlock, elseBlock) {
                        try {
                            const result = eval(condition); // Evaluate the condition in the current context
                            return result ? ifBlock.trim() : elseBlock.trim(); // Replace with the appropriate block
                        } catch (e) {
                            console.error('Error evaluating condition:', e);
                            return elseBlock.trim(); // Fallback to else block if evaluation fails
                        }
                    });

                    // Create a wrapper if not already created
                    if (!render.wrapper) {
                        render.wrapper = document.createElement('div');
                        document.body.appendChild(render.wrapper);
                    }
                    render.wrapper.innerHTML = evaluatedTemplate;

					// Ensure the script is only added once
                    if (!document.getElementById("dynamic-script")) {
                        const scriptElement = document.createElement('script');
						// Add back both the clientScripts and the renderedBlocks
                        scriptElement.textContent = ${clientScript.trim() + '\n' + renderedBlocks.join('\n')};
                        scriptElement.id = "dynamic-script"; // Add an id to the script element to avoid duplicate insertion
                        document.body.appendChild(scriptElement);
                    }
                }

                document.addEventListener('DOMContentLoaded', () => {
                    render(); // Initial render when DOM is ready
                });
            })();
        </script>
    `;

	return output.trim(); // Return the final string
}
