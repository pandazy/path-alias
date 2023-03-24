import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import {
  getBabelAlias,
  getJestMapper,
  getResolvedPaths,
  getTsConfigPaths,
} from './path-mapping';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
}));

jest.mock('process', () => ({
  cwd: jest.fn().mockReturnValue('~/walter/white'),
}));

jest.mock('path', () => ({
  resolve: jest.fn().mockImplementation((...args: string[]) => args.join('/')),
}));

describe('path-mapping', () => {
  const expectedDefinition = {
    '@': './src',
    '@components': './src/components',
  };
  const mockRead = (definition: Record<string, any> | undefined): void => {
    (readFileSync as jest.Mock).mockReturnValue(
      definition ? JSON.stringify(definition) : undefined
    );
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should getBabelAlias', () => {
    (existsSync as jest.Mock).mockReturnValueOnce(true);
    mockRead(expectedDefinition);
    const alias = getBabelAlias();
    expect(readFileSync).toHaveBeenCalledTimes(1);
    expect(alias).toEqual(expectedDefinition);
    expect(resolve).toHaveBeenCalledWith('~/walter/white', 'mole-paths.json');
  });

  it('should getBabelAlias with empty file', () => {
    (existsSync as jest.Mock).mockReturnValueOnce(true);
    mockRead(undefined);
    const alias = getBabelAlias();
    expect(alias).toEqual({});
  });

  it('should getJestMapper', () => {
    mockRead(expectedDefinition);
    (existsSync as jest.Mock).mockReturnValueOnce(true);
    const alias = getJestMapper();
    expect(alias).toEqual({
      '^@/(.*)$': '<rootDir>/src/$1',
      '^@components/(.*)$': '<rootDir>/src/components/$1',
    });
  });

  it('should getJestMapper if file does not exist', () => {
    mockRead(expectedDefinition);
    (existsSync as jest.Mock).mockReturnValueOnce(false);
    const alias = getJestMapper();
    expect(alias).toEqual({});
    expect(readFileSync).not.toBeCalled();
  });

  it('should getTsConfigPaths', () => {
    (existsSync as jest.Mock).mockReturnValueOnce(true);
    mockRead(expectedDefinition);
    const alias = getTsConfigPaths();
    expect(alias).toEqual({
      '@/*': ['src/*'],
      '@components/*': ['src/components/*'],
    });
  });

  it('should getTsConfigPaths with empty file', () => {
    (existsSync as jest.Mock).mockReturnValueOnce(true);
    mockRead(undefined);
    const alias = getTsConfigPaths();
    expect(alias).toEqual({});
  });

  it('should getResolvedPaths', () => {
    (existsSync as jest.Mock).mockReturnValueOnce(true);
    mockRead(expectedDefinition);
    const alias = getResolvedPaths();
    expect(alias).toEqual({
      '@': `~/walter/white/src`,
      '@components': `~/walter/white/src/components`,
    });
  });
});
