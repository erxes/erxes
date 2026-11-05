import type { UIMessage } from 'ai';

import { extractPageContext, parsePageContextText } from '../utils/pageContext';

describe('extractPageContext', () => {
  it('strips a leading [Page context] part and parses it', () => {
    const parts: UIMessage['parts'] = [
      {
        type: 'text',
        text: '[Page context] The user is viewing /sales/deals. Open record: deal abc123 (fetch it with tools if relevant).',
      },
      { type: 'text', text: 'Summarize this deal' },
    ];

    const { context, parts: stripped } = extractPageContext(parts);

    expect(stripped).toHaveLength(1);
    expect(stripped[0]).toEqual({
      type: 'text',
      text: 'Summarize this deal',
    });
    expect(context).toEqual({
      path: '/sales/deals',
      record: { type: 'deal', id: 'abc123' },
    });
  });

  it('keeps path-only context', () => {
    const parts: UIMessage['parts'] = [
      {
        type: 'text',
        text: '[Page context] The user is viewing /contacts/customers.',
      },
      { type: 'text', text: 'hello' },
    ];

    const { context } = extractPageContext(parts);

    expect(context).toEqual({ path: '/contacts/customers' });
  });

  it('leaves ordinary messages untouched', () => {
    const parts: UIMessage['parts'] = [{ type: 'text', text: 'hello' }];

    const { context, parts: stripped } = extractPageContext(parts);

    expect(context).toBeNull();
    expect(stripped).toEqual(parts);
  });

  it('leaves a context part that is not first untouched', () => {
    const parts: UIMessage['parts'] = [
      { type: 'text', text: 'hello' },
      {
        type: 'text',
        text: '[Page context] The user is viewing /x.',
      },
    ];

    expect(extractPageContext(parts).context).toBeNull();
    expect(extractPageContext(parts).parts).toHaveLength(2);
  });
});

describe('parsePageContextText', () => {
  it('drops an unknown record type', () => {
    expect(
      parsePageContextText(
        '[Page context] The user is viewing /x. Open record: widget a1 (fetch it with tools if relevant).',
      ),
    ).toEqual({ path: '/x' });
  });

  it('drops an invalid record id', () => {
    expect(
      parsePageContextText(
        '[Page context] The user is viewing /x. Open record: deal a.b (fetch it with tools if relevant).',
      ),
    ).toEqual({ path: '/x' });
  });
});
