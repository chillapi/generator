import _ from "lodash";

export interface PathModel {
    path: string;
    camelName: string;
    dashName: string;
}

export interface IndexModel {
    paths: PathModel[]
}

export const fill = (pathNames: string[]): IndexModel => ({
    paths: pathNames.map(path => ({
        path,
        camelName: _.camelCase(path),
        dashName: _.kebabCase(path)
    }))
})