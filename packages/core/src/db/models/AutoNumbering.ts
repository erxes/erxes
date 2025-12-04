import { Model } from 'mongoose';
import { IModels } from '../../connectionResolver';
import {
 IAutoNumbering,
 IAutoNumberingDocument,
 autoNumberingSchema
} from './definitions/autoNumbering';


export interface IAutoNumberingModel extends Model<IAutoNumberingDocument> {
 getAutoNumbering(selector: any): Promise<IAutoNumberingDocument>;
 createAutoNumbering(doc: IAutoNumbering): Promise<IAutoNumberingDocument>;
 updateAutoNumbering(_id: string, doc: Partial<IAutoNumbering>): Promise<IAutoNumberingDocument | null>;
 removeAutoNumbering(_id: string): Promise<string>;
 generateAutoNumber(module: string): Promise<string>;
}


export const loadAutoNumberingClass = (models: IModels) => {
 class AutoNumbering {
   /**
    * Get auto numbering configuration
    */
   public static async getAutoNumbering(selector: any) {
     const autoNumbering = await models.AutoNumbering.findOne(selector);


     if (!autoNumbering) {
       throw new Error('Auto numbering configuration not found');
     }


     return autoNumbering;
   }


   /**
    * Create auto numbering configuration
    */
   public static async createAutoNumbering(doc: IAutoNumbering) {
     return models.AutoNumbering.create({
       ...doc,
       createdAt: new Date()
     });
   }


   /**
    * Update auto numbering configuration
    */
   public static async updateAutoNumbering(_id: string, doc: Partial<IAutoNumbering>) {
     await models.AutoNumbering.updateOne({ _id }, { $set: doc });
     return models.AutoNumbering.findOne({ _id });
   }


   /**
    * Remove auto numbering configuration
    */
   public static async removeAutoNumbering(_id: string) {
     const autoNumbering = await this.getAutoNumbering(_id);
     await models.AutoNumbering.deleteOne({ _id });
     return autoNumbering._id;
   }


   /**
    * Generate next auto number
    */
   public static async generateAutoNumber(module: string): Promise<string> {
     const config = await models.AutoNumbering.findOne({ module });


     if (!config) {
       throw new Error(`No auto numbering configuration found for module: ${module}`);
     }


     const updated = await models.AutoNumbering.findOneAndUpdate(
       { module },
       { $inc: { lastNumber: 1 } },
       { new: true }
     );


     if (!updated) {
       throw new Error(`Failed to generate auto number for module: ${module}`);
     }


     const paddedNumber = String(updated.lastNumber).padStart(updated.fractionalPart || 4, "0");
     let generatedNumber = updated.pattern;
    
     const now = new Date();
     generatedNumber = generatedNumber
       .replace(/\{number\}/g, paddedNumber)
       .replace(/\{year\}/g, now.getFullYear().toString())
       .replace(/\{month\}/g, String(now.getMonth() + 1).padStart(2, '0'))
       .replace(/\{day\}/g, String(now.getDate()).padStart(2, '0'));


     return generatedNumber;
   }
 }


 autoNumberingSchema.loadClass(AutoNumbering);
 return autoNumberingSchema;
};
