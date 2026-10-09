const WHITE = '#FFFFFF';
const OUTLINE = '#C9C2EC';
const SHADE = '#F1EEFC';
const GLOW = '#A78BFA';
const VISOR = '#2A1F5C';

// The erxes bot seen from the side; poses toggle through the parent's data-pose.
export const BotRunnerSprite = () => (
  <svg
    viewBox="0 -4 48 60"
    width="48"
    height="60"
    className="overflow-visible"
    aria-hidden="true"
  >
    <g className="runner-stand">
      <g className="runner-body">
        <circle
          className="runner-hand runner-hand-back"
          cx="15"
          cy="40"
          r="3.5"
          fill={SHADE}
          stroke={OUTLINE}
          strokeWidth="1.5"
        />
        <rect
          x="15"
          y="32"
          width="18"
          height="16"
          rx="8"
          fill={SHADE}
          stroke={OUTLINE}
          strokeWidth="1.5"
        />
        <circle cx="28" cy="39" r="2" fill={GLOW} />
        <circle
          cx="25"
          cy="18"
          r="15"
          fill={WHITE}
          stroke={OUTLINE}
          strokeWidth="1.5"
        />
        <rect x="24" y="10" width="16" height="14" rx="7" fill={VISOR} />
        <rect
          className="runner-eye"
          x="28"
          y="14"
          width="4"
          height="6"
          rx="2"
          fill={GLOW}
        />
        <rect
          className="runner-eye"
          x="34"
          y="14"
          width="3.5"
          height="6"
          rx="1.75"
          fill={GLOW}
        />
        <circle
          className="runner-hand runner-hand-front"
          cx="33"
          cy="41"
          r="3.5"
          fill={SHADE}
          stroke={OUTLINE}
          strokeWidth="1.5"
        />
      </g>
      <ellipse
        className="runner-foot runner-foot-back"
        cx="20"
        cy="53"
        rx="4.5"
        ry="3"
        fill={SHADE}
        stroke={OUTLINE}
        strokeWidth="1.5"
      />
      <ellipse
        className="runner-foot runner-foot-front"
        cx="28"
        cy="53"
        rx="4.5"
        ry="3"
        fill={SHADE}
        stroke={OUTLINE}
        strokeWidth="1.5"
      />
    </g>
    <g className="runner-slide">
      <g className="runner-dust" fill={OUTLINE}>
        <circle cx="4" cy="53" r="2.5" />
        <circle cx="-2" cy="51" r="2" />
        <circle cx="-7" cy="54" r="1.5" />
      </g>
      <circle
        cx="9"
        cy="53"
        r="3"
        fill={SHADE}
        stroke={OUTLINE}
        strokeWidth="1.5"
      />
      <ellipse
        cx="28"
        cy="49"
        rx="11"
        ry="6.5"
        fill={SHADE}
        stroke={OUTLINE}
        strokeWidth="1.5"
      />
      <circle cx="33" cy="48" r="1.8" fill={GLOW} />
      <ellipse
        cx="43"
        cy="53"
        rx="4.5"
        ry="3"
        fill={SHADE}
        stroke={OUTLINE}
        strokeWidth="1.5"
      />
      <circle
        cx="17"
        cy="42"
        r="12"
        fill={WHITE}
        stroke={OUTLINE}
        strokeWidth="1.5"
      />
      <rect x="17" y="34" width="13" height="11" rx="5.5" fill={VISOR} />
      <rect
        className="runner-eye"
        x="20.5"
        y="37"
        width="3.5"
        height="5"
        rx="1.75"
        fill={GLOW}
      />
      <rect
        className="runner-eye"
        x="25.5"
        y="37"
        width="3"
        height="5"
        rx="1.5"
        fill={GLOW}
      />
    </g>
  </svg>
);
