// Call render and handle the result asynchronously
import { writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

import { wisp } from 'wisp'

// Write to file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templateStringPath = path.join(__dirname, 'template-string.html');
const baseDir = path.join(__dirname, 'test');  // The base directory where files will be searched

const dirPath = path.join(__dirname, 'dist');
const filePath = path.join(dirPath, 'index.html');

(async () => {
	try {
		const output = await wisp.render(templateStringPath, baseDir);
		// Create directory if it doesn't exist
		await mkdir(dirPath, { recursive: true });

		// Write file inside the newly created directory
		await writeFile(filePath, output);
		console.log('File has been written successfully inside the directory!');
	} catch (err) {
		console.error('An error occurred:', err);
	}
})();
