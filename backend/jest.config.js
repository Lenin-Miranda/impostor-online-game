/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "<rootDir>/../tsconfig.json" }],
  },
  // Resuelve los imports estilo "src/..." (baseUrl) que usan algunos archivos.
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/$1",
  },
  testEnvironment: "node",
};
