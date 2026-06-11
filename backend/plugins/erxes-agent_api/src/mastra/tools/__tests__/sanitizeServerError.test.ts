import { sanitizeServerError } from '../erxesTools';

describe('sanitizeServerError', () => {
  it('hides internal "reading name" crashes from the user (the live bug)', () => {
    const r = sanitizeServerError(
      "Cannot read properties of undefined (reading 'name')",
    );
    expect(r.error).not.toMatch(/reading|undefined|name/i);
    expect(r.error).toMatch(/could not be completed/i);
    expect(r.instruction).toMatch(/do NOT show this technical detail/i);
  });

  it('hides non-nullable-field server errors', () => {
    const r = sanitizeServerError(
      'Cannot return null for non-nullable field SalesPipeline.boardId.',
    );
    expect(r.error).toMatch(/could not be completed/i);
    expect(r.error).not.toMatch(/boardId|non-nullable/i);
  });

  it('keeps clean required-argument validation errors (they are actionable)', () => {
    const r = sanitizeServerError(
      'Field "fieldsCombinedByContentType" argument "contentType" of type "String!" is required, but it was not provided.',
    );
    expect(r.error).toMatch(/contentType/);
    expect(r.instruction).toMatch(/required arguments/i);
  });

  it('passes ordinary business messages through untouched', () => {
    const r = sanitizeServerError('Customer with this email already exists');
    expect(r.error).toBe('Customer with this email already exists');
  });
});
