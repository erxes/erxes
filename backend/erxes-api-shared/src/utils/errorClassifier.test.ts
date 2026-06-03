import { classifyError, isExpectedError, extractMessage, sentryExpectedErrorFilter } from './errorClassifier';

describe('errorClassifier', () => {
  describe('classifyError', () => {
    it('should classify "not found" as EXPECTED', () => {
      const result = classifyError(new Error('User not found'));
      expect(result.category).toBe('EXPECTED');
      expect(result.isExpected).toBe(true);
      expect(result.statusCode).toBe(200);
    });

    it('should classify "already exists" as EXPECTED', () => {
      const result = classifyError(new Error('Email already exists'));
      expect(result.category).toBe('EXPECTED');
      expect(result.isExpected).toBe(true);
    });

    it('should classify "is required" as EXPECTED', () => {
      const result = classifyError(new Error('Name is required'));
      expect(result.category).toBe('EXPECTED');
      expect(result.isExpected).toBe(true);
    });

    it('should classify "invalid" as EXPECTED', () => {
      const result = classifyError(new Error('Invalid email format'));
      expect(result.category).toBe('EXPECTED');
      expect(result.isExpected).toBe(true);
    });

    it('should classify "wrong password" as EXPECTED', () => {
      const result = classifyError(new Error('Wrong password'));
      expect(result.category).toBe('EXPECTED');
      expect(result.isExpected).toBe(true);
    });

    it('should classify "permission denied" as EXPECTED', () => {
      const result = classifyError(new Error('Permission denied'));
      expect(result.category).toBe('EXPECTED');
      expect(result.isExpected).toBe(true);
    });

    it('should classify "not authenticated" as EXPECTED', () => {
      const result = classifyError(new Error('Not authenticated'));
      expect(result.category).toBe('EXPECTED');
      expect(result.isExpected).toBe(true);
    });

    it('should classify "MongoNetworkError" as SYSTEM', () => {
      const error = new Error('MongoNetworkError: connection failed');
      const result = classifyError(error);
      expect(result.category).toBe('SYSTEM');
      expect(result.isExpected).toBe(false);
      expect(result.statusCode).toBe(500);
    });

    it('should classify "timeout" as PROVIDER', () => {
      const result = classifyError(new Error('Request timeout'));
      expect(result.category).toBe('PROVIDER');
      expect(result.isExpected).toBe(false);
      expect(result.statusCode).toBe(502);
    });

    it('should classify "ECONNREFUSED" as PROVIDER', () => {
      const result = classifyError(new Error('connect ECONNREFUSED 127.0.0.1:27017'));
      expect(result.category).toBe('PROVIDER');
      expect(result.isExpected).toBe(false);
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

    it('should still classify plain "Not found" as EXPECTED', () => {
      const result = classifyError(new Error('Not found'));
      expect(result.category).toBe('EXPECTED');
      expect(result.isExpected).toBe(true);
    });

    it('should still classify plain "is required" as EXPECTED', () => {
      const result = classifyError(new Error('Name is required'));
      expect(result.category).toBe('EXPECTED');
      expect(result.isExpected).toBe(true);
    });
  });

  describe('sentryExpectedErrorFilter', () => {
    it('should return null for EXPECTED errors', () => {
      const event = {
        exception: {
          values: [{ value: 'User not found' }]
        }
      };
      expect(sentryExpectedErrorFilter(event)).toBeNull();
    });

    it('should return event for SYSTEM errors', () => {
      const event = {
        exception: {
          values: [{ value: 'MongoNetworkError: connection failed' }]
        }
      };
      expect(sentryExpectedErrorFilter(event)).toBe(event);
    });

    it('should return event for PROVIDER errors', () => {
      const event = {
        exception: {
          values: [{ value: 'Request timeout' }]
        }
      };
      expect(sentryExpectedErrorFilter(event)).toBe(event);
    });

    it('should return event when no exception value', () => {
      const event = { exception: { values: [{}] } };
      expect(sentryExpectedErrorFilter(event)).toBe(event);
    });

    it('should return event when no exception', () => {
      const event = {};
      expect(sentryExpectedErrorFilter(event)).toBe(event);
    });
  });
});
