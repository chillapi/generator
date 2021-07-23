import { Entity } from "@chillapi/api";

export const typeMap: { [key: string]: string } = {
    'string': 'string',
    'string:date': 'Date',
    'string:date-time': 'Date',
    'number': 'number',
    'number:float': 'number',
    'integer': 'number',
    'integer:int64': 'number',
    'boolean': 'boolean'
    // TODO add others
}

export interface EntityPropertyModel {
    propertyName: string;
    propertyDescription: string;
    optional: boolean;
    propertyType: string;
}
export interface ForeignKeyModel {
    entityName: string;
}
export interface EntityModel {
    entityName: string;
    properties: EntityPropertyModel[];
    foreignKeys: ForeignKeyModel[];
}

export const fill = (entity: Entity): EntityModel => ({
    entityName: entity.name,
    properties: entity.properties.map(prop => ({
        propertyName: prop.name,
        propertyDescription: prop.description,
        propertyType: typeMap[prop.type] || prop.type,
        optional: !prop.isRequired
    })),
    foreignKeys: entity.properties
        .filter(prop => !!prop.reference)
        .map(prop => ({ entityName: prop.reference }))
})
