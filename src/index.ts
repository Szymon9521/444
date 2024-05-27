import Fastify from 'fastify';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: false
});

async function readFilesRecursively(directory: string, parent = '') {
  const files = await fs.promises.readdir(directory, { withFileTypes: true });

  for (const file of files) {
    const relativePath = path.join(parent, file.name);
    const fullPath = path.join(directory, file.name);

    if (file.isDirectory()) {
      await readFilesRecursively(fullPath, relativePath);
    } else if (path.extname(file.name) === '.js') {
      console.log(`Import: ${relativePath}`);
      const Module = await import(`../dist/routes/${relativePath}`);
      const ImportedClass = Module.default;
      if (typeof ImportedClass === 'function') {
        new ImportedClass(fastify, relativePath.replace('.js', '').replace(/\\/g, '/'));
      } else {
        console.error(`The imported module from ${relativePath} does not have a default export or is not a constructor`);
      }
    }
  }
}

const directoryPath = path.join(__dirname, 'routes');

const start = async () => {
  await readFilesRecursively(directoryPath);

  fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
};

start();
