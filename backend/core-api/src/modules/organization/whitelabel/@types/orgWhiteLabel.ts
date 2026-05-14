import { Document } from 'mongoose';

export interface IOrgWhiteLabel {
  orgLogo?: string;
  orgLoginText?: string;
  orgLoginDescription?: string;
  orgFavicon?: string;
  orgShortDescription?: string;
  orgShortName?: string;
  enabled?: boolean;
}

export interface IOrgWhiteLabelDocument extends Document, IOrgWhiteLabel {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
