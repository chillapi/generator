import yargs from "yargs";
import { generate } from "./service/generate/GenerateTools";


// tslint:disable-next-line:no-unused-expression
yargs
  .command(
    "generate",
    "Generates ChillAPI configuration stubs based on existing OpenAPI spec",
    (y) =>
      y
        .alias("a", "apiPath")
        .nargs("a", 1)
        .describe("a", "OpenAPI 3.0 API descriptor file (yaml)")
        .alias("t", "rootPath")
        .nargs("t", 1)
        .describe("t", "Root path for the Chill API generated files")
        .default("t", ".")
        .alias("m", "moduleName")
        .nargs("m", 1)
        .describe(
          "m",
          "Module to be used for stub generation; if not present, it will be detected among dependencies"
        )
        .example(
          "$0 --apiPath /path/to/my/openapi.yaml -t ./generated",
          "Generates ChillAPI configuration for the provided API, in a folder called generated"
        ),
    async (args) => {
      try {
        await generate(args.apiPath, args.rootPath, args.moduleName);
      } catch (err) {
        console.error("Config generation failed");
        console.error(err);
      }
    }
  )
  .help("?")
  .alias("?", "help")
  .showHelpOnFail(true)
  .demandCommand(1, "").argv;
