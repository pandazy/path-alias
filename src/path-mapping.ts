import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { cwd } from 'process';
import { MolePaths } from './types';

function readUserMapping(): MolePaths {
  const userFolder = resolve(cwd(), 'mole-paths.json');
  if (!existsSync(userFolder)) {
    return {};
  }
  const molePathsContent = readFileSync(userFolder, 'utf8');
  return molePathsContent ? (JSON.parse(molePathsContent) as MolePaths) : {};
}

export function getBabelAlias(): MolePaths {
  return readUserMapping();
}

function trimPathSlashes(filePath: string): string {
  return filePath.replace(/^\.\/|\/$/g, '');
}

export function getJestMapper(): MolePaths {
  return Object.entries(readUserMapping()).reduce(
    (acc, [alias, path]) => ({
      ...acc,
      [`^${alias}/(.*)$`]: `<rootDir>/${trimPathSlashes(path)}/$1`,
    }),
    {} as MolePaths
  );
}

export function getTsConfigPaths(): Record<string, string[]> {
  return Object.entries(readUserMapping()).reduce(
    (acc, [alias, filePath]) => ({
      ...acc,
      [`${alias}/*`]: [`${trimPathSlashes(filePath)}/*`],
    }),
    {}
  );
}

export function getResolvedPaths(): Record<string, string> {
  return Object.entries(readUserMapping()).reduce(
    (acc, [alias, filePath]) => ({
      ...acc,
      [`${alias}`]: resolve(cwd(), trimPathSlashes(filePath)),
    }),
    {}
  );
}
