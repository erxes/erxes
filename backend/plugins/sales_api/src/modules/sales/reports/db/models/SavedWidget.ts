import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ISavedWidget, savedWidgetSchema } from '../definitions/savedWidget';

export interface ISavedWidgetModel extends Model<ISavedWidget> {
  // future static methods can be added here
}

export const loadSavedWidgetClass = (models: IModels) => {
  class SavedWidget {
    // you can define static methods here if needed
  }
  savedWidgetSchema.loadClass(SavedWidget);
  return savedWidgetSchema;
};
