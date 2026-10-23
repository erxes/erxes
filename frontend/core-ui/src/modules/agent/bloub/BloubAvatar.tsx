import { useId, useEffect, useRef, useState } from 'react';
import type { AriaRole } from 'react';

import { NOTIF_BLUE } from './engine/decor';
import { BotEngine, type BotFrame } from './engine/engine';
import { clamp, easings } from './engine/math';
import { lookTarget, TURN_TIME } from './engine/gaze';
import {
  DEFAULT_EXPRESSION,
  EXPRESSION_BY_ID,
  type ExpressionId,
} from './engine/expressions';
import {
  COLOR_BY_ID,
  DEFAULT_COLOR,
  DEFAULT_SHAPE,
  SHAPE_BY_ID,
  mixHex,
  type ColorId,
  type ShapeId,
} from './engine/skins';
import type { Block } from './engine/cycles';
import { DEMI_VIEWBOX, RAYON } from './engine/repere';
import { STATE_BY_ID, type StateId } from './engine/states';

const R = RAYON;
const VB = DEMI_VIEWBOX;

/** dt plafond par image : un onglet masque reprend sans sauter en avant. */
const MAX_DT = 0.064;
/**
 * React commit cap: the engine clock keeps real time, but a DOM commit
 * is the expensive part — skipping renders (not time) keeps the pose
 * correct while roughly halving the main-thread cost. ~30fps is enough
 * for the bot's slow organic motion.
 */
const MIN_FRAME_MS = 34;

export interface IBloubAvatarProps {
  /** Taille affichee en px. */
  size?: number;
  /** Etat courant quand aucun montage ne joue. */
  state?: StateId;
  /** Forme du personnalisateur. */
  shape?: ShapeId;
  /** Couleur du corps. */
  color?: ColorId;
  /** Expression de repos (etats `baseFace` seulement). */
  expression?: ExpressionId;
  /** Couleur du fond derriere le corps — obligatoire : les yeux sont des
   * trous dans le corps, ils laissent voir cette couleur. */
  paper: string;
  /**
   * Fige le rendu a cette date locale (secondes). Aucune boucle
   * d'animation ni ecouteur n'est demarre — les vignettes restent gratuites.
   */
  frozenAt?: number;
  /** Le regard suit le pointeur (etats `baseFace` seulement, comme l'original). */
  follow?: boolean;
  /** Montage joue en interne (galerie/sequence). */
  cycle?: Block[];
  /** Avance le montage quand true. */
  playing?: boolean;
  /** Appele quand le montage atteint la fin de son dernier bloc. */
  onCycleEnd?: () => void;
  /**
   * Rejoue l'etat courant depuis sa date 0 quand cette valeur change —
   * rearme les etats dont la pose ne boucle pas (alert, notify…).
   */
  restartKey?: number | string;
  className?: string;
  'aria-label'?: string;
  role?: AriaRole;
}

type DotRender = BotFrame['dots'][number];

const Dot = ({ dot, ink, paper }: { dot: DotRender; ink: string; paper: string }) => {
  const fill =
    dot.color ??
    (dot.depth === undefined ? ink : mixHex(paper, ink, dot.depth));

  if (dot.d) {
    return (
      <path
        d={dot.d}
        transform={`translate(${dot.x} ${dot.y}) rotate(${dot.rot ?? 0}) scale(${R})`}
        fill={fill}
        opacity={dot.opacity}
      />
    );
  }

  return <circle cx={dot.x} cy={dot.y} r={dot.r} fill={fill} opacity={dot.opacity} />;
};

/**
 * Port React de BloubBot.vue : un BotEngine par instance, une horloge de
 * scene accumulee en dt (reprise sans saut), le regard qui suit le pointeur
 * centre sur la fenetre (variante sans `TURN` — pas de vue laterale), et
 * les memes calques SVG : arcs arriere, points derriere, corps avec fond
 * opaque `paper` + encre masquee, points devant, pastille, arcs avant.
 */
