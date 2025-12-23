import { ICPUserRegisterParams } from '@/clientportal/types/cpUser';
import { PASSWORD_CONFIG } from '../../constants';

export function validateEmail(email: string): void {
  if (!email) {
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
}

export function validatePhone(phone: string): void {
  if (!phone) {
    return;
  }
  // Basic phone validation - can be enhanced
  if (phone.length < 8) {
    throw new Error('Phone number is too short');
  }
}

export function validatePassword(password: string): void {
  if (!password) {
    return;
  }
  if (!password.match(PASSWORD_CONFIG.REGEX)) {
    throw new Error(
      'Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters',
    );
  }
}

export function validateUserRegistration(params: ICPUserRegisterParams): void {
  if (!params.email && !params.phone) {
    throw new Error('Email or phone is required');
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
    throw new Error('Identifier is required');
  }

  // Email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(identifier)) {
    return 'email';
  }

  // Phone number - typically contains only digits, may have +, spaces, dashes, parentheses
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  if (
    phoneRegex.test(identifier) &&
    identifier.replace(/\D/g, '').length >= 8
  ) {
    return 'phone';
  }

  throw new Error(
    'Invalid identifier format. Must be a valid email or phone number',
  );
}
