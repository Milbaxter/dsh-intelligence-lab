import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ideasDirectory = fileURLToPath(new URL(".", import.meta.url));
const catalogPath = new URL("README.md", import.meta.url);
const prioritiesPath = new URL("PRIORITIES.md", import.meta.url);

const fail = (message) => {
  throw new Error(`Plugin idea catalog invalid: ${message}`);
};

const catalog = await readFile(catalogPath, "utf8");
const priorities = await readFile(prioritiesPath, "utf8");
const headingPattern = /^### (\d+)\. (.+)$/gm;
const headings = [...catalog.matchAll(headingPattern)];

if (headings.length !== 100) {
  fail(`expected 100 numbered ideas, found ${headings.length}`);
}

const titles = new Set();

for (const [index, heading] of headings.entries()) {
  const expectedNumber = index + 1;
  const actualNumber = Number(heading[1]);
  const title = heading[2].trim();
  const normalizedTitle = title.toLocaleLowerCase("en-US");
  const sectionStart = heading.index + heading[0].length;
  const sectionEnd = headings[index + 1]?.index ?? catalog.length;
  const section = catalog.slice(sectionStart, sectionEnd);

  if (actualNumber !== expectedNumber) {
    fail(`expected idea ${expectedNumber}, found ${actualNumber}`);
  }
  if (titles.has(normalizedTitle)) {
    fail(`duplicate title "${title}"`);
  }
  if (!section.includes("**Inspiration:**")) {
    fail(`idea ${actualNumber} is missing an Inspiration field`);
  }
  if (!section.includes("**First trial:**")) {
    fail(`idea ${actualNumber} is missing a First trial field`);
  }

  titles.add(normalizedTitle);
}

const priorityReferences = [
  ...priorities.matchAll(/\*\*#(\d+)\s+([^*]+)\*\*/g),
];

if (priorityReferences.length !== 15) {
  fail(`expected 15 ranked priority references, found ${priorityReferences.length}`);
}

for (const reference of priorityReferences) {
  const number = Number(reference[1]);
  const referencedTitle = reference[2].trim();
  const heading = headings[number - 1];

  if (!heading) {
    fail(`priority references missing idea ${number}`);
  }
  if (heading[2].trim() !== referencedTitle) {
    fail(
      `priority title mismatch for idea ${number}: expected "${heading[2].trim()}", found "${referencedTitle}"`,
    );
  }
}

console.log(
  `Validated ${headings.length} unique, consecutive plugin ideas and ${priorityReferences.length} priority references in ${ideasDirectory}`,
);