export const BloubAvatar = ({
  size = 320,
  state = 'idle',
  shape = DEFAULT_SHAPE as ShapeId,
  color = DEFAULT_COLOR as ColorId,
  expression = DEFAULT_EXPRESSION as ExpressionId,
  paper,
  frozenAt,
  follow = false,
  cycle,
  playing = false,
  onCycleEnd,
  restartKey,
  className,
  'aria-label': ariaLabel,
  role = 'img',
}: IBloubAvatarProps) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const maskId = `bot-mask-${uid}`;

  const engineRef = useRef<BotEngine | null>(null);
  if (!engineRef.current) {
    const firstBlock = cycle?.[0];
    engineRef.current = new BotEngine(
      R,
      firstBlock && playing ? firstBlock.state : state,
      SHAPE_BY_ID.get(shape)?.radii ?? null,
      EXPRESSION_BY_ID.get(expression) ?? null,
    );
  }
  const engine = engineRef.current;

  const [frame, setFrame] = useState<BotFrame>(() =>
    engine.sample(frozenAt ?? 0),
  );

  const svgRef = useRef<SVGSVGElement | null>(null);

  /* ------------------------------ horloge de scene ---------------------- */
  const clockRef = useRef(0);
  const lastRef = useRef(0);
  const lastCommitRef = useRef(0);
  const rafRef = useRef(0);
  /** visible a l'ecran ET onglet actif : la boucle ne tourne que dans ce cas. */
  const activeRef = useRef({ onScreen: true, visible: true });

  /* --------------------------- suivi du pointeur ------------------------ */
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const aimingRef = useRef(false);
  const turnSinceRef = useRef(0);
  /**
   * Derniere cible envoyee : le rect ne se re-mesure que quand quelque
   * chose peut changer la cible (pointeur bouge, rampe `tour` en cours,
   * entree/sortie du suivi). Lire le layout a chaque frame force un
   * reflow synchrone ~60 fois par seconde, ce qui etouffe le thread sur
   * les pages lourdes.
   */
  const lastAimRef = useRef<{
    px: number | null;
    py: number | null;
    done: boolean;
  } | null>(null);

  /* ------------------------------ montage ------------------------------- */
  const blockIndexRef = useRef(0);
  const blockStartRef = useRef(0);
  const nextAtRef = useRef(Infinity);

  /**
   * Props lues par la boucle : le rAF garde la meme fermeture `tick` tant
   * qu'il tourne, donc les valeurs qui peuvent changer a chaud (cycle en
   * cours, follow active, fin de montage) passent par une reference
   * reecrite a chaque rendu — sinon une pause/reprise de `playing` serait
   * invisible jusqu'au prochain redemarrage de la boucle.
   */
  const liveRef = useRef({ cycle, playing, follow, onCycleEnd });
  liveRef.current = { cycle, playing, follow, onCycleEnd };

  const releaseLook = () => {
    if (!aimingRef.current) return;
    engine.setLook(null, clockRef.current, TURN_TIME);
    aimingRef.current = false;
  };

  const aim = () => {
    // Le regard ne se pilote que sur les etats a VISAGE DE REPOS : ailleurs
    // la pose du regard EST l'animation relevee.
    if (!STATE_BY_ID.get(engine.state)?.baseFace) {
      releaseLook();
      lastAimRef.current = null;
      return;
    }
    if (!aimingRef.current) {
      turnSinceRef.current = clockRef.current;
    }
    const pointer = pointerRef.current;
    const tour =
      easings.easeOutQuint(
        clamp((clockRef.current - turnSinceRef.current) / TURN_TIME),
      ) >= 1;
    const last = lastAimRef.current;
    if (
      last &&
      last.done &&
      (last.px === (pointer?.x ?? null) && last.py === (pointer?.y ?? null))
    ) {
      // Pointeur immobile et rampe finie : la cible est deja la bonne.
      return;
    }
    const box = svgRef.current?.getBoundingClientRect();
    // Une boite sans surface donnerait 0/0 = NaN, et le moteur garde la
    // derniere cible : un seul NaN figerait le regard pour toujours.
    if (!box || box.width === 0 || box.height === 0) return;
    const demiLargeur = Math.max(1, window.innerWidth / 2);
    const demiHauteur = Math.max(1, window.innerHeight / 2);
    engine.setLook(
      lookTarget({
        nx: pointer
          ? clamp((pointer.x - (box.left + box.width / 2)) / demiLargeur, -1, 1)
          : 0,
        ny: pointer
          ? clamp((pointer.y - (box.top + box.height / 2)) / demiHauteur, -1, 1)
          : 0,
        tour: easings.easeOutQuint(
          clamp((clockRef.current - turnSinceRef.current) / TURN_TIME),
        ),
        pointer: pointer !== null,
      }),
      clockRef.current,
    );
    lastAimRef.current = {
      px: pointer?.x ?? null,
      py: pointer?.y ?? null,
      done: tour,
    };
    aimingRef.current = true;
  };

  const applyBlock = (index: number, from = 0) => {
    const { cycle: blocks, playing: isPlaying } = liveRef.current;
    const b = blocks?.[index];
    if (!blocks || !b) {
      nextAtRef.current = Infinity;
      return;
    }
    blockStartRef.current = clockRef.current - from;
    engine.setState(b.state, clockRef.current);
    nextAtRef.current = isPlaying
      ? blockStartRef.current + b.duration
      : Infinity;
  };

  const tick = (ms: number) => {
    rafRef.current = 0;
    const dt = lastRef.current ? Math.min((ms - lastRef.current) / 1000, MAX_DT) : 0;
    lastRef.current = ms;
    clockRef.current += dt;
    const clock = clockRef.current;

    const { cycle: blocks, playing: isPlaying, follow: isFollowing, onCycleEnd: onEnd } =
      liveRef.current;

    if (isPlaying && blocks?.length && clock >= nextAtRef.current) {
      const next = blockIndexRef.current + 1;
      if (next >= blocks.length) {
        nextAtRef.current = Infinity;
        onEnd?.();
      } else {
        blockIndexRef.current = next;
        applyBlock(next);
      }
    }

    if (isFollowing) aim();

    if (ms - lastCommitRef.current >= MIN_FRAME_MS) {
      lastCommitRef.current = ms;
      setFrame(engine.sample(clock));
    }
    schedule();
  };

  const schedule = () => {
    if (rafRef.current === 0 && activeRef.current.onScreen && activeRef.current.visible && frozenAt === undefined) {
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const stopLoop = () => {
    if (rafRef.current !== 0) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    lastRef.current = 0;
  };

  /* ------------------- montage/demontage et visibilite ------------------ */
  const animated = frozenAt === undefined;

  useEffect(() => {
    if (!animated) return;

    const element = svgRef.current;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      activeRef.current.onScreen = entry.isIntersecting;
      if (entry.isIntersecting) {
        schedule();
      } else {
        stopLoop();
      }
    });
    if (element) observer.observe(element);

    const onVisibility = () => {
      activeRef.current.visible = !document.hidden;
      if (document.hidden) {
        stopLoop();
      } else {
        schedule();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    schedule();

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      stopLoop();
      releaseLook();
    };
  }, [animated]);

  /* --------------- ecoute du pointeur, seulement en suivi --------------- */
  useEffect(() => {
    if (!follow || !animated) return;

    const onPointerMove = (event: PointerEvent) => {
      // Le tactile n'a pas de curseur qui traine : un doigt leve laisserait
      // le regard fige sur le dernier point touche.
      if (event.pointerType === 'touch') return;
      pointerRef.current = { x: event.clientX, y: event.clientY };
    };
    const onPointerLeave = () => {
      pointerRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerleave', onPointerLeave);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      releaseLook();
    };
  }, [follow, animated]);

  /* ------------------------- props -> moteur ---------------------------- */
  const shapeRadii = SHAPE_BY_ID.get(shape)?.radii ?? null;
  const expressionCfg = EXPRESSION_BY_ID.get(expression) ?? null;

  useEffect(() => {
    engine.setShape(shapeRadii, clockRef.current);
    if (!animated) setFrame(engine.sample(frozenAt ?? 0));
  }, [shapeRadii]);

  useEffect(() => {
    engine.setExpression(expressionCfg, clockRef.current);
    if (!animated) setFrame(engine.sample(frozenAt ?? 0));
  }, [expressionCfg]);

  useEffect(() => {
    if (cycle?.length && playing) return; // le montage pilote l'etat
    engine.setState(state, clockRef.current);
    if (!animated) setFrame(engine.sample(frozenAt ?? 0));
  }, [state]);

  // `restartKey` : rearme l'etat depuis sa date 0 (`reset`, pas `setState` —
  // celui-ci ignore l'etat deja courant). Coupure nette voulue : c'est ainsi
  // qu'on relance une course de "!" deja terminee.
  useEffect(() => {
    if (restartKey === undefined) return;
    engine.reset(state, clockRef.current);
    if (!animated) setFrame(engine.sample(frozenAt ?? 0));
  }, [restartKey]);

  // Debute ou repositionne le montage quand cycle/playing changent.
  useEffect(() => {
    if (!cycle?.length) {
      nextAtRef.current = Infinity;
      return;
    }
    if (playing) {
      applyBlock(blockIndexRef.current);
    } else {
      nextAtRef.current = Infinity;
    }
  }, [cycle, playing]);

  // Recale le curseur de bloc si le montage raccourcit.
  useEffect(() => {
    if (!cycle?.length) return;
    const i = Math.min(blockIndexRef.current, cycle.length - 1);
    if (i !== blockIndexRef.current) {
      blockIndexRef.current = i;
      applyBlock(i);
    }
  }, [cycle]);

  /* --------------------------- rendu fige ------------------------------- */
  useEffect(() => {
    if (!animated) setFrame(engine.sample(frozenAt ?? 0));
  }, [frozenAt, animated]);

  const ink = COLOR_BY_ID.get(color)?.hex ?? '#0a0a0c';

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`${-VB} ${-VB} ${VB * 2} ${VB * 2}`}
      role={role}
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={-VB}
          y={-VB}
          width={VB * 2}
          height={VB * 2}
        >
          <path d={frame.bodyPath} fill="#fff" />
          {frame.eyes.map((eye, i) => (
            <path
              key={i}
              d={eye.d}
              transform={eye.matrix}
              opacity={eye.alpha}
              fill="#000"
            />
          ))}
          {frame.notch && (
            <circle
              cx={frame.notch.x}
              cy={frame.notch.y}
              r={frame.notch.r}
              fill="#000"
            />
          )}
        </mask>

        {frame.arcs.map((arc) => (
          <linearGradient
            key={arc.id}
            id={`${uid}-${arc.id}`}
            gradientUnits="userSpaceOnUse"
            x1={arc.grad.x1}
            y1={arc.grad.y1}
            x2={arc.grad.x2}
            y2={arc.grad.y2}
          >
            {arc.grad.stops.map((c, i) => (
              <stop
                key={i}
                offset={i / (arc.grad.stops.length - 1)}
                stopColor={c}
              />
            ))}
          </linearGradient>
        ))}
      </defs>

      {/* moitie arriere des orbites : dessinee avant le corps, donc occultee */}
      <g fill="none" strokeLinecap="round">
        {frame.arcs.map((arc) => (
          <path
            key={`b${arc.id}`}
            d={arc.back}
            stroke={`url(#${uid}-${arc.id})`}
            strokeWidth={arc.width}
            opacity={arc.opacity}
          />
        ))}
      </g>

      {/* particules de l'eclatement : elles passent derriere le noyau */}
      {frame.dotsBehind && (
        <g>
          {frame.dots.map((dot, i) => (
            <Dot key={`pb${i}`} dot={dot} ink={ink} paper={paper} />
          ))}
        </g>
      )}

      <g opacity={frame.bodyAlpha}>
        {/*
          Fond opaque a la forme exacte du corps, sous le corps lui-meme :
          les yeux sont des trous, ils laissent voir ce qui est dessine
          derriere — sans ce fond, un anneau arriere reapparait dedans.
        */}
        <path d={frame.bodyPath} fill={paper} />
        <g mask={`url(#${maskId})`}>
          <rect x={-VB} y={-VB} width={VB * 2} height={VB * 2} fill={ink} />
        </g>
      </g>

      {!frame.dotsBehind && (
        <g>
          {frame.dots.map((dot, i) => (
            <Dot key={`pf${i}`} dot={dot} ink={ink} paper={paper} />
          ))}
        </g>
      )}

      {frame.notif && (
        <circle
          cx={frame.notif.x}
          cy={frame.notif.y}
          r={frame.notif.r}
          fill={NOTIF_BLUE}
        />
      )}

      {/* moitie avant des orbites */}
      <g fill="none" strokeLinecap="round">
        {frame.arcs.map((arc) => (
          <path
            key={`f${arc.id}`}
            d={arc.front}
            stroke={`url(#${uid}-${arc.id})`}
            strokeWidth={arc.width}
            opacity={arc.opacity}
          />
        ))}
      </g>
    </svg>
  );
};
