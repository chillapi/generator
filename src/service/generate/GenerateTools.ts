import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';

import { OpenAPIV3 } from '@chillapi/api/dist/openapiv3';

import { BootstrapConfig } from '../../model/BootstrapConfig';
import { writeConfigStubs } from './ConfigStubGenerator';
import { writeServerFiles } from './ServerGenerator';


export async function generate(apiPath: string, rootPath: string, moduleName?: string): Promise<void> {
    try {
        const api = await loadApi(apiPath);

        const lockFile = resolve(rootPath, 'chill-api-lock.json');
        const locks = existsSync(lockFile) ? require(lockFile) : {};

        await writeConfigStubs(resolve(rootPath, 'config'), api, locks, moduleName);
        await writeServerFiles(rootPath, api, locks);

        await writeFile(lockFile, JSON.stringify(locks));
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}



async function loadApi(apiPath: string): Promise<OpenAPIV3> {
    if (existsSync(apiPath)) {
        try {
            const apiContent = await readFile(apiPath, 'utf-8');
            return Promise.resolve(yamlLoad(apiContent) as OpenAPIV3);
        } catch (err) {
            console.error(`Unable to load API file from ${apiPath}`);
            console.error(err);
            return Promise.reject(err);
        }
    }
}

async function writeBaseConfig(apiPath: string, rootPath: string): Promise<void> {
    try {
        const baseConfig: BootstrapConfig = {
            kind: 'Bootstrap',
            id: 'bootstrap/main',
            apiPath
        }
        await writeFile(resolve(rootPath, 'main.yaml'), yamlDump(baseConfig));
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}