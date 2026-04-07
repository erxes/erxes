import { IContext } from '~/connectionResolvers';

const AI_MODEL = 'gemini-2.5-flash';
const AI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are a CMS field designer. When the user describes what kind of content they want to manage, you suggest relevant custom fields for a CMS field group.

Return ONLY a valid JSON object — no markdown fences, no extra text. Use this exact shape:
{
  "groupLabel": "Human-readable group name",
  "customPostTypeSuggestion": "Suggested post type label, or null",
  "fields": [
    {
      "label": "Field Label",
      "code": "field_code_snake_case",
      "type": "text",
      "description": "Short helpful hint for editors",
      "isRequired": false,
      "options": []
    }
  ]
}

Rules:
- code must be unique lowercase snake_case (no spaces, no dashes)
- Available types: text, textarea, number, email, url, date, checkbox, select, radio
- Only include "options" for select/radio; keep the array empty for all other types
- checkbox = boolean yes/no
- textarea = long/rich text
- number = numeric values (price, year, mileage, etc.)
- Suggest 4–10 fields that make practical sense for the domain
- isRequired should be true only for truly mandatory fields (e.g., title, make, model)`;

const buildUserMessage = (prompt: string) =>
  `The user wants fields for: "${prompt}"\n\nSuggest appropriate CMS fields.`;

const mutations = {
  async cmsAiSuggestFields(_parent: any, args: any, _context: IContext) {
    console.log('[cmsAiSuggestFields] called');
    console.log('[cmsAiSuggestFields] args:', args);

    const { prompt } = args;

    if (!prompt?.trim()) {
      console.log('[cmsAiSuggestFields] prompt missing');
      throw new Error('Prompt is required');
    }

    console.log('[cmsAiSuggestFields] prompt:', prompt);

    const apiKey = process.env.GEMINI_API_KEY;

    console.log(
      '[cmsAiSuggestFields] GEMINI_API_KEY exists:',
      Boolean(apiKey),
    );

    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY environment variable is not set on this server',
      );
    }

    const requestBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: buildUserMessage(prompt) }],
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.2,
        max_output_tokens: 2048,
      },
    };

    console.log(
      '[cmsAiSuggestFields] request url:',
      AI_API_URL,
    );
    console.log(
      '[cmsAiSuggestFields] request body:',
      JSON.stringify(requestBody, null, 2),
    );

    let raw = '';

    try {
      const response = await fetch(
        AI_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify(requestBody),
        },
      );

      console.log('[cmsAiSuggestFields] response status:', response.status);
      console.log('[cmsAiSuggestFields] response ok:', response.ok);

      const responseText = await response.text();
      console.log('[cmsAiSuggestFields] raw response text:', responseText);

      if (!response.ok) {
        throw new Error(
          `Gemini API error ${response.status}: ${responseText}`,
        );
      }

      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr: any) {
        console.log(
          '[cmsAiSuggestFields] failed to parse API response JSON:',
          parseErr.message,
        );
        throw new Error(`Failed to parse Gemini response JSON: ${parseErr.message}`);
      }

      console.log(
        '[cmsAiSuggestFields] parsed API response:',
        JSON.stringify(data, null, 2),
      );

      raw =
        data?.candidates?.[0]?.content?.parts
          ?.map((part: any) => part?.text || '')
          .join('') || '';

      console.log('[cmsAiSuggestFields] extracted raw model text:', raw);
    } catch (err: any) {
      console.log('[cmsAiSuggestFields] fetch/request failed:', err);
      throw new Error(`AI request failed: ${err.message}`);
    }

    const cleaned = raw
      .replace(/```(?:json)?/gi, '')
      .replace(/```/g, '')
      .trim();

    console.log('[cmsAiSuggestFields] cleaned text:', cleaned);

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
      console.log(
        '[cmsAiSuggestFields] parsed model JSON:',
        JSON.stringify(parsed, null, 2),
      );
    } catch (err: any) {
      console.log('[cmsAiSuggestFields] failed to parse model JSON:', err.message);
      throw new Error('AI returned an unparseable response. Please try again.');
    }

    const result = {
      groupLabelSuggestion: String(parsed.groupLabel ?? ''),
      customPostTypeSuggestion: parsed.customPostTypeSuggestion
        ? String(parsed.customPostTypeSuggestion)
        : null,
      fields: Array.isArray(parsed.fields)
        ? parsed.fields.map((f: any) => ({
            label: String(f.label ?? ''),
            code: String(f.code ?? '')
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, '_')
              .replace(/_+/g, '_')
              .replace(/^_+|_+$/g, ''),
            type: String(f.type ?? 'text'),
            description: f.description ? String(f.description) : '',
            isRequired: Boolean(f.isRequired),
            options: Array.isArray(f.options)
              ? f.options.map(String)
              : [],
          }))
        : [],
    };

    console.log(
      '[cmsAiSuggestFields] final result:',
      JSON.stringify(result, null, 2),
    );

    return result;
  },
};

export default mutations;
