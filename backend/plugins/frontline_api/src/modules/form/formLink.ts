import { createHmac } from 'crypto';
import * as jwt from 'jsonwebtoken';

const AUDIENCE = 'erxes-form-link';

export const DEFAULT_FORM_LINK_DAYS = 30;
export const MAX_FORM_LINK_DAYS = 365;

/** The record a form answer is about, e.g. the ticket a rating is for. */
export type TFormAboutRecord = {
  type: string;
  id: string;
};

/**
 * What a form link vouches for. It comes only from a token this server signed:
 * the browser cannot choose the customer or the record.
 */
export type TFormLink = {
  linkId: string;
  formId: string;
  customerId?: string;
  aboutRecord?: TFormAboutRecord;
};

// Derived from the staff secret so a form link can never pass as another token.
const formLinkSecret = () => {
  const base = process.env.JWT_TOKEN_SECRET;

  if (!base && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_TOKEN_SECRET must be set');
  }

  return createHmac('sha256', base || 'SECRET').update(AUDIENCE).digest('hex');
};

export const readFormLinkDays = (value: unknown) => {
  const days = Number(value);

  if (value === undefined || value === null || value === '' || !Number.isFinite(days) || days <= 0) {
    return DEFAULT_FORM_LINK_DAYS;
  }

  return Math.min(Math.round(days), MAX_FORM_LINK_DAYS);
};

export const signFormLink = (link: TFormLink, expiresInDays: number) =>
  jwt.sign(link, formLinkSecret(), {
    audience: AUDIENCE,
    expiresIn: `${expiresInDays}d`,
  });

const isFormLink = (value: unknown): value is TFormLink =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as TFormLink).linkId === 'string' &&
  typeof (value as TFormLink).formId === 'string';

/** Null when the token is forged, expired or made for another form. */
export const readFormLink = (
  token: string | undefined | null,
  formId: string,
): TFormLink | null => {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, formLinkSecret(), { audience: AUDIENCE });

    if (!isFormLink(decoded) || decoded.formId !== formId) {
      return null;
    }

    return {
      linkId: decoded.linkId,
      formId: decoded.formId,
      customerId: decoded.customerId,
      aboutRecord: decoded.aboutRecord,
    };
  } catch {
    return null;
  }
};
