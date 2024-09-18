import fs from 'fs';
import path from 'path';

// Configure the start and end delimiters
let startDelimiter = '{';
let endDelimiter = '}';

export function renderInclude(inputString, baseDir = path.resolve('./')) {
	// Escape delimiters for use in regular expressions
	const escapeRegex = (str) => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
	const escapedStart = escapeRegex(startDelimiter);
	const escapedEnd = escapeRegex(endDelimiter);

	// Regular expression to find { include('file-name.html') } with optional spaces
	const includeRegex = new RegExp(
		`${escapedStart}\\s*include\\s*\\(\\s*['"](.+?)['"]\\s*\\)\\s*${escapedEnd}`,
		'g'
	);

	// Replace each include statement with the content of the corresponding file synchronously
	const replaceIncludes = (match, includeFile) => {
		const includePath = path.join(baseDir, includeFile);

		try {
			const includeContent = fs.readFileSync(includePath, 'utf8');
			return includeContent;
		} catch (err) {
			throw new Error(`Included file ${includeFile} not found in directory: ${includePath}`);
		}
	};

	// Perform the replacement synchronously for all include statements
	const matches = [...inputString.matchAll(includeRegex)];

	for (const match of matches) {
		inputString = inputString.replace(match[0], replaceIncludes(...match));
	}

	return inputString;
}
