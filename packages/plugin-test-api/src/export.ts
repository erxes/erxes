import { IModels } from "./connectionResolver";

const toCamelCase = (str: string) => {
    return str.replace(/[-_](.)/g, function (match, group) {
        return group.toUpperCase();
    });
};

export const buildFile = async (models: IModels, subdomain: string, params: any) => {

    const { _id, categories, ...restParams } = params

    const stringified = JSON.stringify(restParams)

    return {
        name: `${toCamelCase(params.name)}`,
        response: stringified,
    };
};