import { reference } from "@chillapi/api";
import { Operation } from "@chillapi/api/dist/openapiv3";
import _ from "lodash";
import { typeMap } from "./model-filler";

export interface MethodAuthModel {
    scope: string;
}

export interface MethodModel {
    name: string;
    nameCapital: string;
    // Supports only one auth schema
    auth?: MethodAuthModel;
    defaultResponseCode: number;
    pathParameters: string[],
    queryParameters: string[],
    responseType: string;
    responseIsArray: boolean;
    responseEntityType?: string;
}

export interface ControllerModel {
    anyAuth: boolean;
    pathCamel: string;
    pathDash: string;
    methods: MethodModel[];
}

export const fill = (pathName: string, methods: { [methodName: string]: Operation }): ControllerModel => {
    const methodModels: MethodModel[] = Object.entries(methods).map(methodEntry => {
        const name = methodEntry[0].replace('{', ':').replace('}', '');
        const parameters = methodEntry[1].parameters || [];
        const defaultResponse = Object.entries(methodEntry[1].responses)[0];
        const responseSchema = defaultResponse[1].content['application/json'].schema;
        const responseEntityType = reference(responseSchema);
        let simpleType = responseSchema.format ? `${responseSchema.type}:${responseSchema.format}` : responseSchema.type
        const responseIsArray = !!responseSchema.type?.array
        if (responseIsArray) {
            const arrayItemDef = responseSchema.type.array.items
            simpleType = arrayItemDef.format ? `${arrayItemDef.type}:${arrayItemDef.format}` : arrayItemDef.type
        }
        const authScopes = !!methodEntry[1].security && Object.values(methodEntry[1].security[0]).join(' ');
        return {
            name,
            nameCapital: _.capitalize(name),
            defaultResponseCode: Number(defaultResponse[0]),
            responseType: responseEntityType || typeMap[simpleType] || simpleType,
            responseEntityType,
            responseIsArray,
            auth: !!authScopes && { scope: authScopes },
            pathParameters: parameters.filter(p => p.in === 'path').map(p => p.name),
            queryParameters: parameters.filter(p => p.in === 'query').map(p => p.name)
        }
    });

    return {
        pathCamel: _.camelCase(pathName),
        pathDash: _.kebabCase(pathName),
        anyAuth: Object.values(methods).some(method => !!method.security),
        methods: methodModels
    };
}