/** Bank lists, kept with `./enums` (which re-exports them). */

/** Banks core reads accounts from and sends money through. */
export const BANK_KINDS = ['khanbank', 'golomt', 'tdb'] as const;

export const BANK_TRANSFER_TYPES = ['domestic', 'interbank'] as const;

/** Asked of the bank (`sending`: core never resends it), made, or refused. */
export const BANK_TRANSFER_STATUSES = ['sending', 'sent', 'failed'] as const;

/** Khan Bank tax invoices: by invoice or capital (property) number. */
export const TAX_INQUIRY_KINDS = ['invoice', 'capital'] as const;
