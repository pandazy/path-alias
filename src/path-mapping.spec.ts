import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { getBabelAlias, getJestMapper, getResolvedPaths } from './path-mapping';

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
  const mockTsconfig = {
    compilerOptions: {
      paths: {
        '@/*': ['src/*'],
        '@components/*': ['src/components/*'],
      },
    },
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
    mockRead(mockTsconfig);
    const alias = getBabelAlias();
    expect(readFileSync).toHaveBeenCalledTimes(1);
    expect(alias).toEqual({
      '@': 'src',
      '@components': 'src/components',
    });
    expect(resolve).toHaveBeenCalledWith('~/walter/white', 'tsconfig.json');
  });

  it('should getBabelAlias from a specified file', () => {
    (existsSync as jest.Mock).mockReturnValueOnce(true);
    mockRead(mockTsconfig);
    const alias = getBabelAlias('tsconfig-mole.json');
    expect(readFileSync).toHaveBeenCalledTimes(1);
    expect(alias).toEqual({
      '@': 'src',
      '@components': 'src/components',
    });
    expect(resolve).toHaveBeenCalledWith(
      '~/walter/white',
      'tsconfig-mole.json'
    );
  });

  it('should getBabelAlias with empty file', () => {
    (existsSync as jest.Mock).mockReturnValueOnce(true);
    mockRead(undefined);
    const alias = getBabelAlias();
    expect(alias).toEqual({});
  });

  it('should getBabelAlias from empty-paths tsconfig', () => {
    (existsSync as jest.Mock).mockReturnValueOnce(true);
    mockRead({ compilerOptions: {} });
    const alias = getBabelAlias();
    expect(alias).toEqual({});
  });

  it('should getBabelAlias from empty tsconfig', () => {
    (existsSync as jest.Mock).mockReturnValueOnce(true);
    mockRead({});
    const alias = getBabelAlias();
    expect(alias).toEqual({});
  });

  it('should getBabelAlias if tsconfig is not found', () => {
    (existsSync as jest.Mock).mockReturnValueOnce(false);
    mockRead(mockTsconfig);
    const alias = getBabelAlias();
    expect(alias).toEqual({});
  });

  it('should getJestMapper', () => {
    mockRead(mockTsconfig);
    (existsSync as jest.Mock).mockReturnValueOnce(true);
    const alias = getJestMapper();
    expect(alias).toEqual({
      '^@/(.*)$': '<rootDir>/src/$1',
      '^@components/(.*)$': '<rootDir>/src/components/$1',
    });
  });

  it('should getJestMapper if file does not exist', () => {
    mockRead(mockTsconfig);
    (existsSync as jest.Mock).mockReturnValueOnce(false);
    const alias = getJestMapper();
    expect(alias).toEqual({});
    expect(readFileSync).not.toBeCalled();
  });

  it('should getResolvedPaths', () => {
    (existsSync as jest.Mock).mockReturnValueOnce(true);
    mockRead(mockTsconfig);
    const alias = getResolvedPaths();
    expect(alias).toEqual({
      '@': `~/walter/white/src`,
      '@components': `~/walter/white/src/components`,
    });
  });
});
