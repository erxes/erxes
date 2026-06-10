import { IUom } from '../types';

/**
 * `product.uom` (and `subUoms[].uom`) is stored canonically as the UOM **code**.
 * The Select widgets, however, work in terms of the UOM `_id`. These helpers
 * convert between the stored value and the widget value, while tolerating
 * legacy data that may hold a name or an `_id` instead of a code.
 */
export const findUom = (uoms: IUom[], value?: string): IUom | undefined => {
  if (!value) return undefined;
  return uoms.find(
    (uom) => uom._id === value || uom.code === value || uom.name === value,
  );
};

/** Select/widget value (an `_id`) or any representation -> canonical stored code. */
export const uomToCode = (uoms: IUom[], value?: string): string =>
  findUom(uoms, value)?.code ?? value ?? '';

/** Stored value (code, or legacy name/`_id`) -> the `_id` the Select expects. */
export const uomToId = (uoms: IUom[], value?: string): string =>
  findUom(uoms, value)?._id ?? value ?? '';

/** Stored value -> human readable name for display. */
export const uomToName = (uoms: IUom[], value?: string): string =>
  findUom(uoms, value)?.name ?? value ?? '';
