import { Model } from "mongoose";
import { IModels } from "../connectionResolver";
import { IType, ITypeDocument, typeSchema } from "./definitions/type";

export interface ITypeModel extends Model<ITypeDocument> {
    getType(_id: string): Promise<ITypeDocument>;
    createType(doc: IType): Promise<ITypeDocument>;
    updateType(_id: string, doc: IType): Promise<ITypeDocument>;
    removeType(_id: string): object;
}

export const loadTypeClass = (models: IModels, subdomain: string) => {
    class Type {
        public static async getType(_id: string) {
            const type = await models.Types.findOne({ _id });

            if (!type) {
                throw new Error('Type not found');
            }

            return type;
        }
        // create type
        public static async createType(doc) {
            return models.Types.create({ ...doc });
        }
        // remove type
        public static async removeType(_id: string) {
            return models.Types.deleteOne({ _id });
        }

        public static async updateType(_id: string, doc) {
            return models.Types.updateOne({ _id }, { $set: { ...doc } });
        }
    }

    typeSchema.loadClass(Type);
    return typeSchema;
};