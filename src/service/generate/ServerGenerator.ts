import {
  executeTemplateIfTargetNotEditedByUser,
  loadEntities,
  loadOperations,
  Operation
} from "@chillapi/api";
import { OpenAPIV3 } from "@chillapi/api/dist/openapiv3";
import _ from "lodash";
import { resolve } from "path";
import { fill as controllerFill } from "./fillers/controller-filler";
import { fill as envFill } from "./fillers/env-filler";
import { fill as indexFill } from "./fillers/index-filler";
import { fill as modelFill } from "./fillers/model-filler";
import "./templates";

export async function writeServerFiles(
  basePath: string,
  api: OpenAPIV3,
  locks: { [key: string]: string }
): Promise<void> {
  await writeIndex(basePath, api, locks);
  await writeControllers(basePath, api, locks);
  await writeEnv(basePath, api, locks);
  await writeAuthMiddleware(basePath, api, locks);
  await writeModels(basePath, api, locks);
  return Promise.resolve();
}

async function writeIndex(
  basePath: string,
  api: OpenAPIV3,
  locks: { [key: string]: string }
): Promise<void> {
  const indexPath = resolve(basePath, "src", "index.ts");
  const hash = await executeTemplateIfTargetNotEditedByUser(
    indexPath,
    "index.ts",
    indexFill(Object.keys(api.paths)),
    locks[indexPath]
  );
  if (!!hash) {
    locks[indexPath] = hash;
  }
  return Promise.resolve();
}

async function writeControllers(
  basePath: string,
  api: OpenAPIV3,
  locks: { [key: string]: string }
): Promise<void> {
  const operations: { [key: string]: Operation[] } = _.groupBy(
    loadOperations(api),
    "path"
  );
  for (const [path, ops] of Object.entries(operations)) {
    const controllerPath = resolve(
      basePath,
      "src",
      "controller",
      `${pathToFileName(path)}-controller.ts`
    );
    const hash = await executeTemplateIfTargetNotEditedByUser(
      controllerPath,
      "controller.ts",
      controllerFill(path, ops),
      locks[controllerPath]
    );
    if (!!hash) {
      locks[controllerPath] = hash;
    }
  }
  return Promise.resolve();
}

async function writeEnv(
  basePath: string,
  api: OpenAPIV3,
  locks: { [key: string]: string }
): Promise<void> {
  const envPath = resolve(basePath, ".env");
  // const port = api.servers && api.servers.find(srv => srv.url.match('http\:\/\/localhost\:([0-9]+).*'))
  // TODO get a real port and auth

  const security = Object.values(api.components.securitySchemes)[0];

  const env = await envFill(
    9000,
    (security.openIdConnectUrl as string) || null
  );
  const hash = await executeTemplateIfTargetNotEditedByUser(
    envPath,
    ".env",
    env,
    locks[envPath]
  );
  if (!!hash) {
    locks[envPath] = hash;
  }
  return Promise.resolve();
}

async function writeAuthMiddleware(
  basePath: string,
  api: OpenAPIV3,
  locks: { [key: string]: string }
): Promise<void> {
  const middlewarePath = resolve(
    basePath,
    "src",
    "middleware",
    "auth.middleware.ts"
  );

  const hash = await executeTemplateIfTargetNotEditedByUser(
    middlewarePath,
    "auth.middleware.ts",
    {},
    locks[middlewarePath]
  );
  if (!!hash) {
    locks[middlewarePath] = hash;
  }
  return Promise.resolve();
}

async function writeModels(
  basePath: string,
  api: OpenAPIV3,
  locks: { [key: string]: string }
): Promise<void> {
  const entities = loadEntities(api);
  for (const entity of entities) {
    const modelPath = resolve(
      basePath,
      "src",
      "model",
      `${_.kebabCase(entity.name)}.ts`
    );
    const hash = await executeTemplateIfTargetNotEditedByUser(
      modelPath,
      "model.ts",
      modelFill(entity),
      locks[modelPath]
    );
    if (!!hash) {
      locks[modelPath] = hash;
    }
  }
  return Promise.resolve();
}

function pathToFileName(path: string): string {
  return path
    .replace(/[\{\}]/g, "")
    .replace(/^\//g, "")
    .replace("/", "-")
    .trim();
}
