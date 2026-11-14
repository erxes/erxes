import {
  SECRET_USER_FIELDS,
  SECRET_USER_FIELDS_PROJECTION,
  toLoggedUser,
  withoutUserSecrets,
} from '../loggedUser';
import { IUserDocument } from 'erxes-api-shared/core-types';

const stored = {
  _id: 'u1',
  email: 'staff@example.com',
  password: '$2a$10$hash',
  resetPasswordToken: 'reset',
  registrationToken: 'register',
  registrationTokenExpires: new Date(0),
};

describe('user secrets never leave the users model', () => {
  it('drops every credential and keeps the rest', () => {
    expect(withoutUserSecrets(stored)).toEqual({
      _id: 'u1',
      email: 'staff@example.com',
    });
  });

  it('logs a document without credentials', () => {
    const user = {
      toObject: () => ({ ...stored }),
    } as unknown as IUserDocument;

    expect(Object.keys(toLoggedUser(user))).toEqual(['_id', 'email']);
  });

  it('excludes the same fields when reading', () => {
    expect(Object.keys(SECRET_USER_FIELDS_PROJECTION)).toEqual([
      ...SECRET_USER_FIELDS,
    ]);
  });
});
