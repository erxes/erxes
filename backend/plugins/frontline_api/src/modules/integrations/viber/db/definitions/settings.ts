import { Schema } from 'mongoose';
import { normalizeViberMediaHostnames } from '../../utils/mediaHostnames';
import { VIBER_MEDIA_SETTINGS_ID } from '../../constants';

export const viberSettingsSchema = new Schema({
  _id: { type: String, enum: [VIBER_MEDIA_SETTINGS_ID], required: true },
  mediaHostnames: {
    type: [String],
    required: true,
    default: undefined,
    validate: (value: string[]) => {
      const normalized = normalizeViberMediaHostnames(value);
      return (
        normalized.length === value.length &&
        normalized.every((hostname, index) => hostname === value[index])
      );
    },
  },
});
