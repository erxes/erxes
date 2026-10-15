import { AI_AGENT_BOT_STYLES } from '@/automations/components/settings/components/agents/components/bot/aiAgentBotStyles';
import {
  TAiAgentBotEye,
  TAiAgentBotPose,
  TAiAgentBotProp,
} from '@/automations/components/settings/components/agents/constants/aiAgentBotPoses';
import { TAiAgentStep } from '@/automations/components/settings/components/agents/constants/aiAgentSteps';
import { cn } from 'erxes-ui';
import { useId } from 'react';

const OUTLINE = '#E4E2F3';
const BODY = '#ECE9FB';
const LIMB = '#D9D3F5';
const GLOW = '#A78BFA';
const VISOR = '#2A1F5C';
const ACCENT = '#534AB7';
const SOFT = '#AFA9EC';

const HEART_COLORS: Record<TAiAgentBotPose['heart'], string> = {
  ok: '#1D9E75',
  warning: '#EF9F27',
  error: '#E24B4A',
  off: '#B4B2A9',
};

const BUBBLES: Partial<
  Record<TAiAgentBotProp, { color: string; mark: 'check' | 'cross' | string }>
> = {
  okBubble: { color: '#97C459', mark: 'check' },
  hintBubble: { color: '#B4B2A9', mark: '?' },
  warningBubble: { color: '#EF9F27', mark: '!' },
  errorBubble: { color: '#E24B4A', mark: 'cross' },
};

const AiAgentBotEye = ({
  x,
  eye,
  side,
}: {
  x: number;
  eye: TAiAgentBotEye;
  side: 'left' | 'right';
}) => {
  if (eye === 'happy' || (eye === 'wink' && side === 'left')) {
    return (
      <path
        transform={`translate(${x} 50)`}
        d="M-6 2Q0-5 6 2"
        stroke={GLOW}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    );
  }

  if (eye === 'sleep') {
    return (
      <path
        transform={`translate(${x} 50)`}
        d="M-6 0Q0 4 6 0"
        stroke="#888780"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    );
  }

  if (eye === 'cross') {
    return (
      <path
        transform={`translate(${x} 50)`}
        d="M-5-5L5 5M5-5L-5 5"
        stroke="#F09595"
        strokeWidth="3"
        strokeLinecap="round"
      />
    );
  }

  if (eye === 'worried') {
    return (
      <rect
        className="aab-glow"
        transform={`translate(${x} 50) rotate(${side === 'left' ? -16 : 16})`}
        x="-7"
        y="-3"
        width="14"
        height="6"
        rx="3"
        fill={GLOW}
      />
    );
  }

  return (
    <rect
      className="aab-blink"
      x={eye === 'side' ? x - 9 : x - 7}
      y="46.5"
      width={eye === 'side' ? 12 : 14}
      height="7"
      rx="3.5"
      fill={GLOW}
    />
  );
};

