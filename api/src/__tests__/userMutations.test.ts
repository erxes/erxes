import * as bcrypt from 'bcryptjs';
import * as faker from 'faker';
import * as moment from 'moment';
import * as sinon from 'sinon';
import utils, * as allUtils from '../data/utils';
import { graphqlRequest } from '../db/connection';
import {
  brandFactory,
  channelFactory,
  userFactory,
  usersGroupFactory
} from '../db/factories';
import { Brands, Channels, Users } from '../db/models';
import './setup.ts';

/*
 * Generated test data
 */
const args = {
  username: faker.internet.userName(),
  email: faker.internet.email().toLowerCase(),
  details: {
    avatar: faker.image.avatar(),
    fullName: faker.name.findName(),
    position: faker.name.jobTitle(),
    location: faker.address.streetName(),
    description: faker.random.word()
  },
  links: {
    linkedIn: faker.internet.userName(),
    twitter: faker.internet.userName(),
    facebook: faker.internet.userName(),
    github: faker.internet.userName(),
    youtube: faker.internet.userName(),
    website: faker.internet.url()
  },
  password: 'pass'
};

const toJSON = value => {
  return JSON.stringify(value, Object.keys(value).sort());
};

describe('User mutations', () => {
  let _user;
  let _admin;
  let _channel;
  let _brand;

  let context;
  const strongPassword = 'Password123';

  const commonParamDefs = `
    $username: String!
    $email: String!
    $details: UserDetails
    $links: JSON
    $channelIds: [String]
  `;

  const commonParams = `
    username: $username
    email: $email
    details: $details
    links: $links
    channelIds: $channelIds
  `;

  const usersCreateOwnerMutation = `
    mutation usersCreateOwner($email: String! $password: String! $firstName: String! $subscribeEmail: Boolean!) {
      usersCreateOwner(email: $email password: $password firstName: $firstName subscribeEmail: $subscribeEmail)
    }
  `;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _admin = await userFactory({});
    _channel = await channelFactory({});
    _brand = await brandFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Users.deleteMany({});
    await Brands.deleteMany({});
    await Channels.deleteMany({});
  });

  test('Create owner (Access denied)', async () => {
    process.env.HTTPS = 'false';

    try {
      await graphqlRequest(
        usersCreateOwnerMutation,
        'usersCreateOwner',
        {
          email: 'owner1@gmail.com',
          password: 'pass',
          firstName: 'Firstname',
          subscribeEmail: false
        },
        { user: {} }
      );
    } catch (e) {
      expect(e[0].message).toBe('Access denied');
    }
  });

  test('Create owner', async () => {
    process.env.HTTPS = 'false';

    await Users.deleteMany({});

    const response = await graphqlRequest(
      usersCreateOwnerMutation,
      'usersCreateOwner',
      {
        email: 'owner2@gmail.com',
        password: 'Pass@123',
        firstName: 'Firstname',
        subscribeEmail: false
      },
      { user: {} }
    );

    expect(response).toBe('success');
  });

  test('Create owner (Subscribe email)', async () => {
    process.env.HTTPS = 'false';
    process.env.NODE_ENV = 'production';

    await Users.deleteMany({});

    const mock = sinon.stub(allUtils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });

    const response = await graphqlRequest(
      usersCreateOwnerMutation,
      'usersCreateOwner',
      {
        email: 'owner3@gmail.com',
        password: 'Pass@123',
        firstName: 'Firstname',
        subscribeEmail: true
      },
      { user: {} }
    );

    mock.restore();
    process.env.NODE_ENV = 'test';

    expect(response).toBe('success');
  });

  test('Login', async () => {
    process.env.HTTPS = 'false';

    const mutation = `
      mutation login($email: String! $password: String! $deviceToken: String) {
        login(email: $email password: $password deviceToken: $deviceToken)
      }
    `;

    const response = await graphqlRequest(mutation, 'login', {
      email: _user.email,
      password: 'pass',
      deviceToken: '111'
    });

    const updatedUser = await Users.findOne({ email: _user.email });

    if (!updatedUser || !updatedUser.deviceTokens) {
      throw new Error('Updated user not found');
    }

    expect(updatedUser.deviceTokens.length).toBe(1);
    expect(updatedUser.deviceTokens).toContain('111');
    expect(response).toBe('loggedIn');
  });

  test('Forgot password', async () => {
    process.env.MAIN_APP_DOMAIN = ' ';
    process.env.COMPANY_EMAIL_FROM = ' ';

    const mutation = `
      mutation forgotPassword($email: String!) {
        forgotPassword(email: $email)
      }
    `;

    await graphqlRequest(mutation, 'forgotPassword', { email: _user.email });

    const user = await Users.findOne({ email: _user.email });

    if (!user) {
      throw new Error('User not found');
    }

    expect(user.resetPasswordToken).toBeDefined();
  });

  test('Reset password', async () => {
    // create the random token
    const token = 'token';
    const user = await userFactory({});

    await Users.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: token,
          resetPasswordExpires: Date.now() + 86400000
        }
      }
    );

    const mutation = `
      mutation resetPassword($token: String! $newPassword: String!) {
        resetPassword(token: $token newPassword: $newPassword)
      }
    `;

    const params = {
      token,
      newPassword: strongPassword
    };

    await graphqlRequest(mutation, 'resetPassword', params);

    const updatedUser = await Users.findOne({ _id: user._id });

    if (!updatedUser) {
      throw new Error('User not found');
    }

    expect(
      bcrypt.compare(params.newPassword, updatedUser.password)
    ).toBeTruthy();
  });

  test('usersInvite', async () => {
    process.env.MAIN_APP_DOMAIN = ' ';
    process.env.COMPANY_EMAIL_FROM = ' ';

    const spyEmail = jest.spyOn(utils, 'sendEmail');

    const mutation = `
      mutation usersInvite($entries: [InvitationEntry]) {
        usersInvite(entries: $entries)
      }
    `;

    const group = await usersGroupFactory();

    const params = {
      entries: [
        {
          email: 'test@example.com',
          password: strongPassword,
          groupId: group._id
        }
      ]
    };

    await graphqlRequest(mutation, 'usersInvite', params, { user: _admin });

    const user = await Users.findOne({ email: 'test@example.com' });

    if (!user) {
      throw new Error('User not found');
    }

    const token = user.registrationToken || '';

    const { MAIN_APP_DOMAIN } = process.env;
    const invitationUrl = `${MAIN_APP_DOMAIN}/confirmation?token=${token}`;

    // send email call
    expect(spyEmail).toBeCalledWith({
      toEmails: ['test@example.com'],
      title: 'Team member invitation',
      template: {
        name: 'userInvitation',
        data: {
          content: invitationUrl,
          domain: MAIN_APP_DOMAIN
        }
      }
    });

    spyEmail.mockRestore();
  });

  test('usersResendInvitation', async () => {
    process.env.MAIN_APP_DOMAIN = ' ';
    process.env.COMPANY_EMAIL_FROM = ' ';

    const spyEmail = jest.spyOn(utils, 'sendEmail');

    const mutation = `
      mutation usersResendInvitation($email: String!) {
        usersResendInvitation(email: $email)
      }
    `;

    const user = await userFactory({ registrationToken: 'token' });
    const token = await graphqlRequest(mutation, 'usersResendInvitation', {
      email: user.email
    });

    const { MAIN_APP_DOMAIN } = process.env;
    const invitationUrl = `${MAIN_APP_DOMAIN}/confirmation?token=${token}`;

    // send email call
    expect(spyEmail).toBeCalledWith({
      toEmails: [user.email],
      title: 'Team member invitation',
      template: {
        name: 'userInvitation',
        data: {
          content: invitationUrl,
          domain: MAIN_APP_DOMAIN
        }
      }
    });

    spyEmail.mockRestore();
  });

  test('usersConfirmInvitation', async () => {
    await userFactory({
      email: 'test@example.com',
      registrationToken: '123',
      registrationTokenExpires: moment(Date.now())
        .add(7, 'days')
        .toDate()
    });

    const mutation = `
      mutation usersConfirmInvitation($token: String, $password: String, $passwordConfirmation: String) {
        usersConfirmInvitation(token: $token, password: $password, passwordConfirmation: $passwordConfirmation) {
          _id
        }
      }
  `;

    const params = {
      token: '123',
      password: strongPassword,
      passwordConfirmation: strongPassword
    };

    await graphqlRequest(mutation, 'usersConfirmInvitation', params);

    const userObj = await Users.findOne({ email: 'test@example.com' });

    // send email call
    expect(userObj).toBeDefined();
  });

  test('Edit user', async () => {
    const doc = {
      ...args,
      passwordConfirmation: 'pass',
      channelIds: [_channel._id]
    };

    const mutation = `
      mutation usersEdit($_id: String! ${commonParamDefs}) {
        usersEdit(_id: $_id ${commonParams}) {
          _id
          username
          email
          details {
            fullName
            avatar
            location
            position
            description
          }
          links
        }
      }
    `;

    let user = await graphqlRequest(
      mutation,
      'usersEdit',
      { _id: _user._id, ...doc },
      { user: _admin }
    );

    let channel = await Channels.getChannel(_channel._id);

    expect(channel.memberIds).toContain(user._id);
    expect(user.username).toBe(doc.username);
    expect(user.email.toLowerCase()).toBe(doc.email.toLowerCase());
    expect(user.details.fullName).toBe(doc.details.fullName);
    expect(user.details.avatar).toBe(doc.details.avatar);
    expect(user.details.location).toBe(doc.details.location);
    expect(user.details.position).toBe(doc.details.position);
    expect(user.details.description).toBe(doc.details.description);
    expect(user.links.linkedIn).toBe(doc.links.linkedIn);
    expect(user.links.twitter).toBe(doc.links.twitter);
    expect(user.links.facebook).toBe(doc.links.facebook);
    expect(user.links.github).toBe(doc.links.github);
    expect(user.links.youtube).toBe(doc.links.youtube);
    expect(user.links.website).toBe(doc.links.website);

    // if channelIds is empty
    user = await graphqlRequest(
      mutation,
      'usersEdit',
      { _id: _user._id, ...doc, channelIds: undefined },
      { user: _admin }
    );
    channel = await Channels.getChannel(_channel._id);

    expect(channel.memberIds).not.toContain(user._id);
  });

  test('Edit user profile', async () => {
    const mutation = `
      mutation usersEditProfile(
        $username: String!
        $email: String!
        $details: UserDetails
        $links: JSON
        $password: String!
      ) {
        usersEditProfile(
          username: $username
          email: $email
          details: $details
          links: $links
          password: $password
        ) {
          username
          email
          details {
            fullName
            avatar
            location
            position
            description
          }
          links
        }
      }
    `;

    const user = await graphqlRequest(
      mutation,
      'usersEditProfile',
      args,
      context
    );

    expect(user.username).toBe(args.username);
    expect(user.email.toLowerCase()).toBe(args.email.toLowerCase());
    expect(user.details.fullName).toBe(args.details.fullName);
    expect(user.details.avatar).toBe(args.details.avatar);
    expect(user.details.location).toBe(args.details.location);
    expect(user.details.position).toBe(args.details.position);
    expect(user.details.description).toBe(args.details.description);
    expect(user.links.linkedIn).toBe(args.links.linkedIn);
    expect(user.links.twitter).toBe(args.links.twitter);
    expect(user.links.facebook).toBe(args.links.facebook);
    expect(user.links.github).toBe(args.links.github);
    expect(user.links.youtube).toBe(args.links.youtube);
    expect(user.links.website).toBe(args.links.website);

    // if password is empty
    args.password = '';
    try {
      await graphqlRequest(mutation, 'usersEditProfile', args, context);
    } catch (e) {
      expect(e[0].message).toBe('Invalid password. Try again');
    }

    // if password is not match
    args.password = 'updated';
    try {
      await graphqlRequest(mutation, 'usersEditProfile', args, context);
    } catch (e) {
      expect(e[0].message).toBe('Invalid password. Try again');
    }
  });

  test('Change user password', async () => {
    const previousPassword = _user.password;

    const mutation = `
      mutation usersChangePassword(
        $currentPassword: String!
        $newPassword: String!
      ) {
        usersChangePassword(
          currentPassword: $currentPassword
          newPassword: $newPassword
        ) {
          _id
        }
      }
    `;

    await graphqlRequest(
      mutation,
      'usersChangePassword',
      {
        currentPassword: 'pass',
        newPassword: strongPassword
      },
      context
    );

    const user = await Users.getUser(_user._id);

    expect(user.password).not.toBe(previousPassword);
  });

  test('Remove user', async () => {
    const mutation = `
      mutation usersSetActiveStatus($_id: String!) {
        usersSetActiveStatus(_id: $_id) {
          _id
          isActive
        }
      }
    `;

    await Users.updateOne(
      { _id: _user._id },
      { $unset: { registrationToken: 1, isOwner: false } }
    );

    const response = await graphqlRequest(
      mutation,
      'usersSetActiveStatus',
      { _id: _user._id },
      { user: _admin }
    );

    expect(response.isActive).toBe(false);

    // if deactivate yourself
    try {
      await graphqlRequest(
        mutation,
        'usersSetActiveStatus',
        { _id: _admin._id },
        { user: _admin }
      );
    } catch (e) {
      expect(e[0].message).toBe('You can not delete yourself');
    }
  });

  test('Config user email signature', async () => {
    const signatures = [
      {
        signature: faker.random.word(),
        brandId: _brand._id
      }
    ];

    const mutation = `
      mutation usersConfigEmailSignatures($signatures: [EmailSignature]) {
        usersConfigEmailSignatures(signatures: $signatures) {
          emailSignatures
        }
      }
    `;

    const user = await graphqlRequest(
      mutation,
      'usersConfigEmailSignatures',
      { signatures },
      context
    );

    expect(toJSON(user.emailSignatures)).toEqual(toJSON(signatures));
  });

  test('Config user get notification by email', async () => {
    const mutation = `
      mutation usersConfigGetNotificationByEmail($isAllowed: Boolean) {
        usersConfigGetNotificationByEmail(isAllowed: $isAllowed) {
          getNotificationByEmail
        }
      }
    `;

    const user = await graphqlRequest(
      mutation,
      'usersConfigGetNotificationByEmail',
      { isAllowed: true },
      context
    );

    expect(user.getNotificationByEmail).toBeDefined();
  });

  test('Logout', async () => {
    const mutation = `
      mutation logout {
        logout
      }
    `;

    const res = {
      clearCookie: () => {
        return 'clearCookie';
      }
    };

    const response = await graphqlRequest(mutation, 'logout', {}, { res });

    expect(response).toBe('loggedout');
  });

  test('Reset member password', async () => {
    const previousPassword = _user.password;

    const mutation = `
      mutation usersResetMemberPassword(
        $_id: String!
        $newPassword: String!
      ) {
        usersResetMemberPassword(
          _id: $_id
          newPassword: $newPassword
        ) {
          _id
        }
      }
    `;

    const user = await graphqlRequest(
      mutation,
      'usersResetMemberPassword',
      { _id: _user.id, newPassword: strongPassword },
      context
    );
    // if not newPassword
    try {
      await graphqlRequest(
        mutation,
        'usersResetMemberPassword',
        { _id: _user.id, newPassword: '' },
        context
      );
    } catch (e) {
      expect(e[0].message).toBe('Password is required.');
    }

    expect(user.password).not.toBe(previousPassword);
  });
});
