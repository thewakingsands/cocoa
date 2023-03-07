/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  testPathIgnorePatterns: ['/fixtures/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
}

module.exports = config
