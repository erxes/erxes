import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { ROLES } from './constants';


// user common infos schema
const CommonInfo = {
  avatar: {
    type: String,
    optional: true,
  },

  fullName: {
    type: String,
  },

  username: {
    type: String,
  },

  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
};

// ************* invitation  ***************** //
const InvitationCommon = _.extend({}, CommonInfo, {
  // owner, admin, contributor
  role: {
    type: String,
    allowedValues: [ROLES.ADMIN, ROLES.CONTRIBUTOR],
  },

  // channels to invite
  channelIds: {
    type: [String],
    optional: true,
  },
});


export const CreateInvitationSchema = new SimpleSchema([
  InvitationCommon,

  {
    password: {
      type: String,
    },

    passwordConfirmation: {
      type: String,
    },
  },
]);

export const UpdateInvitationSchema = new SimpleSchema([
  InvitationCommon,

  {
    userId: {
      type: String,
    },

    password: {
      type: String,
      optional: true,
    },

    passwordConfirmation: {
      type: String,
      optional: true,
    },
  },
]);

// profile
export const ProfileSchema = new SimpleSchema([
  CommonInfo,

  {
    currentPassword: {
      type: String,
      optional: true,
    },
  },
]);

// email signatures
export const EmailSignaturesSchema = new SimpleSchema({
  signatures: {
    type: [
      new SimpleSchema({
        brandId: {
          type: String,
          regEx: SimpleSchema.RegEx.Id,
        },

        signature: {
          type: String,
        },
      }),
    ],
  },
});
