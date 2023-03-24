import { defaults } from 'ts-jest/presets';

export default {
  ...defaults,
  verbose: true,
  preset: 'ts-jest',
  roots: ['src'],
  transform: {
    ...(defaults?.transform ?? {}),
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '^.+\\.spec\\.tsx?$',
  moduleFileExtensions: [
    ...(defaults.moduleFileExtensions ?? []),
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
  ],
  testEnvironment: 'node',
};
