import { Model } from "mongoose";
import { IModels } from "../connectionResolver";
import { IBotDocument, botSchema } from "./definitions/bots";
export interface IBotModel extends Model<IBotDocument> {}

export const loadBotClass = (models: IModels) => {
  return botSchema;
};
