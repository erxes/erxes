import { classifyError, isExpectedError, extractMessage, sentryExpectedErrorFilter } from './errorClassifier';

describe('errorClassifier', () => {
  describe('classifyError', () => {
    test.each([
      ['User not found', 'EXPECTED', true, 200],
      ['Email already exists', 'EXPECTED', true, 200],
      ['Name is required', 'EXPECTED', true, 200],
      ['Invalid email format', 'EXPECTED', true, 200],
      ['Wrong password', 'EXPECTED', true, 200],
      ['Permission denied', 'EXPECTED', true, 200],
      ['Not authenticated', 'EXPECTED', true, 200],
    ])('should classify "%s" as EXPECTED', (msg, category, isExpected, statusCode) => {
      const result = classifyError(new Error(msg));
      expect(result.category).toBe(category);
      expect(result.isExpected).toBe(isExpected);
      expect(result.statusCode).toBe(statusCode);
    });

    it('should classify "MongoNetworkError" as SYSTEM', () => {
      const error = new Error('MongoNetworkError: connection failed');
      const result = classifyError(error);
      expect(result.category).toBe('SYSTEM');
      expect(result.isExpected).toBe(false);
      expect(result.statusCode).toBe(500);
    });

    test.each([
      ['Request timeout', 'PROVIDER', false, 502],
      ['connect ECONNREFUSED 127.0.0.1:27017', 'PROVIDER', false, 502],
    ])('should classify "%s" as PROVIDER', (msg, category, isExpected, statusCode) => {
      const result = classifyError(new Error(msg));
      expect(result.category).toBe(category);
      expect(result.isExpected).toBe(isExpected);
      expect(result.statusCode).toBe(statusCode);
    });

    it('should classify unknown errors as UNKNOWN', () => {
      const result = classifyError(new Error('Something weird happened'));
      expect(result.category).toBe('UNKNOWN');
      expect(result.isExpected).toBe(false);
      expect(result.statusCode).toBe(500);
    });

    it('should classify string errors', () => {
      const result = classifyError('Not found');
      expect(result.category).toBe('EXPECTED');
    });

    it('should classify by error code', () => {
      const error = new Error('Validation failed') as any;
      error.code = 'VALIDATION_ERROR';
      const result = classifyError(error);
      expect(result.category).toBe('EXPECTED');
    });
  });

  describe('isExpectedError', () => {
    it('should return true for expected errors', () => {
      expect(isExpectedError(new Error('Not found'))).toBe(true);
      expect(isExpectedError(new Error('Already exists'))).toBe(true);
    });

    it('should return false for system errors', () => {
      expect(isExpectedError(new Error('MongoNetworkError'))).toBe(false);
    });
  });

  describe('extractMessage', () => {
    it('should extract message from Error', () => {
      expect(extractMessage(new Error('test'))).toBe('test');
    });

    it('should return string as-is', () => {
      expect(extractMessage('test')).toBe('test');
    });

    it('should handle objects with message property', () => {
      expect(extractMessage({ message: 'test' })).toBe('test');
    });

    it('should handle unknown types', () => {
      expect(extractMessage(123)).toBe('123');
    });
  });

  describe('SYSTEM vs EXPECTED ordering', () => {
    it('should classify "Cannot find module" as SYSTEM, not EXPECTED', () => {
      const result = classifyError(new Error("Cannot find module 'lodash'"));
      expect(result.category).toBe('SYSTEM');
      expect(result.isExpected).toBe(false);
      expect(result.statusCode).toBe(500);
    });

    it('should classify "Missing environment variable" as SYSTEM, not EXPECTED', () => {
      const result = classifyError(new Error('Missing environment variable: API_KEY'));
      expect(result.category).toBe('SYSTEM');
      expect(result.isExpected).toBe(false);
      expect(result.statusCode).toBe(500);
    });

    it('should classify Mongoose BSON errors as SYSTEM', () => {
      const error = new Error('BSONTypeError: Cast to ObjectId failed for value "abc" at path "_id"');
      const result = classifyError(error);
      expect(result.category).toBe('SYSTEM');
      expect(result.isExpected).toBe(false);
      expect(result.statusCode).toBe(500);
    });

    it('should classify Cast to ObjectId as SYSTEM', () => {
      const error = new Error('Cast to ObjectId failed for value "invalid"');
      const result = classifyError(error);
      expect(result.category).toBe('SYSTEM');
      expect(result.isExpected).toBe(false);
      expect(result.statusCode).toBe(500);
    });
  });

  describe('sentryExpectedErrorFilter', () => {
    it('should return null for EXPECTED errors', () => {
      const event = {
        exception: {
          values: [{ value: 'User not found' }]
        }
      };
      expect(sentryExpectedErrorFilter(event as any)).toBeNull();
    });

    it('should return event for SYSTEM errors', () => {
      const event = {
        exception: {
          values: [{ value: 'MongoNetworkError: connection failed' }]
        }
      };
      expect(sentryExpectedErrorFilter(event as any)).toBe(event as any);
    });

    it('should return event for PROVIDER errors', () => {
      const event = {
        exception: {
          values: [{ value: 'Request timeout' }]
        }
      };
      expect(sentryExpectedErrorFilter(event as any)).toBe(event as any);
    });

    it('should return event when no exception value', () => {
      const event = { exception: { values: [{}] } };
      expect(sentryExpectedErrorFilter(event as any)).toBe(event as any);
    });

    it('should return event when no exception', () => {
      const event = {};
      expect(sentryExpectedErrorFilter(event as any)).toBe(event as any);
    });
  });
});
