import mongoose, { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { attachmentSchema } from 'erxes-api-shared/core-modules';
import { IWebDocument } from '../../@types/web';


export const webSchema = new mongoose.Schema<IWebDocument> (
    {
        _id:mongooseStringRandomId,
        clientPortalId:{type : String, required : true},

        name : {type : String, required: true},
        description: {type : String, required:true },
        keywords : {type : [String]},
        domain : {type: String, required: true},
        copyright : {type : String, required:true},

        logo : { type: attachmentSchema },
        favicon : {type: attachmentSchema },
        thumbnail : {type: attachmentSchema},

        appearances: [
            {
            _id: mongooseStringRandomId,
            backgroundColor: {type: String, required: true},
            primaryColor: {type: String, required: true},
            secondaryColor: {type: String, required: true},
            accentColor: {type: String, required: true},
            fontSans: String,
            fontHeading:String,
            fontMono: String,
          },
        ], 
    },
    {timestamps: true}
)