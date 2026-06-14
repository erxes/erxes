import {
  parseCandidates,
  buildTranscript,
  buildDistillUserContent,
} from '../extractor';

describe('parseCandidates', () => {
  it('parses a valid candidate array', () => {
    const raw = JSON.stringify([
      {
        type: 'faq',
        statement: 'Refunds take 5 business days.',
        contextTags: ['Billing'],
        confidence: 0.8,
      },
    ]);
    const out = parseCandidates(raw);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('faq');
    expect(out[0].contextTags).toEqual(['billing']);
    expect(out[0].confidence).toBe(0.8);
  });

  it('tolerates code fences and prose around the array', () => {
    const raw =
      'Sure!\n```json\n[{"type":"pitfall","statement":"X fails when Y","confidence":0.6}]\n```';
    expect(parseCandidates(raw)).toHaveLength(1);
  });

  it('drops unknown types instead of guessing', () => {
    const raw = JSON.stringify([
      { type: 'gossip', statement: 'something', confidence: 0.9 },
      {
        type: 'procedure',
        statement: 'restart the sync worker',
        confidence: 0.9,
      },
    ]);
    const out = parseCandidates(raw);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('procedure');
  });

  it('drops empty and oversized statements', () => {
    const raw = JSON.stringify([
      { type: 'faq', statement: '', confidence: 0.9 },
      { type: 'faq', statement: 'x'.repeat(1001), confidence: 0.9 },
    ]);
    expect(parseCandidates(raw)).toHaveLength(0);
  });

  it('clamps confidence into [0,1] and defaults non-numeric to 0.5', () => {
    const raw = JSON.stringify([
      { type: 'faq', statement: 'a', confidence: 7 },
      { type: 'faq', statement: 'b', confidence: -2 },
      { type: 'faq', statement: 'c', confidence: 'high' },
    ]);
    const out = parseCandidates(raw);
    expect(out.map((c) => c.confidence)).toEqual([1, 0, 0.5]);
  });

  it('returns [] for malformed output', () => {
    expect(parseCandidates('no array here')).toEqual([]);
    expect(parseCandidates('{"type":"faq"}')).toEqual([]);
    expect(parseCandidates('')).toEqual([]);
  });

  it('caps at 10 candidates', () => {
    const raw = JSON.stringify(
      Array.from({ length: 15 }, (_, i) => ({
        type: 'faq',
        statement: `lesson ${i}`,
        confidence: 0.5,
      })),
    );
    expect(parseCandidates(raw)).toHaveLength(10);
  });
});

describe('buildTranscript', () => {
  it('labels roles and skips empty messages', () => {
    const transcript = buildTranscript([
      { role: 'user', content: 'How do refunds work?' },
      { role: 'assistant', content: 'Within 14 days.' },
      { role: 'user', content: '   ' },
    ]);
    expect(transcript).toBe(
      'User: How do refunds work?\nAssistant: Within 14 days.',
    );
  });

  it('keeps the TAIL when over budget (recent context wins)', () => {
    const transcript = buildTranscript(
      [
        { role: 'user', content: 'a'.repeat(100) },
        { role: 'assistant', content: 'THE-END' },
      ],
      50,
    );
    expect(transcript.length).toBeLessThanOrEqual(50);
    expect(transcript).toContain('THE-END');
  });
});

describe('buildDistillUserContent', () => {
  it('includes the outcome signal when present', () => {
    expect(buildDistillUserContent('User: hi', 'resolved')).toContain(
      'Outcome signal: resolved',
    );
    expect(buildDistillUserContent('User: hi')).not.toContain('Outcome signal');
  });
});
