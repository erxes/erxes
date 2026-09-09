// Template preview; the existing product replacer supplies the barcode when printing.
export const BarcodeAttribute = () => (
  <span
    contentEditable={false}
    title="Barcode preview — prints the selected product’s barcode"
  >
    <svg
      width={150}
      height={50}
      viewBox="0 0 202 69"
      preserveAspectRatio="none"
      role="img"
      aria-label="Product barcode preview"
      className="inline-block align-middle bg-white"
    >
      <path
        stroke="#000"
        strokeWidth="4"
        d="M2 69L2 0M28 69L28 0M58 69L58 0M84 69L84 0M90 69L90 0M112 69L112 0M128 69L128 0M138 69L138 0M168 69L168 0M178 69L178 0M200 69L200 0"
      />
      <path
        stroke="#000"
        strokeWidth="2"
        d="M7 69L7 0M23 69L23 0M45 69L45 0M53 69L53 0M79 69L79 0M101 69L101 0M105 69L105 0M133 69L133 0M163 69L163 0M195 69L195 0"
      />
      <path
        stroke="#000"
        strokeWidth="6"
        d="M15 69L15 0M37 69L37 0M69 69L69 0M147 69L147 0M157 69L157 0M189 69L189 0"
      />
      <path stroke="#000" strokeWidth="8" d="M120 69L120 0" />
    </svg>
  </span>
);
