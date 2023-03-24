import { existsSync, readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';
import { cwd } from 'process';
import { getTsConfigPaths } from './path-mapping';

const ConfigFile = 'tsconfig-mole.json';

interface Tsconfig {
  compilerOptions: {
    paths: Record<string, string[]>;
  };
}

function getUserPath(...paths: string[]): string {
  return resolve(cwd(), ...paths);
}

export default function updateTsConfigPaths(): void {
  const tsConfigPath = getUserPath(ConfigFile);
  if (!existsSync(tsConfigPath)) {
    return;
  }

  const tsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf8')) as Tsconfig;
  const paths = getTsConfigPaths();
  if (Object.keys(paths).length > 0) {
    tsConfig.compilerOptions.paths = paths;
  }
  writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
  execSync(`yarn prettier --write ${ConfigFile}`, { stdio: 'inherit' });
}
