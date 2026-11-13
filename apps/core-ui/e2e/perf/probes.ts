// The in-page side of measure.ts: Playwright serializes `installProbes` into every page before
// its scripts run, so it must not reference anything outside its own body.

export interface Sample {
  ms: number;
  renders: number;
}

interface Fiber {
  tag: number;
  flags: number;
  child: Fiber | null;
  sibling: Fiber | null;
  alternate: Fiber | null;
}

declare global {
  interface Window {
    perf: {
      rendered: number;
      lcp: number;
      lastLongTaskEnd: number;
      frame: () => Promise<void>;
      /** Runs `act` and waits for the next frame: its latency and the components that ran. */
      time: (act: () => void | Promise<void>) => Promise<Sample>;
      repeat: (times: number, act: (i: number) => void | Promise<void>) => Promise<Sample[]>;
      /** Polls `done` every 5 ms, for 5 s at most. */
      until: (done: () => boolean) => Promise<void>;
      type: (input: HTMLInputElement, text: string) => void;
      pointer: (type: string, x: number, y: number, target: EventTarget) => void;
    };
  }
}

/**
 * React DOM, even in production, hands every commit to a devtools hook when it finds one;
 * PerformedWork (flag 1) marks a fiber whose component ran in that render.
 */
export const installProbes = () => {
  // FunctionComponent 0, ClassComponent 1, ForwardRef 11, MemoComponent 14, SimpleMemoComponent 15
  const COMPONENT_TAGS = new Set([0, 1, 11, 14, 15]);
  // A subtree that bails out keeps its fiber objects, flags and all, so a fiber counts once
  // per object until its alternate renders.
  const counted = new WeakSet<Fiber>();

  const probes: Window['perf'] = {
    rendered: 0,
    lcp: 0,
    lastLongTaskEnd: 0,
    frame: () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0))),
    time: async (act) => {
      await probes.frame();
      const before = probes.rendered;
      const start = performance.now();

      await act();
      await probes.frame();

      return { ms: performance.now() - start, renders: probes.rendered - before };
    },
    repeat: async (times, act) => {
      const samples: Sample[] = [];

      for (let i = 0; i < times; i++) samples.push(await probes.time(() => act(i)));

      return samples;
    },
    until: async (done) => {
      for (let waited = 0; waited < 5000 && !done(); waited += 5) {
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
    },
    // setRangeText bypasses React's value tracker, so React sees the change as typing.
    type: (input, text) => {
      input.setRangeText(text, input.value.length, input.value.length, 'end');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    },
    pointer: (type, x, y, target) => {
      const init = { bubbles: true, clientX: x, clientY: y, button: 0, buttons: 1, pointerId: 1 };

      target.dispatchEvent(new PointerEvent(type, { ...init, isPrimary: true }));
    },
  };

  const walk = (root: Fiber) => {
    const stack: Fiber[] = [];
    let node: Fiber | undefined = root;

    while (node) {
      if (COMPONENT_TAGS.has(node.tag) && (node.flags & 1) === 1 && !counted.has(node)) {
        probes.rendered++;
        counted.add(node);

        if (node.alternate) counted.delete(node.alternate);
      }

      if (node.child) {
        if (node.sibling) stack.push(node.sibling);
        node = node.child;
      } else {
        node = node.sibling ?? stack.pop();
      }
    }
  };

  const renderers = new Map<number, unknown>();

  // React reads the hook under this fixed name.
  Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
    value: {
      renderers,
      supportsFiber: true,
      inject: (renderer: unknown) => {
        renderers.set(renderers.size + 1, renderer);

        return renderers.size;
      },
      onScheduleFiberRoot: () => undefined,
      onCommitFiberRoot: (_id: number, root: { current: Fiber }) => walk(root.current),
      onCommitFiberUnmount: () => undefined,
      onPostCommitFiberRoot: () => undefined,
      checkDCE: () => undefined,
    },
  });

  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) probes.lcp = entry.startTime;
  }).observe({ type: 'largest-contentful-paint', buffered: true });

  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      probes.lastLongTaskEnd = Math.max(probes.lastLongTaskEnd, entry.startTime + entry.duration);
    }
  }).observe({ type: 'longtask', buffered: true });

  window.perf = probes;
};
