import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import { userFactory, usersGroupFactory } from '../db/factories';
import { Users } from '../db/models';
import './setup.ts';

beforeAll(() => {
  Users.collection.createIndex({ email: 1 }, { unique: true });
});

describe('User db utils', () => {
  let _user;
  const strongPassword = 'Password123';

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({ email: 'info@erxes.io', isActive: true });
  });

  afterEach(async () => {
    // Clearing test data
    await Users.deleteMany({});
  });

  test('Get user', async () => {
    try {
      await Users.getUser('fakeId');
    } catch (e) {
      expect(e.message).toBe('User not found');
    }

    const response = await Users.getUser(_user._id);

    expect(response).toBeDefined();
  });

  test('Create user', async () => {
    const userObjWithoutCode = await Users.createUser({
      ..._user._doc,
      details: { ..._user.details.toJSON() },
      links: { ..._user.links },
      password: strongPassword,
      email: 'qwerty@qwerty.com'
    });

    if (!userObjWithoutCode.details || !userObjWithoutCode.links) {
      throw new Error('User not found');
    }

    expect(userObjWithoutCode).toBeDefined();
    expect(userObjWithoutCode._id).toBeDefined();
    expect(userObjWithoutCode.username).toBe(_user.username);
    expect(userObjWithoutCode.email).toBe('qwerty@qwerty.com');
    expect(userObjWithoutCode.code).toBe('001');
    expect(
      bcrypt.compare(strongPassword, userObjWithoutCode.password)
    ).toBeTruthy();
    expect(userObjWithoutCode.details.position).toBe(_user.details.position);
    expect(userObjWithoutCode.details.fullName).toBe(_user.details.fullName);
    expect(userObjWithoutCode.details.avatar).toBe(_user.details.avatar);

    const userObjWithCode = await Users.createUser({
      ..._user._doc,
      email: 'qwerty123@qwerty.com'
    });

    expect(userObjWithCode.code).toBe('002');
    expect(userObjWithCode.email).toBe('qwerty123@qwerty.com');
  });

  test('Generate user code field', async () => {
    await userFactory({ code: '000' });
    await userFactory({ code: '001' });

    const user = await userFactory();

    await Users.generateUserCodeField();

    const updatedUser = await Users.findOne({ _id: user._id });

    if (updatedUser) {
      expect(updatedUser.code).toBe('002');
    } else {
      fail('User not found');
    }

    await Users.remove({});

    const response = await Users.generateUserCodeField();

    expect(response).toBeUndefined();
  });

  test('Generate user code', async () => {
    await userFactory({ code: '000' });
    await userFactory({ code: '001' });

    const code1 = await Users.generateUserCode();

    expect(code1).toBe('002');

    await userFactory({ code: '004' });
    await userFactory({ code: '003' });

    const code2 = await Users.generateUserCode();

    expect(code2).toBe('005');

    await userFactory({ code: '006' });
    await userFactory({ code: '006' });

    const code3 = await Users.generateUserCode();

    expect(code3).toBe('007');
  });

  test('Create user with empty string password', async () => {
    try {
      await Users.createUser({
        ..._user._doc,
        details: { ..._user.details.toJSON() },
        password: '',
        email: '123@qwerty.com'
      });
    } catch (e) {
      expect(e.message).toBe('Password can not be empty');
    }
  });

  test('Change user password with empty string', async () => {
    expect.assertions(1);
    const user = await userFactory({});

    // try with empty password ============
    try {
      await Users.changePassword({
        _id: user._id,
        currentPassword: 'admin',
        newPassword: ''
      });
    } catch (e) {
      expect(e.message).toBe('Password can not be empty');
    }
  });

  test('Create, update user and editProfile with duplicated email', async () => {
    expect.assertions(3);

    const user = await userFactory({ email: 'test@email.com' });

    // create with duplicated email
    try {
      await Users.createUser({
        ..._user._doc,
        details: { ..._user.details.toJSON() },
        password: strongPassword,
        email: user.email
      });
    } catch (e) {
      expect(e.message).toBe('Duplicated email');
    }

    // update with duplicated email
    try {
      await Users.updateUser(_user._id, {
        details: { ..._user.details.toJSON() },
        email: user.email
      });
    } catch (e) {
      expect(e.message).toBe('Duplicated email');
    }

    // edit profile with duplicated email
    try {
      await Users.editProfile(_user._id, {
        details: { ..._user.details.toJSON() },
        email: user.email
      });
    } catch (e) {
      expect(e.message).toBe('Duplicated email');
    }
  });

  test('createUserWithConfirmation', async () => {
    const group = await usersGroupFactory();
    const token = await Users.invite({
      email: '123@gmail.com',
      password: strongPassword,
      groupId: group._id
    });

    const userObj = await Users.findOne({ registrationToken: token }).lean();

    if (!userObj) {
      throw new Error('User not found');
    }

    expect(userObj).toBeDefined();
    expect(userObj._id).toBeDefined();
    expect(userObj.groupIds).toEqual([group._id]);
    expect(userObj.registrationToken).toBeDefined();
    expect(userObj.registrationTokenExpires).toBeDefined();
  });

  test('resendInvitation', async () => {
    const email = '123@gmail.com';
    const group = await usersGroupFactory();
    const token = await Users.invite({
      email,
      password: strongPassword,
      groupId: group._id
    });
    const newToken = await Users.resendInvitation({ email });

    const user = await Users.findOne({ email }).lean();

    if (!user) {
      throw new Error('User not found');
    }

    expect(user.registrationToken).not.toBe(token);
    expect(user.registrationToken).toBe(newToken);
    expect(user.registrationTokenExpires).toBeDefined();
  });

  test('invite: invalid group', async () => {
    try {
      await Users.invite({
        email: 'email',
        password: strongPassword,
        groupId: 'fakeId'
      });
    } catch (e) {
      expect(e.message).toBe('Invalid group');
    }
  });

  test('resendInvitation: invalid request', async () => {
    try {
      await Users.resendInvitation({ email: _user.email || 'invalid' });
    } catch (e) {
      expect(e.message).toBe('Invalid request');
    }
  });

  test('resendInvitation: user not found', async () => {
    try {
      await Users.resendInvitation({ email: 'invalid' });
    } catch (e) {
      expect(e.message).toBe('User not found');
    }
  });

  test('confirmInvitation', async () => {
    const email = '123@gmail.com';
    const token = 'token';

    let userObj = await userFactory({
      email,
      registrationToken: token,
      registrationTokenExpires: moment(Date.now())
        .add(7, 'days')
        .toDate()
    });

    if (!userObj) {
      throw new Error('User not found');
    }

    await Users.confirmInvitation({
      token,
      password: strongPassword,
      passwordConfirmation: strongPassword,
      fullName: 'fullname',
      username: 'username'
    });

    const result = await Users.findOne({
      _id: userObj._id
    });

    if (!result || !result.details) {
      throw new Error('User not found');
    }

    expect(result.password).toBeDefined();
    expect(result.details.fullName).toBe('fullname');
    expect(result.username).toBe('username');

    await Users.deleteMany({ _id: userObj._id });

    userObj = await userFactory({
      email,
      registrationToken: token,
      registrationTokenExpires: moment(Date.now())
        .add(7, 'days')
        .toDate()
    });

    try {
      await Users.confirmInvitation({
        token: '123321312312',
        password: '',
        passwordConfirmation: ''
      });
    } catch (e) {
      expect(e.message).toBe('Token is invalid or has expired');
    }

    try {
      await Users.confirmInvitation({
        token,
        password: '',
        passwordConfirmation: ''
      });
    } catch (e) {
      expect(e.message).toBe('Password can not be empty');
    }

    try {
      await Users.confirmInvitation({
        token,
        password: '123',
        passwordConfirmation: '1234'
      });
    } catch (e) {
      expect(e.message).toBe('Password does not match');
    }

    await Users.updateOne(
      { _id: userObj._id },
      {
        $set: {
          registrationTokenExpires: moment(Date.now()).subtract(7, 'days')
        }
      }
    );

    // Checking expired token
    try {
      await Users.confirmInvitation({
        token,
        password: '123',
        passwordConfirmation: '123'
      });
    } catch (e) {
      expect(e.message).toBe('Token is invalid or has expired');
    }
  });

  test('Update user', async () => {
    const updateDoc = await userFactory({});

    // try with password ============
    await Users.updateUser(_user._id, {
      email: '123@gmail.com',
      username: updateDoc.username,
      password: strongPassword,
      details: updateDoc.details,
      links: updateDoc.links
    });

    let userObj = await Users.findOne({ _id: _user._id });

    if (!userObj || !userObj.details || !userObj.links) {
      throw new Error('User not found');
    }

    if (!updateDoc || !updateDoc.details || !updateDoc.links) {
      throw new Error('UpdatedDoc user not found');
    }

    expect(userObj.username).toBe(updateDoc.username);
    expect(userObj.email).toBe('123@gmail.com');
    expect(bcrypt.compare(strongPassword, userObj.password)).toBeTruthy();
    expect(userObj.details.position).toBe(updateDoc.details.position);
    expect(userObj.details.fullName).toBe(updateDoc.details.fullName);
    expect(userObj.details.avatar).toBe(updateDoc.details.avatar);

    // try without password ============
    await Users.updateUser(_user._id, {
      username: 'qwe',
      details: { ...updateDoc.details.toJSON() }
    });

    userObj = await Users.findOne({ _id: _user._id });

    if (!userObj) {
      throw new Error('User not found');
    }

    // password must stay untouched
    expect(bcrypt.compare(strongPassword, userObj.password)).toBeTruthy();
  });

  test('Set user to active', async () => {
    // User not found
    try {
      await Users.setUserActiveOrInactive('noid');
    } catch (e) {
      expect(e.message).toBe('User not found');
    }

    const inActiveUser = await userFactory({ isActive: false });
    const activeUser = await Users.setUserActiveOrInactive(inActiveUser._id);

    expect(activeUser.isActive).toBeTruthy();

    // Can not remove owner
    try {
      const user = await userFactory({});
      await Users.setUserActiveOrInactive(user._id);
    } catch (e) {
      expect(e.message).toBe('Can not deactivate owner');
    }

    await Users.updateOne(
      { _id: _user._id },
      { $unset: { registrationToken: 1, isOwner: false } }
    );

    const deactivatedUser = await Users.setUserActiveOrInactive(_user._id);

    // ensure deactivated
    expect(deactivatedUser.isActive).toBe(false);
  });

  test('Set user to inactive', async () => {
    await Users.updateOne(
      { _id: _user._id },
      {
        $unset: { registrationToken: 1 },
        $set: { isActive: true, isOwner: false }
      }
    );

    const activatedUser = await Users.setUserActiveOrInactive(_user._id);

    // ensure deactivated
    expect(activatedUser.isActive).toBe(false);
  });

  test('Edit profile', async () => {
    const updateDoc = await userFactory({});
    const email = 'testEmail@yahoo.com';

    await Users.editProfile(_user._id, {
      email,
      username: updateDoc.username,
      details: updateDoc.details,
      links: updateDoc.links
    });

    const userObj = await Users.findOne({ _id: _user._id });

    if (!userObj || !userObj.details || !userObj.links) {
      throw new Error('User not found');
    }
    if (!updateDoc || !updateDoc.details || !updateDoc.links) {
      throw new Error('UpdatedDoc user not found');
    }
    // TODO: find out why email field lowered automatically after mongoose v5.x
    expect(userObj.username).toBe(updateDoc.username);
    expect(userObj.email).toBe(email);
    expect(userObj.details.position).toBe(updateDoc.details.position);
    expect(userObj.details.fullName).toBe(updateDoc.details.fullName);
    expect(userObj.details.avatar).toBe(updateDoc.details.avatar);
  });

  test('Config email signature', async () => {
    const signature = { brandId: 'brandId', signature: 'signature' };

    const user = await Users.configEmailSignatures(_user._id, [signature]);

    if (!user || !user.emailSignatures) {
      throw new Error('User not found');
    }

    expect(user.emailSignatures[0].toJSON()).toEqual(signature);
  });

  test('Config get notifications by email', async () => {
    const user = await Users.configGetNotificationByEmail(_user._id, true);

    expect(user.getNotificationByEmail).toEqual(true);
  });

  test('Reset password', async () => {
    expect.assertions(5);

    // token expired ==============
    try {
      await Users.resetPassword({ token: '', newPassword: '' });
    } catch (e) {
      expect(e.message).toBe('Password reset token is invalid or has expired.');
    }

    // invalid password =================
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    await Users.updateOne(
      { _id: _user._id },
      {
        $set: {
          resetPasswordToken: 'token',
          resetPasswordExpires: tomorrow
        }
      }
    );

    try {
      await Users.resetPassword({ token: 'token', newPassword: '' });
    } catch (e) {
      expect(e.message).toBe('Password is required.');
    }

    // valid
    const user = await Users.resetPassword({
      token: 'token',
      newPassword: strongPassword
    });

    expect(user.resetPasswordToken).toBe(null);
    expect(user.resetPasswordExpires).toBe(null);
    expect(bcrypt.compare(strongPassword, user.password)).toBeTruthy();
  });

  test('Change password: incorrect current password', async () => {
    expect.assertions(1);

    const user = await userFactory({});

    try {
      await Users.changePassword({
        _id: user._id,
        currentPassword: 'admin',
        newPassword: strongPassword
      });
    } catch (e) {
      expect(e.message).toBe('Incorrect current password');
    }
  });

  test('Change password: successful', async () => {
    const user = await userFactory({});

    const updatedUser = await Users.changePassword({
      _id: user._id,
      currentPassword: 'pass',
      newPassword: strongPassword
    });

    if (!updatedUser || !updatedUser.password) {
      throw new Error('Updated user not found');
    }

    expect(
      await Users.comparePassword(strongPassword, updatedUser.password)
    ).toBeTruthy();
  });

  test('Forgot password', async () => {
    expect.assertions(3);

    // invalid email ==============
    try {
      await Users.forgotPassword('test@yahoo.com');
    } catch (e) {
      expect(e.message).toBe('Invalid email');
    }

    // valid
    await Users.forgotPassword(_user.email);
    const user = await Users.findOne({ email: _user.email });

    if (!user) {
      throw new Error('User not found');
    }

    expect(user.resetPasswordToken).toBeDefined();
    expect(user.resetPasswordExpires).toBeDefined();
  });

  test('Login', async () => {
    expect.assertions(9);

    // invalid email ==============
    try {
      await Users.login({ email: 'test@yahoo.com' });
    } catch (e) {
      expect(e.message).toBe('Invalid login');
    }

    // invalid password ==============
    try {
      await Users.login({ email: _user.email, password: 'admin' });
    } catch (e) {
      expect(e.message).toBe('Invalid login');
    }

    // valid
    let response = await Users.login({
      email: _user.email.toUpperCase(),
      password: 'pass'
    });

    expect(response.token).toBeDefined();
    expect(response.refreshToken).toBeDefined();

    // device token
    const tokenUser = await userFactory({ deviceTokens: ['mobile'] });

    if (!tokenUser) {
      throw new Error('User not found');
    }

    // when device token
    response = await Users.login({
      email: (tokenUser.email || '').toUpperCase(),
      password: 'pass',
      deviceToken: 'web'
    });

    expect(response.token).toBeDefined();
    expect(response.refreshToken).toBeDefined();

    // when adding same device token
    response = await Users.login({
      email: (tokenUser.email || '').toUpperCase(),
      password: 'pass',
      deviceToken: 'web'
    });

    expect(response.token).toBeDefined();
    expect(response.refreshToken).toBeDefined();

    // generate code field
    await Users.remove({});

    const user1 = await userFactory({});

    await Users.login({
      email: user1.email || '',
      password: 'pass'
    });

    const updatedUser = await Users.findOne({ _id: user1._id });

    if (updatedUser) {
      expect(updatedUser.code).toBe('001');
    } else {
      fail('User not found');
    }
  });

  test('Refresh tokens', async () => {
    expect.assertions(3);

    // invalid refresh token
    expect(await Users.refreshTokens('invalid')).toEqual({});

    // valid ==============
    const prevRefreshToken = await jwt.sign(
      { user: _user },
      Users.getSecret(),
      {
        expiresIn: '7d'
      }
    );

    const { token, refreshToken } = await Users.refreshTokens(prevRefreshToken);

    expect(token).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  test('Reset member password', async () => {
    expect.assertions(2);

    try {
      await Users.resetMemberPassword({ _id: _user._id, newPassword: '' });
    } catch (e) {
      expect(e.message).toBe('Password is required.');
    }

    // valid
    const updatedUser = await Users.resetMemberPassword({
      _id: _user._id,
      newPassword: strongPassword
    });

    expect(
      await Users.comparePassword(strongPassword, updatedUser.password)
    ).toBeTruthy();
  });

  test('Check password', async () => {
    expect.assertions(1);
    const weakPassword = '123456';

    try {
      await Users.checkPassword(weakPassword);
    } catch (e) {
      expect(e.message).toBe(
        'Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters'
      );
    }
  });
});
