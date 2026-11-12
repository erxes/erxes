/** Spreadsheets run cells starting with = + - @ as formulas: such text is kept as text. */
export const defuse = (value: string) => (/^[=+\-@\t\r]/.test(value) ? `'${value}` : value);
