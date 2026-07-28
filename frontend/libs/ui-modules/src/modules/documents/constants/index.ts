export const PAPER_TYPES = {
  SHEET: 'sheet',
  ROLL: 'roll',
} as const;

export type PaperType = (typeof PAPER_TYPES)[keyof typeof PAPER_TYPES];

export const PAPER_SIZES: Record<
  string,
  {
    width: number;
    height: number;
    label: string;
    margin: number;
    type: PaperType;
  }
> = {
  A4: {
    width: 210,
    height: 297,
    label: 'A4 (210 × 297 mm)',
    margin: 15,
    type: PAPER_TYPES.SHEET,
  },
  A3: {
    width: 297,
    height: 420,
    label: 'A3 (297 × 420 mm)',
    margin: 15,
    type: PAPER_TYPES.SHEET,
  },
  A5: {
    width: 148,
    height: 210,
    label: 'A5 (148 × 210 mm)',
    margin: 15,
    type: PAPER_TYPES.SHEET,
  },
  ROLL: {
    width: 80,
    height: 0,
    label: 'Roll / label',
    margin: 0,
    type: PAPER_TYPES.ROLL,
  },
};

export const PX_PER_MM = 96 / 25.4;
