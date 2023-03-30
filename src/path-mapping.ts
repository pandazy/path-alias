import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { cwd } from 'process';

type Tsconfig = {
  compilerOptions: {
    paths?: Record<string, string[]>;
  };
};

const DefaultTsconfigFile = 'tsconfig.json';

const readTsconfigPaths = (tsconfigFile: string): Record<string, string[]> => {
  const tsconfigPath = resolve(cwd(), tsconfigFile);
  if (!existsSync(tsconfigPath)) {
    return {};
  }
  const tsconfigContent = readFileSync(tsconfigPath, 'utf8');
  if (!tsconfigContent) {
    return {};
  }
  return (JSON.parse(tsconfigContent) as Tsconfig).compilerOptions?.paths ?? {};
};

const cutTailingSlashStar = (path: string): string =>
  path.replace(/\/+\*$/, '');
const trimPathSlashes = (filePath: string): string =>
  filePath.replace(/^\.\/+|\/+$/g, '');
const babelPath = (path: string): string =>
  trimPathSlashes(cutTailingSlashStar(path));

export function getBabelAlias(
  tsconfigFile = DefaultTsconfigFile
): Record<string, string> {
  const tsPaths = readTsconfigPaths(tsconfigFile);
  return Object.entries(tsPaths).reduce(
    (acc, [alias, paths]) => ({
      ...acc,
      [babelPath(alias)]: babelPath(paths[0]),
    }),
    {}
  );
}

export function getJestMapper(
  tsconfigFile = DefaultTsconfigFile
): Record<string, string> {
  return Object.entries(readTsconfigPaths(tsconfigFile)).reduce(
    (acc, [alias, paths]) => ({
      ...acc,
      [`^${babelPath(alias)}/(.*)$`]: `<rootDir>/${babelPath(paths[0])}/$1`,
    }),
    {}
  );
}

export function getResolvedPaths(
  tsconfigFile = DefaultTsconfigFile
): Record<string, string> {
  return Object.entries(readTsconfigPaths(tsconfigFile)).reduce(
    (acc, [alias, paths]) => ({
      ...acc,
      [`${babelPath(alias)}`]: resolve(cwd(), babelPath(paths[0])),
    }),
    {}
  );
}
