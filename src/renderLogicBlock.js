// renderTemplate.js (ES Module)

export function renderTemplate(templateString) {
	// Improved Regex for matching {#if (condition)} ... {:else} ... {/if}
	const ifRegex = /\{#if\s*\(([^}]+)\)\}([\s\S]*?)\{:else\}([\s\S]*?)\{\/if\}/g;

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

	// Prepare the output string that will be sent to the client
	const output = `
        <script>
            ${clientScript.trim()}
        </script>
        <script>
            // Function to evaluate the conditionals on the client side
            document.addEventListener('DOMContentLoaded', () => {
                const template = \`${templateContent.trim()}\`;

                // Improved regex to capture {#if} ... {:else} ... {/if} blocks
                const ifRegex = /\\{#if\\s*\\(([^}]+)\\)\\}([\\s\\S]*?)\\{:else\\}([\\s\\S]*?)\\{\\/if\\}/g;

                // Evaluate and replace the template's conditionals with actual HTML
                const evaluatedTemplate = template.replace(ifRegex, function(_, condition, ifBlock, elseBlock) {
                    try {
                        console.log('Evaluating condition:', condition);
                        const result = eval(condition); // Evaluate the condition in the browser
                        console.log('Result:', result);
                        return result ? ifBlock.trim() : elseBlock.trim(); // Replace with the appropriate block
                    } catch (e) {
                        console.error('Error evaluating condition:', e);
                        return elseBlock.trim(); // Fallback to else block if evaluation fails
                    }
                });

                // Insert the evaluated content directly into the body or any other container
                const wrapper = document.createElement('div');
                wrapper.innerHTML = evaluatedTemplate;
                document.body.appendChild(wrapper); // Append the evaluated content to the DOM
            });
        </script>
    `;

	return output.trim(); // Return the final string
}
