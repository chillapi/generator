import { Operation, Response } from "@chillapi/api";
import _ from "lodash";
import { typeMap } from "./model-filler";

export interface OperationModel extends Operation {
  defaultResponse: Response;
  methodCapital: string;
  parameters: { name: string; type: string }[];
}

export interface ServiceModel {
  anyAuth: boolean;
  pathCamel: string;
  pathDash: string;
  operations: OperationModel[];
  returnEntityTypes: string[];
}

export const fill = (
  pathName: string,
  operations: Operation[]
): ServiceModel => {
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

    const parameters: { name: string; type: string }[] = [];

    if (op.body) {
      parameters.push({ name: "body", type: op.body.type });
    }

    [...(op.pathParameters || []), ...(op.queryParameters || [])].forEach((p) =>
      parameters.push({ name: p.name, type: typeMap[p.type] || p.type })
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
