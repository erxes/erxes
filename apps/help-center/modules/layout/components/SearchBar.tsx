'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';
import { site } from '../constants/site';

const ROTATE_MS = 3200;

const STEP = 2;

type Particle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
};

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scatter = (
  input: HTMLInputElement,
  canvas: HTMLCanvasElement,
  frame: { current: number },
  done: () => void,
) => {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const text = input.value;

  if (!context || !text.trim()) {
    done();
    return;
  }

  const { width, height } = input.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const styles = getComputedStyle(input);

  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);

  const fontSize = parseFloat(styles.fontSize) * ratio;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = `${styles.fontWeight} ${fontSize}px ${styles.fontFamily}`;
  context.fillStyle = styles.color;
  context.textBaseline = 'middle';
  context.fillText(
    text,
    parseFloat(styles.paddingLeft) * ratio,
    canvas.height / 2,
  );

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const particles: Particle[] = [];

  for (let y = 0; y < canvas.height; y += STEP) {
    for (let x = 0; x < canvas.width; x += STEP) {
      const offset = (y * canvas.width + x) * 4;
      const alpha = pixels[offset + 3];

      if (alpha > 24) {
        particles.push({
          x,
          y,
          size: STEP,
          speed: 1 + Math.random() * 3,
          color: `rgba(${pixels[offset]},${pixels[offset + 1]},${
            pixels[offset + 2]
          },${alpha / 255})`,
        });
      }
    }
  }

  if (!particles.length) {
    done();
    return;
  }

  const step = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    let alive = 0;

    for (const particle of particles) {
      if (particle.size <= 0) {
        continue;
      }

      particle.x += particle.speed * ratio;
      particle.y += (Math.random() - 0.5) * ratio;
      particle.size -= 0.06 * ratio;

      if (particle.size <= 0 || particle.x > canvas.width) {
        continue;
      }

      alive += 1;
      context.fillStyle = particle.color;
      context.fillRect(particle.x, particle.y, particle.size, particle.size);
    }

    if (alive) {
      frame.current = requestAnimationFrame(step);
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    done();
  };

  frame.current = requestAnimationFrame(step);
};

export const SearchBar = ({
  initialQuery = '',
  placeholder = '',
  suggestions = [],
}: {
  initialQuery?: string;
  placeholder?: string;
  suggestions?: string[];
}) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);

  const [query, setQuery] = useState(initialQuery);
  const [vanishing, setVanishing] = useState(false);
  const [slot, setSlot] = useState({ index: 0, previous: -1 });

  const label = placeholder || site.searchPlaceholder;
  const rotating = [label, ...suggestions];
  const rotates = rotating.length > 1;

  useEffect(() => {
    if (!rotates || query || vanishing || reducedMotion()) {
      return;
    }

    const timer = window.setInterval(() => {
      setSlot((current) => ({
        index: (current.index + 1) % rotating.length,
        previous: current.index,
      }));
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [rotates, rotating.length, query, vanishing]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const term = query.trim();
    const input = inputRef.current;
    const canvas = canvasRef.current;

    router.push(term ? `/search?q=${encodeURIComponent(term)}` : '/search');

    if (!term || !input || !canvas || reducedMotion()) {
      return;
    }

    setVanishing(true);
    scatter(input, canvas, frame, () => setVanishing(false));
    setQuery('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="group relative w-full"
    >
      <label htmlFor="kb-search" className="sr-only">
        {label}
      </label>

      <Icon
        name="search"
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-white/40 transition-colors duration-300 group-focus-within:text-white/80"
      />

      {rotates ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          {rotating.map((text, index) => (
            <span
              key={`${index}-${text}`}
              className={cn(
                'absolute inset-y-0 left-11 right-24 flex items-center text-[15px] text-white/35 transition-[opacity,transform] duration-500 ease-out-soft',
                query || vanishing
                  ? 'opacity-0'
                  : index === slot.index
                  ? 'translate-y-0 opacity-100'
                  : index === slot.previous
                  ? '-translate-y-4 opacity-0'
                  : 'translate-y-4 opacity-0',
              )}
            >
              <span className="min-w-0 truncate">{text}</span>
            </span>
          ))}
        </span>
      ) : null}

      <input
        ref={inputRef}
        id="kb-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={rotates ? undefined : label}
        className={cn(
          'relative h-12 w-full rounded-xl border border-shell-line bg-shell-soft pl-11 pr-24 text-[15px] text-white transition-[border-color,background-color,box-shadow] duration-300 ease-out-soft placeholder:text-white/35 focus:border-brand/50 focus:bg-shell-soft/80 focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-brand)_28%,transparent)] focus:outline-none',
          vanishing && 'text-transparent caret-transparent',
        )}
      />

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 size-full',
          vanishing ? 'opacity-100' : 'opacity-0',
        )}
      />

      <button
        type="submit"
        className="absolute right-2 top-1/2 z-10 h-8 -translate-y-1/2 rounded-lg bg-white px-3.5 text-[13px] font-semibold text-shell transition-[background-color,transform] duration-300 ease-out-soft hover:scale-[1.03] hover:bg-white/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        Search
      </button>
    </form>
  );
};
