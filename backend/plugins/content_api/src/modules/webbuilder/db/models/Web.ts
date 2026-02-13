import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers'
import { IWeb, IWebDocument } from '~/modules/webbuilder/@types/web'
import { webSchema } from '../definitions/web';

export interface IWebModel extends Model<IWebDocument>{
    getWebList(): Promise<IWebDocument[]>;
    getWebDetail(_id: string) : Promise<IWebDocument>;
    createWeb( docFields: IWeb) : Promise<IWebDocument>;
    updateWeb(
        _id: string,
        docFields : IWeb,
    ): Promise <IWebDocument>;
    removeWeb(_id: string): Promise<IWebDocument>;
}

export const loadWebClass = (models: IModels) => {
    class Web {
        public static async getWebList(){
            return models.Web.find({}).sort({ createdAt: -1}).exec();
        }

        public static async getWebDetail(_id:string){
           const doc = await models.Web.findOne({ _id : _id});
           if (!doc) throw new Error('Web not found');
           return doc;
        }

        public static async createWeb( docFields: IWeb ){

            const existing = await models.Web.findOne({
                clientPortalId: docFields.clientPortalId
            });

            if(existing){
                throw new Error(`A web already exists for clientPortal: ${docFields.clientPortalId}`)
            }

            return models.Web.create({
                ...docFields,
                createdDate: new Date(),
                modifiedDate: new Date()
            })
        }
        
        public static async updateWeb(_id:string, docFields: IWeb){  

            const existing = await models.Web.findOne({
                clientPortalId: docFields.clientPortalId
            });

            if (existing){
                throw new Error(`A web already exists for clientPortal: ${docFields.clientPortalId}`)
            }

            
            const update = await models.Web.findOneAndUpdate(
                { _id },
                { $set: {...docFields, modifiedDate: new Date()} },
                { new: true },
                
            );
            if(!update) throw new Error('Web not found');
            return update;
        }

        public static async removeWeb(_id: string): Promise<IWebDocument> {
            const deleted = await models.Web.findOneAndDelete({ _id }).exec();
            if (!deleted) throw new Error('Web not found');
            return deleted;
          }
    }
    webSchema.loadClass(Web);

    return webSchema;
}