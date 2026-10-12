import {
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export type BotRunnerStatus = 'idle' | 'running' | 'over';
type ObstacleKind = 'box' | 'hole' | 'laser';
type Pose = 'run' | 'slide' | 'jump' | 'dead';

type Obstacle = {
  kind: ObstacleKind;
  x: number;
  w: number;
  h: number;
  y: number;
};

type World = {
  y: number;
  vy: number;
  slideHeld: boolean;
  slideTime: number;
  falling: boolean;
  speed: number;
  distance: number;
  untilSpawn: number;
  obstacles: Obstacle[];
};

type Box = { x1: number; x2: number; y1: number; y2: number };

export const RUNNER_PLAYER_X = 40;
export const RUNNER_SLOTS = 5;

const GRAVITY = 2400;
const JUMP_VELOCITY = 780;
const FAST_FALL = 3;
const SLIDE_SECONDS = 0.5;
const START_SPEED = 320;
const MAX_SPEED = 720;
const ACCELERATION = 8;
const LASER_HEIGHT = 34;
const RESTART_DELAY_MS = 400;

const STAND_BOX: Box = { x1: 12, x2: 38, y1: 0, y2: 50 };
const SLIDE_BOX: Box = { x1: 4, x2: 46, y1: 0, y2: 24 };

// Survives remounts within the page; a refresh clears it on purpose.
let sessionBest = 0;

const random = (min: number, max: number) => min + Math.random() * (max - min);

const createWorld = (): World => ({
  y: 0,
  vy: 0,
  slideHeld: false,
  slideTime: 0,
  falling: false,
  speed: START_SPEED,
  distance: 0,
  untilSpawn: 500,
  obstacles: [],
});

const spawnObstacle = (world: World, stageWidth: number): Obstacle => {
  const roll = Math.random();
  const lasersAllowed = world.distance > 1500;

  if (lasersAllowed && roll < 0.25) {
    return { kind: 'laser', x: stageWidth, w: 34, h: 6, y: LASER_HEIGHT };
  }

  if (roll < 0.55) {
    return { kind: 'hole', x: stageWidth, w: random(36, 64), h: 0, y: 0 };
  }

  return {
    kind: 'box',
    x: stageWidth,
    w: random(18, 26),
    h: random(22, 38),
    y: 0,
  };
};

// A tap slides for a beat; holding keeps sliding.
const isSliding = (world: World) => world.slideHeld || world.slideTime > 0;

const playerBox = (world: World): Box => {
  const box = isSliding(world) && !world.falling ? SLIDE_BOX : STAND_BOX;

  return {
    x1: RUNNER_PLAYER_X + box.x1,
    x2: RUNNER_PLAYER_X + box.x2,
    y1: world.y + box.y1,
    y2: world.y + box.y2,
  };
};

const overlaps = (a: Box, o: Obstacle) =>
  a.x1 < o.x + o.w && a.x2 > o.x && a.y1 < o.y + o.h && a.y2 > o.y;

const isOverHole = (world: World) => {
  const feet = RUNNER_PLAYER_X + 24;

  return world.obstacles.some(
    (o) => o.kind === 'hole' && feet > o.x + 6 && feet < o.x + o.w - 6,
  );
};

// Advances one frame; returns true when the bot is done for.
const step = (world: World, dt: number, stageWidth: number) => {
  world.speed = Math.min(world.speed + ACCELERATION * dt, MAX_SPEED);
  world.distance += world.speed * dt;
  world.slideTime = Math.max(0, world.slideTime - dt);

  const gravity =
    isSliding(world) && world.y > 0 ? GRAVITY * FAST_FALL : GRAVITY;
  world.vy -= gravity * dt;
  world.y += world.vy * dt;

  if (world.y <= 0 && !world.falling) {
    if (isOverHole(world)) {
      world.falling = true;
    } else {
      world.y = 0;
      world.vy = 0;
    }
  }

  for (const o of world.obstacles) {
    o.x -= (o.kind === 'laser' ? world.speed * 1.25 : world.speed) * dt;
  }
  world.obstacles = world.obstacles.filter((o) => o.x + o.w > 0);

  world.untilSpawn -= world.speed * dt;
  if (world.untilSpawn <= 0 && world.obstacles.length < RUNNER_SLOTS) {
    const obstacle = spawnObstacle(world, stageWidth);
    world.obstacles.push(obstacle);
    world.untilSpawn = world.speed * random(0.75, 1.5) + obstacle.w;
  }

  if (world.falling) {
    return world.y < -40;
  }

  const box = playerBox(world);

  return world.obstacles.some((o) => o.kind !== 'hole' && overlaps(box, o));
};

const poseOf = (world: World, dead: boolean): Pose => {
  if (dead) return 'dead';
  if (world.y > 0 || world.falling) return 'jump';
  return isSliding(world) ? 'slide' : 'run';
};

// Cuts real gaps into the ground line where holes are.
const groundMask = (obstacles: Obstacle[]) => {
  const holes = obstacles
    .filter((o) => o.kind === 'hole')
    .sort((a, b) => a.x - b.x);

  if (!holes.length) return 'none';

  const stops = holes.map(
    (o) =>
      `#000 ${o.x}px, transparent ${o.x}px ${o.x + o.w}px, #000 ${o.x + o.w}px`,
  );

  return `linear-gradient(to right, #000 0, ${stops.join(', ')})`;
};

const formatScore = (distance: number) =>
  String(Math.floor(distance / 10)).padStart(5, '0');

type Refs = {
  ground: RefObject<HTMLDivElement | null>;
  player: RefObject<HTMLDivElement | null>;
  score: RefObject<HTMLSpanElement | null>;
  slots: MutableRefObject<(HTMLDivElement | null)[]>;
};

// Writes straight to the DOM so a frame never costs a React render.
const paint = (world: World, refs: Refs, dead: boolean) => {
  const player = refs.player.current;

  if (player) {
    player.style.transform = `translateY(${-world.y}px)`;
    player.dataset.pose = poseOf(world, dead);
  }

  if (refs.ground.current) {
    refs.ground.current.style.maskImage = groundMask(world.obstacles);
  }

  if (refs.score.current) {
    refs.score.current.textContent = formatScore(world.distance);
  }

  refs.slots.current.forEach((slot, index) => {
    if (!slot) return;

    const o = world.obstacles[index];

    if (!o) {
      slot.dataset.kind = '';
      return;
    }

    slot.dataset.kind = o.kind;
    slot.style.transform = `translateX(${o.x}px)`;
    slot.style.width = `${o.w}px`;

    // Only boxes vary in height; the rest take theirs from CSS.
    slot.style.height = o.kind === 'box' ? `${o.h}px` : '';
  });
};

const isJumpKey = (code: string) =>
  code === 'Space' || code === 'ArrowUp' || code === 'KeyW';

const isSlideKey = (code: string) => code === 'ArrowDown' || code === 'KeyS';

export const useBotRunner = () => {
  const [status, setStatus] = useState<BotRunnerStatus>('idle');
  const [best, setBest] = useState(sessionBest);

  const stageRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const world = useRef<World>(createWorld());
  const overAt = useRef(0);

  const start = useCallback(() => {
    world.current = createWorld();
    setStatus('running');
  }, []);

  const jump = useCallback(() => {
    const w = world.current;

    if (status !== 'running') {
      if (status === 'over' && Date.now() - overAt.current < RESTART_DELAY_MS) {
        return;
      }
      start();
      return;
    }

    if (w.y === 0 && !w.falling) {
      w.vy = JUMP_VELOCITY;
    }
  }, [status, start]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isJumpKey(e.code)) {
        e.preventDefault();
        if (!e.repeat) jump();
      } else if (isSlideKey(e.code)) {
        e.preventDefault();
        world.current.slideHeld = true;
        if (!e.repeat) world.current.slideTime = SLIDE_SECONDS;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (isSlideKey(e.code)) {
        world.current.slideHeld = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [jump]);

  useEffect(() => {
    if (status !== 'running') return;

    const refs: Refs = {
      ground: groundRef,
      player: playerRef,
      score: scoreRef,
      slots: slotRefs,
    };

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      // Clamped so a backgrounded tab does not teleport the bot on return.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const stageWidth = stageRef.current?.clientWidth ?? 600;
      const dead = step(world.current, dt, stageWidth);

      paint(world.current, refs, dead);

      if (dead) {
        sessionBest = Math.max(
          sessionBest,
          Math.floor(world.current.distance / 10),
        );
        overAt.current = Date.now();
        setBest(sessionBest);
        setStatus('over');
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [status]);

  const setSlotRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      slotRefs.current[index] = node;
    },
    [],
  );

  return {
    status,
    best: String(best).padStart(5, '0'),
    jump,
    stageRef,
    groundRef,
    playerRef,
    scoreRef,
    setSlotRef,
  };
};
