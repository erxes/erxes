import type { AssistantAppearance } from '@erxes/core-contract';
import { useMediaQuery } from 'erxes-ui';
import { type Ref, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { COLORS } from './engine/bodies';
import { BotEngine } from './engine/engine';
import type { BotFrame } from './engine/frame';
import { lookTarget, TURN_TIME } from './engine/gaze';
import { HALF_VIEWBOX as VB } from './engine/math';
import { STATES, type AvatarState } from './engine/poses';
import { useFrameLoop, usePointer } from './useFrameLoop';

export interface BloubAvatarProps {
  size: number;
  appearance: AssistantAppearance;
  state?: AvatarState;
  animated?: boolean;
  follow?: boolean;
  replay?: number;
  paper?: string;
  label?: string;
  className?: string;
}

interface SvgProps {
  frame: BotFrame;
  size: number;
  ink: string;
  paper: string;
  label?: string;
  className?: string;
  svgRef?: Ref<SVGSVGElement>;
}

const BotSvg = ({ frame, size, ink, paper, label, className, svgRef }: SvgProps) => (
  <svg
    ref={svgRef}
    width={size}
    height={size}
    viewBox={`${-VB} ${-VB} ${VB * 2} ${VB * 2}`}
    role={label ? 'img' : 'presentation'}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    className={className}
  >
    <path d={frame.bodyPath} fill={ink} />
    {frame.eyes.map((eye, index) => (
      <path
        key={['left', 'right'][index]}
        d={eye.d}
        transform={eye.matrix}
        opacity={eye.alpha}
        fill={paper}
      />
    ))}
    {frame.dots.map((dot) => (
      <circle key={dot.x} cx={dot.x} cy={dot.y} r={dot.r} fill={ink} opacity={dot.opacity} />
    ))}
  </svg>
);

type Resolved = Required<Pick<BloubAvatarProps, 'state' | 'paper'>> &
  Omit<BloubAvatarProps, 'state' | 'paper' | 'animated'>;

const FrozenAvatar = ({ appearance, state, ...rest }: Resolved) => {
  const { body, color, expression } = appearance;

  const frame = useMemo(
    () => new BotEngine(state, body, expression).sample(STATES[state].frozenAt),
    [state, body, expression],
  );

  return <BotSvg frame={frame} ink={COLORS[color]} {...rest} />;
};

const AnimatedAvatar = ({ appearance, state, follow = false, replay, ...rest }: Resolved) => {
  const { body, color, expression } = appearance;
  const [engine] = useState(() => new BotEngine(state, body, expression));
  const [frame, setFrame] = useState(() => engine.sample(0));
  const svg = useRef<SVGSVGElement>(null);
  const pointer = usePointer(follow);
  const turning = useRef<number | null>(null);

  const clock = useFrameLoop(svg, (seconds) => {
    const box = svg.current?.getBoundingClientRect();

    if (follow && box && box.width > 0 && !STATES[engine.state].ownFace) {
      turning.current ??= seconds;
      engine.setLook(
        lookTarget({
          pointer: pointer.current,
          box,
          viewport: { width: window.innerWidth, height: window.innerHeight },
          turning: seconds - turning.current,
        }),
        seconds,
      );
    } else if (turning.current !== null) {
      turning.current = null;
      engine.setLook(null, seconds, TURN_TIME);
    }

    setFrame(engine.sample(seconds));
  });

  const restart = useEffectEvent(() => engine.reset(state, clock.current));

  useEffect(() => engine.setState(state, clock.current), [engine, clock, state]);
  useEffect(() => engine.setBody(body, clock.current), [engine, clock, body]);
  useEffect(() => engine.setFace(expression, clock.current), [engine, clock, expression]);
  useEffect(() => {
    if (replay) restart();
  }, [replay]);

  return <BotSvg frame={frame} ink={COLORS[color]} svgRef={svg} {...rest} />;
};

export const BloubAvatar = ({
  animated = true,
  state = 'idle',
  paper = 'var(--color-background)',
  ...props
}: BloubAvatarProps) => {
  const still = useMediaQuery('(prefers-reduced-motion: reduce)');

  return animated && !still ? (
    <AnimatedAvatar state={state} paper={paper} {...props} />
  ) : (
    <FrozenAvatar state={state} paper={paper} {...props} />
  );
};
