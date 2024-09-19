// Call render and handle the result asynchronously
import { writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

import { wisp } from 'wisp'

// Write to file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templateStringPath = path.join(__dirname, 'figma/mock/message-proxy.html');
const baseDir = path.join(__dirname, 'figma/mock');  // The base directory where files will be searched

const dirPath = path.join(__dirname, 'dist');
const filePath = path.join(dirPath, 'index.html');

const options = {
	baseDir,
	helpers: {
		// Helper that takes an input and returns a greeting
		myHelper: (name = 'Guest') => `Hello, ${name}!`,

		// Helper without arguments
		currentYear: () => new Date().getFullYear(),

		// Helper used as a filter
		uppercase: (input) => String(input).toUpperCase(),

		test: (input) => String(input).toUpperCase(),
	}
};


(async () => {
	try {

		const output = await wisp.render(templateStringPath, options);
		// Create directory if it doesn't exist
		await mkdir(dirPath, { recursive: true });

		// Write file inside the newly created directory
		await writeFile(filePath, output);
		console.log('File has been written successfully inside the directory!');
	} catch (err) {
		console.error('An error occurred:', err);
	}
})();
