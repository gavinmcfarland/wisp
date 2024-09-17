import fs from 'fs';
import path from 'path';

export function renderInclude(inputString, baseDir) {
	// Regular expression to find {include('file-name.html')}
	const includeRegex = /\{include\('(.+?)'\)\}/g;

	// Replace each include statement with the content of the corresponding file synchronously
	const replaceIncludes = (match, includeFile) => {
		const includePath = path.join(baseDir, includeFile);
		try {
			const includeContent = fs.readFileSync(includePath, 'utf8');
			return includeContent;
		} catch (err) {
			throw new Error(`Included file ${includeFile} not found`);
		}
	};

	// Perform the replacement synchronously for all include statements
	const matches = [...inputString.matchAll(includeRegex)];
	for (const match of matches) {
		inputString = inputString.replace(match[0], replaceIncludes(...match));
	}

	return inputString;
}
