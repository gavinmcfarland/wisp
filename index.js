import { writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

import { renderLogicBlock } from './src/renderLogicBlock.js';
import { renderInclude } from './src/renderInclude.js';

// Write to file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Wisp {
	constructor() {
		// Placeholder function, to be replaced with your own logic
		this.placeholderFunction = (content, baseDir) => {
			const renderedIncludes = renderInclude(content, baseDir);
			const output = renderLogicBlock(renderedIncludes);
			return output;
		};
	}

	// Async method to render content, accepts either a string or a file path
	async render(content, baseDir) {
		if (typeof content === 'string') {
			// If content is a string, check if it's a file path
			if (this.isFilePath(content)) {
				try {
					// Read the file if it's a valid path
					const fileContent = await this.readFile(content);
					return this.placeholderFunction(fileContent, baseDir);
				} catch (error) {
					console.error("Error reading file:", error);
					throw error;
				}
			} else {
				// If it's just a string, pass it directly to the placeholder function
				return this.placeholderFunction(content, baseDir);
			}
		} else {
			throw new Error('Unsupported content type. Please provide a string (file path or plain string).');
		}
	}

	// Function to read the contents of a file, returns a promise
	readFile(filePath) {
		return new Promise((resolve, reject) => {
			fs.readFile(filePath, 'utf-8', (err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}

	// Function to check if the string is a file path
	isFilePath(content) {
		return fs.existsSync(content) && fs.lstatSync(content).isFile();
	}

	// Replace the placeholder function with your own logic
	setRenderFunction(customFunction) {
		this.placeholderFunction = customFunction;
	}
}

export const wisp = new Wisp();
