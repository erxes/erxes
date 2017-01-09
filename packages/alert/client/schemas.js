import { SimpleSchema } from 'meteor/aldeed:simple-schema';


const Schemas = {
  Alerts: new SimpleSchema({
    type: {
      type: String,
    },
    title: {
      type: String,
      optional: true,
    },
    message: {
      type: String,
      optional: true,
    },
    createdDate: {
      type: Date,
      autoValue() {
        return new Date();
      },
    },
  }),
};

export default Schemas;
