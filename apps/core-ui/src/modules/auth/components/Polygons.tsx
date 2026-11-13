import { cn } from 'erxes-ui';
import { type SVGProps, useId } from 'react';

/** A rounded hexagon spanning x 590–990, y 76–536. */
const HEX =
  'M785.763 77.3727C788.385 75.8588 791.615 75.8588 794.237 77.3727L985.763 187.95C988.385 189.464 990 192.261 990 195.289V416.443C990 419.471 988.385 422.269 985.763 423.783L794.237 534.36C791.615 535.874 788.385 535.874 785.763 534.36L594.237 423.783C591.615 422.269 590 419.471 590 416.443V195.289C590 192.261 591.615 189.464 594.237 187.95L785.763 77.3727Z';

/** `HEX` grown by half a pixel, for its outline. */
const HEX_OUTLINE =
  'M785.513 76.9395C788.289 75.3364 791.711 75.3364 794.487 76.9395L986.013 187.517C988.789 189.12 990.5 192.083 990.5 195.289V416.443C990.5 419.65 988.789 422.613 986.013 424.216L794.487 534.793C791.711 536.396 788.289 536.396 785.513 534.793L593.987 424.216C591.211 422.613 589.5 419.65 589.5 416.443V195.289C589.5 192.083 591.211 189.12 593.987 187.517L785.513 76.9395Z';

/** How far the row above is shifted up. */
const UPPER_ROW = -359.2377;

/** Where each hexagon sits, as an offset from `HEX`. */
const FORM_HEXES: [number, number][] = [
  [0, 0],
  [-206, UPPER_ROW],
  [-618, UPPER_ROW],
  [-824, 0],
];

const BANNER_HEXES: [number, number][] = [...FORM_HEXES, [-412, 0]];

interface HexLook {
  fill: SVGProps<SVGPathElement>;
  outline: SVGProps<SVGPathElement>;
}

const FORM_LOOK: HexLook = {
  fill: { fill: 'var(--background)' },
  outline: { stroke: 'var(--foreground)', strokeOpacity: 0.06 },
};

/** The banner is always dark (AuthenticationLayout), so its hexes are light lines on it. */
const BANNER_LOOK: HexLook = {
  fill: { fill: 'var(--foreground)', fillOpacity: 0.02 },
  outline: { stroke: 'var(--foreground)', strokeOpacity: 0.05 },
};

/** Hexagons that fade out from the top centre. */
const FadedHexes = ({
  hexes,
  look,
  alphaMask = false,
  ...svg
}: SVGProps<SVGSVGElement> & {
  hexes: [number, number][];
  look: HexLook;
  alphaMask?: boolean;
}) => {
  const id = useId();
  const mask = `polygons-mask-${id}`;
  const fade = `polygons-fade-${id}`;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" {...svg}>
      <mask
        id={mask}
        style={alphaMask ? { maskType: 'alpha' } : undefined}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="756"
        height="875"
      >
        <rect width="756" height="875" fill={`url(#${fade})`} />
      </mask>
      <g mask={`url(#${mask})`}>
        {hexes.map(([dx, dy]) => (
          <g key={`${dx},${dy}`} transform={`translate(${dx} ${dy})`}>
            <path d={HEX} {...look.fill} />
            <path d={HEX_OUTLINE} {...look.outline} />
          </g>
        ))}
      </g>
      <defs>
        <radialGradient
          id={fade}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(378 160.5) rotate(-180) scale(378 257.516)"
        >
          <stop stopColor="var(--accent-foreground)" />
          <stop offset="0.615762" stopColor="var(--accent-foreground)" stopOpacity="0.488108" />
          <stop offset="1" stopColor="var(--accent-foreground)" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

/** The sign-in screen's backdrop: behind the form (`light`) or on the dark banner. */
export const Polygons = ({
  variant = 'dark',
  className,
  ...props
}: SVGProps<SVGSVGElement> & { variant?: 'light' | 'dark' }) =>
  variant === 'light' ? (
    <FadedHexes
      hexes={FORM_HEXES}
      look={FORM_LOOK}
      alphaMask
      viewBox="0 0 756 875"
      className={className}
      {...props}
    />
  ) : (
    <FadedHexes
      hexes={BANNER_HEXES}
      look={BANNER_LOOK}
      width="1134"
      height="875"
      viewBox="0 0 1134 875"
      className={cn('absolute left-1/2 h-[875px] -translate-x-1/3', className)}
      {...props}
    />
  );
