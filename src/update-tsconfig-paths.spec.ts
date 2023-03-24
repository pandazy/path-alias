import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import updateTsConfigPaths from './update-tsconfig-paths';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock('process', () => ({
  cwd: jest.fn().mockReturnValue('~/walter/white'),
}));

jest.mock('path', () => ({
  resolve: jest.fn().mockImplementation((...args: string[]) => args.join('/')),
}));

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

describe('update-tsconfig-paths', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (readFileSync as jest.Mock).mockImplementation((path: string) =>
      JSON.stringify(
        path.endsWith('tsconfig-mole.json')
          ? {
            compilerOptions: {
              paths: {},
            },
          }
          : {
            '@': './src',
            '@components': './src/components',
          }
      )
    );
  });

  it('shouldn not run command if tsconfig-mole.json does not exist', () => {
    (existsSync as jest.Mock).mockReturnValue(false);
    updateTsConfigPaths();
    expect(execSync).not.toBeCalled();
  });

  it('should updateTsConfigPaths', () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    updateTsConfigPaths();
    expect(writeFileSync).toBeCalledWith(
      '~/walter/white/tsconfig-mole.json',
      JSON.stringify(
        {
          compilerOptions: {
            paths: {
              '@/*': ['src/*'],
              '@components/*': ['src/components/*'],
            },
          },
        },
        null,
        2
      )
    );
    expect(execSync).toBeCalledWith(
      'yarn prettier --write tsconfig-mole.json',
      {
        stdio: 'inherit',
      }
    );
  });
});
