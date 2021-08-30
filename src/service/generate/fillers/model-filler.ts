import { Entity } from "@chillapi/api";

export const typeMap: { [key: string]: string } = {
    'string': 'string',
    'string:uuid': 'string',
    'string:date': 'Date',
    'string:date-time': 'Date',
    'string:email': 'string',
    'string:url': 'string',
    'number': 'number',
    'number:float': 'number',
    'integer': 'number',
    'integer:int64': 'number',
    'boolean': 'boolean'
    // TODO add others
}


export interface EntityModel extends Entity {
    foreignKeys: string[];
}

export const fill = (entity: Entity): EntityModel => ({
    ...entity,
    properties: entity.properties.map(prop => ({ ...prop, type: typeMap[prop.type] || prop.type })),
    foreignKeys: entity.properties
        .filter(prop => !!prop.isReference)
        .map(prop => prop.type)
        .filter((val, index, arr) => arr.indexOf(val) === index)
})
