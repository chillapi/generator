import { Operation, Response } from "@chillapi/api";
import _ from "lodash";
import { typeMap } from "./model-filler";

export interface OperationModel extends Operation {
  defaultResponse: Response;
  methodCapital: string;
  parameters: string[];
}

export interface ControllerModel {
  anyAuth: boolean;
  pathCamel: string;
  pathDash: string;
  operations: OperationModel[];
  returnEntityTypes: string[];
}

export const fill = (
  pathName: string,
  operations: Operation[]
): ControllerModel => {
  const returnEntityTypes: string[] = [];
  const ops: OperationModel[] = [];

  for (const op of operations) {
    const responses = op.responses.map((res) => ({
      ...res,
      content: {
        ...res.content,
        type: typeMap[res.content.type] || res.content.type,
      },
    }));
    const defaultResponse = responses.find((re) => re.isDefault);
    if (
      defaultResponse.content.isReference &&
      !returnEntityTypes.includes(defaultResponse.content.type)
    ) {
      returnEntityTypes.push(defaultResponse.content.type);
    }

    const parameters: string[] = [];

    if (op.body) {
      parameters.push("request.body");
    }

    [...(op.pathParameters||[]), ...(op.queryParameters||[])].forEach((p) =>
      parameters.push(`request.params.${p.name}`)
    );

    ops.push({
      ...op,
      responses,
      defaultResponse,
      methodCapital: _.capitalize(op.method),
      parameters,
    });
  }

  return {
    pathCamel: _.camelCase(pathName),
    pathDash: _.kebabCase(pathName),
    anyAuth: operations.some((op) => !!op.authorizationScopes),
    operations: ops,
    returnEntityTypes,
  };
};
