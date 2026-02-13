import mongoose, { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { attachmentSchema } from 'erxes-api-shared/core-modules';
import { IWebDocument } from '../../@types/web';


export const webSchema = new mongoose.Schema<IWebDocument> (
    {
        _id:mongooseStringRandomId,
        clientPortalId:{type : String, required : true, unique: true},

        name : {type : String, required: true},
        description: {type : String },
        keywords : {type : [String]},
        domain : {type: String},
        copyright : {type : String},

        logo : { type: attachmentSchema },
        favicon : {type: attachmentSchema },
        thumbnail : {type: attachmentSchema},

        appearances:{
            backgroundColor: {type: String},
            primaryColor: {type: String},
            secondaryColor: {type: String},
            accentColor: {type: String},
            fontSans: String,
            fontHeading:String,
            fontMono: String,
          }
    },
    {timestamps: true}
)