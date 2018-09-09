import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { connect, disconnect } from '../db/connection';
import { userFactory } from '../db/factories';
import { Users } from '../db/models';

beforeAll(() => {
  connect();
  Users.collection.ensureIndex({ email: 1 }, { unique: true });
});

afterAll(() => disconnect());

describe('User db utils', () => {
  let _user;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({ email: 'Info@erxes.io', isActive: true });
  });

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
  });

  test('Create user', async () => {
    const testPassword = 'test';

    const userObj = await Users.createUser({
      ..._user._doc,
      details: { ..._user.details.toJSON() },
      links: { ..._user.links.toJSON() },
      password: testPassword,
      email: 'qwerty@qwerty.com',
    });

    if (!userObj.details || !userObj.links) {
      throw new Error('User not found');
    }

    expect(userObj).toBeDefined();
    expect(userObj._id).toBeDefined();
    expect(userObj.username).toBe(_user.username);
    expect(userObj.email).toBe('qwerty@qwerty.com');
    expect(userObj.role).toBe(_user.role);
    expect(bcrypt.compare(testPassword, userObj.password)).toBeTruthy();
    expect(userObj.details.position).toBe(_user.details.position);
    expect(userObj.details.fullName).toBe(_user.details.fullName);
    expect(userObj.details.avatar).toBe(_user.details.avatar);
    expect(userObj.links.toJSON()).toEqual(_user.links.toJSON());
  });

  test('Create user with empty string password', async () => {
    try {
      await Users.createUser({
        ..._user._doc,
        details: { ..._user.details.toJSON() },
        password: '',
        email: '123@qwerty.com',
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
        newPassword: '',
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
        password: '123',
        email: user.email,
      });
    } catch (e) {
      expect(e.message).toBe('Duplicated email');
    }

    // update with duplicated email
    try {
      await Users.updateUser(_user._id, {
        details: { ..._user.details.toJSON() },
        email: user.email,
      });
    } catch (e) {
      expect(e.message).toBe('Duplicated email');
    }

    // edit profile with duplicated email
    try {
      await Users.editProfile(_user._id, {
        details: { ..._user.details.toJSON() },
        email: user.email,
      });
    } catch (e) {
      expect(e.message).toBe('Duplicated email');
    }
  });

  test('Update user', async () => {
    const updateDoc = await userFactory({});

    const testPassword = 'updatedPass';

    // try with password ============
    await Users.updateUser(_user._id, {
      email: '123@gmail.com',
      username: updateDoc.username,
      password: testPassword,
      details: updateDoc.details,
      links: updateDoc.links,
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
    expect(userObj.role).toBe(userObj.role);
    expect(bcrypt.compare(testPassword, userObj.password)).toBeTruthy();
    expect(userObj.details.position).toBe(updateDoc.details.position);
    expect(userObj.details.fullName).toBe(updateDoc.details.fullName);
    expect(userObj.details.avatar).toBe(updateDoc.details.avatar);
    expect(userObj.links.toJSON()).toEqual(updateDoc.links.toJSON());

    // try without password ============
    await Users.updateUser(_user._id, {
      username: 'qwe',
      details: { ...updateDoc.details.toJSON() },
    });

    userObj = await Users.findOne({ _id: _user._id });

    if (!userObj) {
      throw new Error('User not found');
    }

    // password must stay untouched
    expect(bcrypt.compare(testPassword, userObj.password)).toBeTruthy();
  });

  test('Remove user', async () => {
    const deactivatedUser = await Users.removeUser(_user._id);
    // ensure deactivated
    expect(deactivatedUser.isActive).toBe(false);
  });

  test('Edit profile', async () => {
    const updateDoc = await userFactory({});

    await Users.editProfile(_user._id, {
      email: 'testEmail@yahoo.com',
      username: updateDoc.username,
      details: updateDoc.details,
      links: updateDoc.links,
    });

    const userObj = await Users.findOne({ _id: _user._id });

    if (!userObj || !userObj.details || !userObj.links) {
      throw new Error('User not found');
    }
    if (!updateDoc || !updateDoc.details || !updateDoc.links) {
      throw new Error('UpdatedDoc user not found');
    }

    expect(userObj.username).toBe(updateDoc.username);
    expect(userObj.email).toBe('testEmail@yahoo.com');
    expect(userObj.details.position).toBe(updateDoc.details.position);
    expect(userObj.details.fullName).toBe(updateDoc.details.fullName);
    expect(userObj.details.avatar).toBe(updateDoc.details.avatar);
    expect(userObj.links.toJSON()).toEqual(updateDoc.links.toJSON());
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

    await Users.update(
      { _id: _user._id },
      {
        $set: {
          resetPasswordToken: 'token',
          resetPasswordExpires: tomorrow,
        },
      },
    );

    try {
      await Users.resetPassword({ token: 'token', newPassword: '' });
    } catch (e) {
      expect(e.message).toBe('Password is required.');
    }

    // valid
    const user = await Users.resetPassword({
      token: 'token',
      newPassword: 'password',
    });

    expect(user.resetPasswordToken).toBe(null);
    expect(user.resetPasswordExpires).toBe(null);
    expect(bcrypt.compare('password', user.password)).toBeTruthy();
  });

  test('Change password: incorrect current password', async () => {
    expect.assertions(1);

    const user = await userFactory({});

    try {
      await Users.changePassword({
        _id: user._id,
        currentPassword: 'admin',
        newPassword: '123321',
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
      newPassword: 'Lombo@123',
    });

    if (!updatedUser || !updatedUser.password) {
      throw new Error('Updated user not found');
    }

    expect(await Users.comparePassword('Lombo@123', updatedUser.password)).toBeTruthy();
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
    expect.assertions(4);

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
    const { token, refreshToken } = await Users.login({
      email: _user.email.toUpperCase(),
      password: 'pass',
    });

    expect(token).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  test('Refresh tokens', async () => {
    expect.assertions(3);

    // invalid refresh token
    expect(await Users.refreshTokens('invalid')).toEqual({});

    // valid ==============
    const prevRefreshToken = await jwt.sign({ user: _user }, Users.getSecret(), {
      expiresIn: '7d',
    });

    const { token, refreshToken } = await Users.refreshTokens(prevRefreshToken);

    expect(token).toBeDefined();
    expect(refreshToken).toBeDefined();
  });
});
