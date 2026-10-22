import {
  embeddedSignupLoginOptions,
  isFacebookOrigin,
  parseEmbeddedSignupMessage,
} from '../embeddedSignup';

const message = (event: string, data?: Record<string, unknown>) =>
  JSON.stringify({ type: 'WA_EMBEDDED_SIGNUP', event, data });

describe('isFacebookOrigin', () => {
  it('accepts only HTTPS facebook.com origins', () => {
    expect(isFacebookOrigin('https://www.facebook.com')).toBe(true);
    expect(isFacebookOrigin('https://business.facebook.com')).toBe(true);
    expect(isFacebookOrigin('http://www.facebook.com')).toBe(false);
    expect(isFacebookOrigin('https://facebook.com.evil.example')).toBe(false);
    expect(isFacebookOrigin('not a url')).toBe(false);
  });
});

describe('parseEmbeddedSignupMessage', () => {
  const origin = 'https://www.facebook.com';

  it('reads the WABA and phone number from FINISH', () => {
    expect(
      parseEmbeddedSignupMessage(
        origin,
        message('FINISH', {
          waba_id: '111',
          phone_number_id: 222,
          business_id: '333',
        }),
      ),
    ).toEqual({
      kind: 'finish',
      wabaId: '111',
      phoneNumberId: '222',
      businessId: '333',
    });
  });

  it('distinguishes setups without a usable number', () => {
    expect(
      parseEmbeddedSignupMessage(origin, message('FINISH', { waba_id: '1' })),
    ).toEqual({ kind: 'only-waba' });
    expect(
      parseEmbeddedSignupMessage(origin, message('FINISH_ONLY_WABA')),
    ).toEqual({ kind: 'only-waba' });
    expect(
      parseEmbeddedSignupMessage(
        origin,
        message('FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING', { waba_id: '1' }),
      ),
    ).toEqual({ kind: 'business-app' });
  });

  it('reports cancellations with Meta error details', () => {
    expect(
      parseEmbeddedSignupMessage(
        origin,
        message('CANCEL', {
          error_message: 'Phone already in use',
          error_code: 524126,
          session_id: 'abc',
        }),
      ),
    ).toEqual({
      kind: 'cancel',
      errorMessage: 'Phone already in use',
      errorCode: '524126',
      sessionId: 'abc',
    });
  });

  it('ignores other origins, other message types and malformed data', () => {
    expect(
      parseEmbeddedSignupMessage('https://evil.example', message('FINISH')),
    ).toBeNull();
    expect(
      parseEmbeddedSignupMessage(
        origin,
        JSON.stringify({ type: 'OTHER', event: 'FINISH' }),
      ),
    ).toBeNull();
    expect(parseEmbeddedSignupMessage(origin, '{not json')).toBeNull();
  });
});

describe('embeddedSignupLoginOptions', () => {
  it('requests a server-exchanged code for the configuration', () => {
    expect(embeddedSignupLoginOptions('cfg-1')).toMatchObject({
      config_id: 'cfg-1',
      response_type: 'code',
      override_default_response_type: true,
    });
  });
});
