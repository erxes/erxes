import { sanitizeServerError } from '../erxesTools';

describe('sanitizeServerError', () => {
  it('hides internal "reading name" crashes from the user (the live bug)', () => {
    const result = sanitizeServerError(
      "Cannot read properties of undefined (reading 'name')",
    );
    expect(result.error).not.toMatch(/reading|undefined|name/i);
    expect(result.error).toMatch(/could not be completed/i);
    expect(result.instruction).toMatch(/do NOT show this technical detail/i);
  });

  it('hides non-nullable-field server errors', () => {
    const result = sanitizeServerError(
      'Cannot return null for non-nullable field SalesPipeline.boardId.',
    );
    expect(result.error).toMatch(/could not be completed/i);
    expect(result.error).not.toMatch(/boardId|non-nullable/i);
  });

  it('keeps clean required-argument validation errors (they are actionable)', () => {
    const result = sanitizeServerError(
      'Field "fieldsCombinedByContentType" argument "contentType" of type "String!" is required, but it was not provided.',
    );
    expect(result.error).toMatch(/contentType/);
    expect(result.instruction).toMatch(/required arguments/i);
  });

  it('passes ordinary business messages through untouched', () => {
    const result = sanitizeServerError(
      'Customer with this email already exists',
    );
    expect(result.error).toBe('Customer with this email already exists');
  });
});
