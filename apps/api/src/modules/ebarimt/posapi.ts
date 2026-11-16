import { z } from 'zod';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { requestOutbound } from '~/lib/outbound';

// The merchant's PosAPI 3.0 and the tax office's taxpayer lookup. Every call
// goes through `requestOutbound` (SSRF-checked, with a timeout), outside any
// transaction.

const MAX_BYTES = 256 * 1024;

const PutAnswer = z.object({
  status: z.string().optional(),
  id: z.string().nullish(),
  date: z.string().nullish(),
  lottery: z.string().nullish(),
  qrData: z.string().nullish(),
  message: z.string().nullish(),
});

const Message = z.object({ message: z.string().nullish() });

const TaxpayerAnswer = z.object({
  status: z.number().optional(),
  data: z.union([z.string(), z.object({ name: z.string().nullish() })]).nullish(),
});

const describe = (error: unknown) =>
  error instanceof Error ? error.message : 'Could not reach PosAPI';

const call = async (posApiUrl: string, method: string, path: string, body?: unknown) => {
  const answer = await requestOutbound(`${posApiUrl.replace(/\/+$/, '')}${path}`, {
    method,
    body: body === undefined ? '' : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    timeoutMs: 15_000,
    maxBytes: MAX_BYTES,
  });

  const text = answer.body.toString('utf8');

  let json: unknown = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  return { status: answer.status, json };
};

export type PutResult =
  | {
      ok: true;
      billId: string | null;
      billDate: string | null;
      lottery: string | null;
      qrData: string | null;
      response: unknown;
    }
  | { ok: false; error: string; response: unknown };

/** Sends a receipt; a refusal or an unreachable PosAPI comes back as `ok: false`. */
export const putReceipt = async (posApiUrl: string, receipt: unknown): Promise<PutResult> => {
  try {
    const { json } = await call(posApiUrl, 'POST', '/rest/receipt', receipt);
    const answer = PutAnswer.safeParse(json);

    if (!answer.success || answer.data.status !== 'SUCCESS') {
      return {
        ok: false,
        error: answer.data?.message ?? 'PosAPI refused the receipt',
        response: json,
      };
    }

    return {
      ok: true,
      billId: answer.data.id ?? null,
      billDate: answer.data.date ?? null,
      lottery: answer.data.lottery ?? null,
      qrData: answer.data.qrData ?? null,
      response: json,
    };
  } catch (error) {
    return { ok: false, error: describe(error), response: null };
  }
};

/** Returns (cancels) an issued receipt: null when PosAPI took it, else why not. */
export const deleteReceipt = async (posApiUrl: string, bill: { id: string; date: string }) => {
  try {
    const { status, json } = await call(posApiUrl, 'DELETE', '/rest/receipt', bill);

    if (status === 200) return null;

    return Message.safeParse(json).data?.message ?? `PosAPI answered ${status}`;
  } catch (error) {
    return describe(error);
  }
};

/** PosAPI's own state (`GET /rest/info`): its version, merchants and last sync. */
export const posApiInfo = async (posApiUrl: string) => {
  try {
    const { status, json } = await call(posApiUrl, 'GET', '/rest/info');
    const info = z.record(z.string(), z.unknown()).safeParse(json);

    if (status !== 200 || !info.success) {
      return { ok: false, error: `PosAPI answered ${status}`, info: info.data ?? null };
    }

    return { ok: true, error: null, info: info.data };
  } catch (error) {
    return { ok: false, error: describe(error), info: null };
  }
};

const TIN = /^(\d{11}|\d{12}|\d{14})$/;

const askTaxOffice = async (path: string) => {
  try {
    const answer = await requestOutbound(`${config.ebarimt.taxpayerUrl}/${path}`, {
      method: 'GET',
      body: '',
      headers: { Accept: 'application/json' },
      maxBytes: 16 * 1024,
    });

    return TaxpayerAnswer.parse(JSON.parse(answer.body.toString('utf8')));
  } catch {
    throw fail('TAX_OFFICE_UNAVAILABLE', 'The tax office could not be reached. Try again shortly.');
  }
};

/**
 * A company's tax number (TIN) and name, from its registration or tax number,
 * as the tax office knows it. 404 COMPANY_NOT_FOUND, 503 TAX_OFFICE_UNAVAILABLE.
 */
export const findCompany = async (no: string) => {
  let tin = no.trim();

  if (!TIN.test(tin)) {
    const found = await askTaxOffice(`getTinInfo?regNo=${encodeURIComponent(tin)}`);

    if (found.status !== 200 || typeof found.data !== 'string') {
      throw fail('COMPANY_NOT_FOUND', `The tax office knows no company ${no}`);
    }

    tin = found.data;
  }

  const info = await askTaxOffice(`getInfo?tin=${encodeURIComponent(tin)}`);

  if (info.status !== 200 || typeof info.data !== 'object' || !info.data) {
    throw fail('COMPANY_NOT_FOUND', `The tax office knows no company ${no}`);
  }

  return { tin, name: info.data.name ?? null };
};
