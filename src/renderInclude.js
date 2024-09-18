import fs from 'fs';
import path from 'path';

// Configure the start and end delimiters
let startDelimiter = '{';
let endDelimiter = '}';

/**
 * Renders the input string by processing include statements and custom helpers.
 *
 * @param {string} inputString - The input template string.
 * @param {string} baseDir - The base directory for resolving include paths.
 * @param {Object} helpers - (Optional) An object containing custom helper functions.
 * @returns {string} - The processed string with includes and helpers rendered.
 */
export function renderInclude(inputString, baseDir = path.resolve('./'), helpers = {}) {
	// Helper function to escape regex special characters in delimiters
	const escapeRegex = (str) => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
	const escapedStart = escapeRegex(startDelimiter);
	const escapedEnd = escapeRegex(endDelimiter);

	/**
	 * Regex to match include statements like { include('file-name.html') }
	 */
	const includeRegex = new RegExp(
		`${escapedStart}\\s*include\\s*\\(\\s*['"](.+?)['"]\\s*\\)\\s*${escapedEnd}`,
		'g'
	);

	/**
	 * Regex to match helper expressions:
	 * - { helperName(arg) }
	 * - { helperName }
	 * - { input | helperName }
	 *
	 * This regex ensures that it does NOT match tags starting with {# by using a negative lookahead.
	 */
	const helperRegex = new RegExp(
		`${escapedStart}(?!#)\\s*` + // Ensure { is not followed by #
		`(?:` +
		// Match { helperName(arg) }
		`(?:(\\w+)\\s*\\(\\s*(['"]?)([^'")]+)\\2\\s*\\))` +
		`|` +
		// Match { input | helperName }
		`(?:(.*?)\\s*\\|\\s*(\\w+))` +
		`|` +
		// Match { helperName }
		`(?:(\\w+))` +
		`)` +
		`\\s*${escapedEnd}`,
		'g'
	);

	/**
	 * Regex to match include statements without delimiters, e.g., include('file.html')
	 */
	const inlineIncludeRegex = /^\s*include\s*\(\s*['"](.+?)['"]\s*\)\s*$/i;

	/**
	 * Replaces include statements with the content of the specified file.
	 *
	 * @param {string} match - The entire matched string.
	 * @param {string} includeFile - The filename to include.
	 * @returns {string} - The content of the included file.
	 */
	const replaceIncludes = (match, includeFile) => {
		const includePath = path.join(baseDir, includeFile);

		try {
			const includeContent = fs.readFileSync(includePath, 'utf8');
			// Recursively process the included content for further includes and helpers
			return renderInclude(includeContent, path.dirname(includePath), helpers);
		} catch (err) {
			throw new Error(`Included file "${includeFile}" not found in directory: ${baseDir}`);
		}
	};

	/**
	 * Replaces helper expressions with the output from corresponding helper functions.
	 *
	 * @param {string} match - The entire matched helper expression.
	 * @param {string} helperNameWithArgs - Helper name if matched with arguments.
	 * @param {string} quote - Quote used around the argument (if any).
	 * @param {string} arg - Argument passed to the helper.
	 * @param {string} pipedInput - Input before the pipe operator.
	 * @param {string} pipeHelperName - Helper name after the pipe operator.
	 * @param {string} helperName - Helper name if matched without arguments or pipes.
	 * @returns {string} - The result of the helper function or the original match if helper is undefined.
	 */
	const replaceHelpers = (match, helperNameWithArgs, quote, arg, pipedInput, pipeHelperName, helperName) => {
		if (helperNameWithArgs) {
			// Handle { helperName(arg) }
			const helperFunc = helpers[helperNameWithArgs];
			if (typeof helperFunc === 'function') {
				return helperFunc(arg);
			}
			// If helper is not defined, leave the expression unchanged
			return match;
		} else if (pipeHelperName) {
			// Handle { input | helperName }
			let input = pipedInput.trim();

			// Check if the input is an include statement without delimiters
			const includeMatch = input.match(inlineIncludeRegex);
			if (includeMatch) {
				// Process the include and get its content
				const includedContent = replaceIncludes(includeMatch[0], includeMatch[1]);

				// Now, pass the included content to the helper
				const helperFunc = helpers[pipeHelperName];
				if (typeof helperFunc === 'function') {
					return helperFunc(includedContent);
				}

				// If helper is not defined, leave the expression unchanged
				return match;
			} else {
				// Otherwise, pass the input as-is to the helper
				const helperFunc = helpers[pipeHelperName];
				if (typeof helperFunc === 'function') {
					return helperFunc(input);
				}
				// If helper is not defined, leave the expression unchanged
				return match;
			}
		} else if (helperName) {
			// Handle { helperName }
			const helperFunc = helpers[helperName];
			if (typeof helperFunc === 'function') {
				return helperFunc();
			}
			// If helper is not defined, leave the expression unchanged
			return match;
		}
		// If none of the patterns matched, return the original match
		return match;
	};

	/**
	 * Replaces include statements in the main content.
	 */
	const replaceMainIncludes = (input) => {
		return input.replace(includeRegex, replaceIncludes);
	};

	/**
	 * Replaces helper expressions in the main content.
	 */
	const replaceMainHelpers = (input) => {
		return input.replace(helperRegex, replaceHelpers);
	};

	/**
	 * Replaces include statements within <script> tags.
	 */
	const replaceScriptIncludes = (input) => {
		const scriptIncludeRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
		return input.replace(scriptIncludeRegex, (scriptTag, scriptContent) => {
			// Replace includes inside script content
			const replacedContent = scriptContent.replace(includeRegex, replaceIncludes);
			return `<script>${replacedContent}</script>`;
		});
	};

	/**
	 * Replaces helper expressions within <script> tags.
	 */
	const replaceScriptHelpers = (input) => {
		const scriptHelperRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
		return input.replace(scriptHelperRegex, (scriptTag, scriptContent) => {
			// Replace helpers inside script content
			const replacedContent = scriptContent.replace(helperRegex, replaceHelpers);
			return `<script>${replacedContent}</script>`;
		});
	};

	// Step 1: Process include statements in the main HTML content
	inputString = replaceMainIncludes(inputString);

	// Step 2: Process helper expressions in the main HTML content
	inputString = replaceMainHelpers(inputString);

	// Step 3: Process include statements within <script> tags
	inputString = replaceScriptIncludes(inputString);

	// Step 4: Process helper expressions within <script> tags
	inputString = replaceScriptHelpers(inputString);

	return inputString;
}