const AiAgentBotBubble = ({ prop }: { prop: TAiAgentBotProp }) => {
  const bubble = BUBBLES[prop];

  if (!bubble) {
    return null;
  }

  return (
    <g className="aab-pop">
      <rect x="94" y="-2" width="26" height="20" rx="6" fill={bubble.color} />
      <path d="M107 15l-4 6l-1-6z" fill={bubble.color} />
      {bubble.mark === 'check' && (
        <path
          d="M101 8l4 4l7-7"
          stroke="#fff"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {bubble.mark === 'cross' && (
        <path
          d="M102 3l10 10M112 3l-10 10"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
      {bubble.mark !== 'check' && bubble.mark !== 'cross' && (
        <text
          x="107"
          y="14"
          textAnchor="middle"
          fontSize="15"
          fontWeight="500"
          fill="#fff"
        >
          {bubble.mark}
        </text>
      )}
    </g>
  );
};

const SHELF_BOOKS = [
  [96, 32, 6, 22, '#AFA9EC'],
  [110, 34, 5, 20, '#5DCAA5'],
  [116, 31, 7, 23, '#F0997B'],
  [123, 36, 4, 18, '#CECBF6'],
  [96, 62, 7, 22, '#F0997B'],
  [104, 64, 5, 20, ACCENT],
  [110, 60, 6, 24, SOFT],
  [118, 64, 6, 20, '#5DCAA5'],
  [96, 92, 8, 22, '#5DCAA5'],
  [105, 94, 6, 20, '#CECBF6'],
  [112, 91, 6, 23, ACCENT],
  [119, 93, 7, 21, '#F0997B'],
] as const;

const BOOK_TRANSFORMS: Record<NonNullable<TAiAgentBotPose['book']>, string> = {
  shelf: 'translate(0px, 0px) rotate(0deg)',
  pulled: 'translate(-3px, 3px) rotate(-12deg)',
  held: 'translate(-29px, 52px) rotate(-78deg)',
  open: 'translate(-29px, 52px) rotate(-78deg)',
};

const AiAgentBotShelf = ({ shelf }: { shelf: 'full' | 'empty' }) => (
  <g>
    <rect
      x="92"
      y="26"
      width="38"
      height="96"
      rx="3"
      fill={BODY}
      stroke="#CECBF6"
      strokeWidth="1.5"
    />
    <rect x="92" y="54" width="38" height="3" fill="#CECBF6" />
    <rect x="92" y="84" width="38" height="3" fill="#CECBF6" />
    {shelf === 'full' ? (
      SHELF_BOOKS.map(([x, y, width, height, fill]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={width}
          height={height}
          rx="1"
          fill={fill}
        />
      ))
    ) : (
      <g fill="#B4B2A9">
        <path
          d="M93 27L106 27M93 27L93 40M93 27L104 38M96 27Q96 31 93 31M100 27Q100 35 93 35"
          stroke="#B4B2A9"
          strokeWidth="0.8"
          fill="none"
        />
        <circle cx="112" cy="52" r="0.9" />
        <circle cx="120" cy="51" r="0.7" />
        <circle cx="104" cy="82" r="0.8" />
        <circle cx="116" cy="112" r="0.9" />
        <circle cx="124" cy="111" r="0.7" />
      </g>
    )}
  </g>
);

// The one book the bot takes; drawn in shelf space so it can travel to the hands.
const AiAgentBotShelfBook = ({
  book,
}: {
  book: NonNullable<TAiAgentBotPose['book']>;
}) => (
  <>
    <rect
      className="aab-book"
      style={{
        transform: BOOK_TRANSFORMS[book],
        opacity: book === 'open' ? 0 : 1,
      }}
      x="103"
      y="31"
      width="6"
      height="23"
      rx="1"
      fill={ACCENT}
      stroke="#3C3489"
      strokeWidth="0.8"
    />
    <g className="aab-prop" opacity={book === 'open' ? 1 : 0}>
      <path d="M60 92L45 89V104L60 107Z" fill="#fff" stroke="#7F77DD" />
      <path d="M48 93l9 2M48 97l9 2M48 101l9 2" stroke={SOFT} />
      <path d="M60 92L75 89V104L60 107Z" fill="#fff" stroke="#7F77DD" />
      <path
        className="aab-page-flip"
        d="M60 92L75 89V104L60 107Z"
        fill="#fff"
        stroke="#7F77DD"
      />
      <path d="M63 95l9-2M63 99l9-2M63 103l9-2" stroke={SOFT} />
    </g>
  </>
);

/**
 * The erxes bot assembled from the agent's parts: antenna is the connection,
 * head the brain, body the memory and the chest light the last test. Parts
 * not set up yet are drawn as dashed outlines.
 */
export const AiAgentBot = ({
  pose,
  className,
  missingParts = [],
  onPartClick,
}: {
  pose: TAiAgentBotPose;
  className?: string;
  missingParts?: TAiAgentStep[];
  onPartClick?: (step: TAiAgentStep) => void;
}) => {
  const visorClipId = `aab-visor-${useId().replace(/:/g, '')}`;
  const has = (prop: TAiAgentBotProp) => pose.props.includes(prop);
  const show = (prop: TAiAgentBotProp) => (has(prop) ? 1 : 0);
  const [eyeX, eyeY] = pose.eyeOffset || [0, 0];
  const missing = (step: TAiAgentStep) =>
    missingParts.includes(step) ? 'aab-missing' : undefined;
  const part = (step: TAiAgentStep) => ({
    onClick: onPartClick ? () => onPartClick(step) : undefined,
    className: cn(
      onPartClick && 'cursor-pointer',
      step !== 'brain' && missing(step),
    ),
  });

  return (
    <svg
      viewBox="-4 -10 140 140"
      className={cn('aab-root shrink-0 overflow-visible', className)}
      aria-hidden="true"
    >
      <style>{AI_AGENT_BOT_STYLES}</style>
      <defs>
        <clipPath id={visorClipId}>
          <rect x="41" y="37" width="48" height="26" rx="13" />
        </clipPath>
      </defs>
      {pose.shelf && <AiAgentBotShelf shelf={pose.shelf} />}

      <g
        className="aab-offset"
        style={{ transform: `translateX(${pose.offsetX || 0}px)` }}
      >
        <ellipse cx="65" cy="124" rx="28" ry="4" fill={GLOW} opacity="0.18" />
        <g
          {...part('memory')}
          className={cn(part('memory').className, 'aab-feet')}
          style={{ transform: `scaleY(${pose.tiptoe ? 0.7 : 1})` }}
        >
          <ellipse cx="56" cy="116" rx="7" ry="4" fill={LIMB} />
          <ellipse cx="74" cy="116" rx="7" ry="4" fill={LIMB} />
        </g>
        <g
          className="aab-lift"
          style={{
            transform: `translateY(${pose.lift || 0}px) scaleY(${
              pose.stretch || 1
            })`,
          }}
        >
          <g className={cn('aab-rig', pose.body && `aab-body-${pose.body}`)}>
            <g {...part('memory')}>
              <rect
                x="47"
                y="80"
                width="36"
                height="32"
                rx="14"
                fill={BODY}
                stroke={OUTLINE}
                strokeWidth="1.5"
              />
            </g>
            <circle
              {...part('test')}
              className={cn(
                part('test').className,
                pose.heart === 'ok' && 'aab-pulse',
              )}
              cx="65"
              cy="100"
              r="3.5"
              fill={HEART_COLORS[pose.heart]}
            />

            <g
              className="aab-head"
              style={{ transform: `rotate(${pose.tilt || 0}deg)` }}
            >
              <g
                className={cn(
                  'aab-head-motion',
                  pose.head && `aab-head-${pose.head}`,
                )}
              >
                <g
                  className="aab-prop"
                  opacity={show('waves')}
                  fill="none"
                  stroke="#7F77DD"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path
                    className="aab-radiate"
                    d="M56 0q-4 7 0 14M74 0q4 7 0 14"
                  />
                  <path
                    className="aab-radiate"
                    style={{ animationDelay: '.5s' }}
                    d="M50-4q-6 11 0 22M80-4q6 11 0 22"
                  />
                  <path
                    className="aab-radiate"
                    style={{ animationDelay: '1s' }}
                    d="M44-8q-8 15 0 30M86-8q8 15 0 30"
                  />
                </g>

                <g {...part('connection')}>
                  {pose.antenna === 'droop' ? (
                    <>
                      <path
                        d="M65 19Q66 11 76 12"
                        stroke="#D3D1C7"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                      />
                      <circle cx="78" cy="13" r="4" fill="#B4B2A9" />
                    </>
                  ) : (
                    <>
                      <line
                        x1="65"
                        y1="19"
                        x2="65"
                        y2="10"
                        stroke={OUTLINE}
                        strokeWidth="3"
                      />
                      <circle
                        className={cn(pose.antenna === 'blink' && 'aab-signal')}
                        cx="65"
                        cy="7"
                        r="4"
                        fill={GLOW}
                      />
                    </>
                  )}
                </g>

                <g {...part('brain')}>
                  <g className={missing('brain')}>
                    <circle
                      cx="65"
                      cy="50"
                      r="32"
                      fill="#fff"
                      stroke={OUTLINE}
                      strokeWidth="2"
                    />
                    <rect
                      x="41"
                      y="37"
                      width="48"
                      height="26"
                      rx="13"
                      fill={VISOR}
                    />
                  </g>
                  <g
                    className="aab-eyes-offset"
                    style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}
                  >
                    <g className={cn(pose.glance && 'aab-glance')}>
                      <AiAgentBotEye x={56} eye={pose.eye} side="left" />
                      <AiAgentBotEye x={74} eye={pose.eye} side="right" />
                    </g>
                  </g>
                  <g
                    className="aab-prop"
                    opacity={show('scan')}
                    clipPath={`url(#${visorClipId})`}
                  >
                    <rect
                      className={cn(
                        'aab-scan',
                        pose.fastScan && 'aab-scan-fast',
                      )}
                      x="41"
                      y="36"
                      width="48"
                      height="3"
                      fill="#5DCAA5"
                      opacity="0.8"
                    />
                  </g>
                  <g className="aab-prop" opacity={show('cheeks')} fill={GLOW}>
                    <ellipse cx="47" cy="58" rx="4" ry="2.5" opacity="0.5" />
                    <ellipse cx="83" cy="58" rx="4" ry="2.5" opacity="0.5" />
                  </g>
                </g>

                <g className="aab-prop" opacity={show('headset')} fill={ACCENT}>
                  <path
                    d="M30 52A35 35 0 0 1 100 52"
                    stroke={ACCENT}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <rect x="25" y="43" width="9" height="17" rx="4.5" />
                  <rect x="96" y="43" width="9" height="17" rx="4.5" />
                  <path
                    d="M29 59Q31 72 47 70"
                    stroke={ACCENT}
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle cx="48" cy="70" r="2.5" />
                </g>
                <path
                  className="aab-prop"
                  opacity={show('sweat')}
                  d="M95 24q4 6 0 9q-4-3 0-9z"
                  fill="#85B7EB"
                />
              </g>
            </g>

            <g className="aab-prop aab-lens" opacity={show('lens')}>
              <line
                x1="87"
                y1="60"
                x2="98"
                y2="74"
                stroke={ACCENT}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle
                cx="79"
                cy="50"
                r="12"
                fill={GLOW}
                fillOpacity="0.18"
                stroke={ACCENT}
                strokeWidth="3"
              />
              <path
                d="M73 44a7 7 0 0 1 6-3"
                stroke="#fff"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </g>

            {(['left', 'right'] as const).map((side) => {
              const [x, y] = side === 'left' ? pose.leftHand : pose.rightHand;
              const motion =
                pose.handMotion === 'shrug' ||
                (side === 'right' && pose.handMotion)
                  ? `aab-hand-${pose.handMotion}`
                  : undefined;

              return (
                <g
                  key={side}
                  className={cn('aab-hand', pose.fastHands && 'aab-hand-fast')}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                  <circle
                    className={motion}
                    r="7"
                    fill="#fff"
                    stroke={OUTLINE}
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </g>
        </g>
      </g>

      {pose.shelf === 'full' && (
        <AiAgentBotShelfBook book={pose.book || 'shelf'} />
      )}

      <g className="aab-prop" opacity={show('gears')}>
        <g className="aab-spin">
          <circle
            cx="104"
            cy="16"
            r="7"
            fill="none"
            stroke="#7F77DD"
            strokeWidth="4"
            strokeDasharray="3 2.5"
          />
          <circle cx="104" cy="16" r="3.5" fill="#7F77DD" />
        </g>
        <g className="aab-spin aab-spin-reverse">
          <circle
            cx="118"
            cy="30"
            r="5"
            fill="none"
            stroke={SOFT}
            strokeWidth="3.5"
            strokeDasharray="2.5 2"
          />
          <circle cx="118" cy="30" r="2.5" fill={SOFT} />
        </g>
      </g>
      <g className="aab-prop" opacity={show('spark')}>
        <path
          className="aab-flicker"
          d="M86 2l-5 8h5l-4 8M44 4l4 6h-5l4 6"
          stroke="#EF9F27"
          strokeWidth="2.5"
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>
      <g className="aab-prop" opacity={show('zzz')} fill="#888780">
        <text className="aab-float" x="92" y="22" fontSize="13">
          z
        </text>
        <text
          className="aab-float"
          style={{ animationDelay: '.8s' }}
          x="102"
          y="12"
          fontSize="10"
        >
          z
        </text>
      </g>
      {pose.props.map((prop) => (
        <AiAgentBotBubble key={prop} prop={prop} />
      ))}
    </svg>
  );
};
