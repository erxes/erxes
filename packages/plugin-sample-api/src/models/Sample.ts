import { Model } from 'mongoose';
import { IModels } from "../connectionResolver";
import { ISample, ISampleDocument, sampleSchema } from "./definitions/sample";
import { IUser } from '@erxes/api-utils/src/types';

export interface ISampleModel extends Model<ISampleDocument> {
    send(doc: ISample): Promise<ISampleDocument>;
    getSample(_id: string): Promise<ISampleDocument>;
    createSample(doc: ISample, user: IUser): Promise<ISampleDocument>;
    updateSample(_id: string, doc: ISample): Promise<ISampleDocument>;
    removeSample(_id: string): object;
}

export const loadSampleClass = (models: IModels, subdomain: string) => {
    class Sample {
        public static async getSample(_id: string) {
            const sample = await models.Samples.findOne({ _id });

            if (!sample) {
                throw new Error('Sample not found');
            }

            return sample;
        }

        // create
        public static async createSample(doc, user) {
            return models.Samples.create({
                ...doc,
                createdAt: new Date(),
                createdBy: user._id
            });
        }
        // update
        public static async updateSample(_id: string, doc) {
            await models.Samples.updateOne(
                { _id },
                { $set: { ...doc } }
            ).then(err => console.error(err));
        }
        // remove
        public static async removeSample(_id: string) {
            return models.Samples.deleteOne({ _id });
        }
        // send
        public static async send(doc) {
            const sample = await models.Samples.create({ doc });

            if (!sample) {
                throw new Error('Sample not found');
            }

            return sample;
        }
    }
    sampleSchema.loadClass(Sample);

    return sampleSchema;
};