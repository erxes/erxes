import { ICPUserRegisterParams } from '@/clientportal/types/cpUser';
import { ValidationError } from '@/clientportal/services/errorHandler';
import { PASSWORD_CONFIG } from '@/clientportal/constants';
import type { ActionCodeType } from './actionCodeHelper';

export function validateEmail(email: string): void {
  if (!email) {
    return;
  }

  if (email.length > 254) {
    throw new ValidationError('Invalid email format');
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
}

export function validatePhone(phone: string): void {
  if (!phone) {
    return;
  }
  if (phone.length < 8) {
    throw new ValidationError('Phone number is too short');
  }
}

export function validatePassword(password: string): void {
  if (!password) {
    return;
  }
  if (!password.match(PASSWORD_CONFIG.REGEX)) {
    throw new ValidationError(
      'Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters',
    );
  }
}

export function validateUserRegistration(params: ICPUserRegisterParams): void {
  if (!params.email && !params.phone) {
    throw new ValidationError('Email or phone is required');
  }

  if (params.email) {
    validateEmail(params.email);
  }

  if (params.phone) {
    validatePhone(params.phone);
  }

  if (params.password) {
    validatePassword(params.password);
  }
}

export function detectIdentifierType(identifier: string): 'email' | 'phone' {
  if (!identifier) {
    throw new ValidationError('Identifier is required');
  }

  if (identifier.length <= 254) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(identifier)) {
      return 'email';
    }
  }

  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  if (
    phoneRegex.test(identifier) &&
    identifier.replace(/\D/g, '').length >= 8
  ) {
    return 'phone';
  }

  throw new ValidationError(
    'Invalid identifier format. Must be a valid email or phone number',
  );
}

export function identifierTypeToActionCodeType(
  identifierType: 'email' | 'phone',
): ActionCodeType {
  return identifierType === 'email'
    ? 'EMAIL_VERIFICATION'
    : 'PHONE_VERIFICATION';
}
