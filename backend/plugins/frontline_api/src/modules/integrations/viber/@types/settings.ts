import type { Document } from 'mongoose';

export interface IViberSettingsDocument extends Document {
  _id: string;
  mediaHostnames: string[];
}

export interface IViberMediaSettings {
  hostnames: string[];
  source: 'settings' | 'environment' | 'default';
}
