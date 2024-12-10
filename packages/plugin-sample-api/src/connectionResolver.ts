import * as mongoose from "mongoose";
import { IContext as IMainContext } from "@erxes/api-utils/src";
import { createGenerateModels } from "@erxes/api-utils/src/core";
import { ITypeModel, loadTypeClass } from "./models/Type";
import { ITypeDocument } from "./models/definitions/type";
import { ISampleModel, loadSampleClass } from "./models/Sample";
import { ISampleDocument } from "./models/definitions/sample";
3
export interface IModels {
    Types: ITypeModel;
    Samples: ISampleModel;
}

export interface IContext extends IMainContext {
    subdomain: string;
    models: IModels;
    serverTiming: any;
}

export const loadClasses = (
    db: mongoose.Connection,
    subdomain: string
): IModels => {
    const models = {} as IModels;

    models.Types = db.model<ITypeDocument, ITypeModel>("types", loadTypeClass(models, subdomain));

    models.Samples = db.model<ISampleDocument, ISampleModel>("samples", loadSampleClass(models, subdomain));

    return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
