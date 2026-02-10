import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers'
import { IWeb, IWebDocument } from '~/modules/webbuilder/@types/web'
import { webSchema } from '../definitions/web';

export interface IWebModel extends Model<IWebDocument>{
    getWebList(): Promise<IWebDocument[]>;
    getWebDetail(_id: string) : Promise<IWebDocument>;
    createWeb( docFields: IWeb, userId?: string) : Promise<IWebDocument>;
    updateWeb(
        _id: string,
        webFields : IWeb,
        userId?: string
    ): Promise <IWebDocument>;
    removeWeb(_id: string): void;
}

export const loadWebClass = (models: IModels) => {
    class Web {
        public static async getWebList(){
            return models.Web.find({}).sort({ createdAt: -1});
        }

        public static async getWebDetail(_id:string){
           const doc = await models.Web.findOne({_id});
           if (!doc) throw new Error('Web not found');
           return doc;
        }
        
        public static async updateWeb(_id:string, doc: IWeb){
            return models.Web.findOneAndUpdate
        }

        public static async removeWeb(_id:string){
            await models.Web.deleteOne({_id});
        }

        webSchema.loadClass(Web);

        return webSchema;

    }
}