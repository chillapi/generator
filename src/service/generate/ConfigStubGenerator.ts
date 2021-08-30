import { OpenAPIV3 } from '@chillapi/api/dist/openapiv3';
import { load } from '@chillapi/module-discovery';

export async function writeConfigStubs(configPath: string, api: OpenAPIV3, locks: { [key: string]: string }, moduleName?: string): Promise<void> {
    const inferredModuleName = moduleName || await loadModule();
    console.info(`Using ${inferredModuleName} for stub generation`);
    await require(inferredModuleName).generateStubs(api, configPath, locks);
    return Promise.resolve();
}

async function loadModule(): Promise<any> {
    console.info('Auto-disovering module to use for stub generation');
    const chillAPIModulesWithGenerate: any[] = await load('generateStubs');
    if (chillAPIModulesWithGenerate.length === 0) {
        return Promise.reject("No seed generator found within project dependencies. Try adding '@chillapi/stub' to your project.json.");
    }
    if (chillAPIModulesWithGenerate.length > 1) {
        return Promise.reject(`Multiple seed generators found: ${chillAPIModulesWithGenerate.join(';')}. Run the generate command with a specific module, or leave only one seed generator.`)
    }
    return Promise.resolve(chillAPIModulesWithGenerate[0]);
}