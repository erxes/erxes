// Pure layout: workflow DSL definition → positioned nodes + edges for the
// React Flow canvas. No React imports — kept separate so the geometry stays
// testable and the component file stays about rendering.
//
// The DSL is a sequential chain with two fan-out constructs:
//   branch   — one lane per condition (+ optional else), lanes re-join after
//   parallel — all child steps run concurrently, then re-join
// Layout is a classic recursive tree measure-then-place: every step knows the
// width/height of its subtree, lanes are centered under their parent, and the
// chain resumes below the tallest lane.

export const NODE_W = 240;
export const NODE_H = 76;
const V_GAP = 56;
const H_GAP = 48;

export type WfNodeKind =
  | 'trigger'
  | 'operation'
  | 'agent'
  | 'branch'
  | 'parallel'
  | 'end'
  | 'other';

export interface WfNodeData {
  kind: WfNodeKind;
  label: string;
  subtitle?: string;
  status?: string; // from a run's stepsSummary: success | failed | running | …
  error?: string;
  [key: string]: unknown;
}

export interface WfNode {
  id: string;
  type: 'wfNode';
  position: { x: number; y: number };
  data: WfNodeData;
}

export interface WfEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

type StepDef = { id: string; type: string; [key: string]: any };
type StepsSummary = Record<string, { status?: string; error?: string }>;

// ── Node descriptions ─────────────────────────────────────────────────────────

function kindOf(step: StepDef): WfNodeKind {
  switch (step.type) {
    case 'operation':
    case 'agent':
    case 'branch':
    case 'parallel':
    case 'end':
      return step.type;
    default:
      return 'other';
  }
}

function clip(text: string, max = 46): string {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max) + '…' : t;
}

function subtitleOf(step: StepDef): string | undefined {
  switch (step.type) {
    case 'operation':
      return step.operation;
    case 'agent':
      return step.prompt
        ? `${step.agentRef}: ${clip(step.prompt, 36)}`
        : step.agentRef;
    case 'branch': {
      const n = (step.branches || []).length;
      return `${n} branch${n !== 1 ? 'es' : ''}${step.else ? ' + else' : ''}`;
    }
    case 'parallel': {
      const n = (step.steps || []).length;
      return `${n} concurrent step${n !== 1 ? 's' : ''}`;
    }
    case 'end': {
      const keys = step.output ? Object.keys(step.output) : [];
      return keys.length ? `output: ${clip(keys.join(', '), 36)}` : undefined;
    }
    default:
      return step.type;
  }
}

export function triggerSubtitle(definition: any): string {
  const t = definition?.trigger;
  if (!t?.type) return 'manual';
  if (t.type === 'schedule' && t.config?.cron) return `cron: ${t.config.cron}`;
  return t.type;
}

// ── Measure pass ──────────────────────────────────────────────────────────────

interface Size {
  width: number;
  height: number;
}

function measureStep(step: StepDef): Size {
  const lanes = lanesOf(step);
  if (!lanes) return { width: NODE_W, height: NODE_H };

  const sizes = lanes.map((l) => measureChain(l.steps));
  const lanesWidth = sizes.length
    ? sizes.reduce((s, x) => s + x.width, 0) + H_GAP * (sizes.length - 1)
    : 0;
  const lanesHeight = sizes.length
    ? Math.max(...sizes.map((s) => s.height)) + V_GAP
    : 0;
  return {
    width: Math.max(NODE_W, lanesWidth),
    height: NODE_H + lanesHeight,
  };
}

function measureChain(steps: StepDef[]): Size {
  if (!steps.length) return { width: 0, height: 0 };
  const sizes = steps.map(measureStep);
  return {
    width: Math.max(...sizes.map((s) => s.width)),
    height:
      sizes.reduce((s, x) => s + x.height, 0) + V_GAP * (sizes.length - 1),
  };
}

// Fan-out lanes of a step, with the edge label leading into each lane.
// Returns null for plain (non-container) steps. Empty lanes (e.g. `else: []`)
// are kept — they become a labeled pass-through edge to the join point.
function lanesOf(step: StepDef): { label?: string; steps: StepDef[] }[] | null {
  if (step.type === 'branch') {
    const lanes = (step.branches || []).map((b: any) => ({
      label: clip(b.when || '', 28),
      steps: b.steps || [],
    }));
    if (step.else) lanes.push({ label: 'else', steps: step.else });
    return lanes;
  }
  if (step.type === 'parallel') {
    return (step.steps || []).map((s: StepDef) => ({ steps: [s] }));
  }
  return null;
}

// ── Place pass ────────────────────────────────────────────────────────────────

interface ChainResult {
  entryId: string | null;
  // Dangling exits to connect to whatever follows; label survives empty lanes.
  exits: { id: string; label?: string }[];
}

export function buildWorkflowGraph(
  definition: any,
  stepsSummary?: StepsSummary | null,
): { nodes: WfNode[]; edges: WfEdge[] } {
  const nodes: WfNode[] = [];
  const edges: WfEdge[] = [];
  const summary = stepsSummary || {};
  let edgeSeq = 0;

  const addEdge = (source: string, target: string, label?: string) => {
    edges.push({
      id: `e${edgeSeq++}-${source}-${target}`,
      source,
      target,
      label,
    });
  };

  const placeStep = (
    step: StepDef,
    centerX: number,
    y: number,
  ): ChainResult => {
    const s = summary[step.id] || {};
    nodes.push({
      id: step.id,
      type: 'wfNode',
      position: { x: centerX - NODE_W / 2, y },
      data: {
        kind: kindOf(step),
        label: step.id,
        subtitle: subtitleOf(step),
        status: s.status,
        error: s.error,
      },
    });

    if (step.type === 'end') return { entryId: step.id, exits: [] };

    const lanes = lanesOf(step);
    if (!lanes || !lanes.length) {
      return { entryId: step.id, exits: [{ id: step.id }] };
    }

    const sizes = lanes.map((l) => measureChain(l.steps));
    const lanesWidth =
      sizes.reduce((acc, x) => acc + x.width, 0) + H_GAP * (sizes.length - 1);
    let laneX = centerX - lanesWidth / 2;
    const laneY = y + NODE_H + V_GAP;

    const exits: { id: string; label?: string }[] = [];
    lanes.forEach((lane, i) => {
      const size = sizes[i];
      if (!lane.steps.length) {
        // Empty lane: the labeled path skips straight to the join point.
        exits.push({ id: step.id, label: lane.label });
        return;
      }
      const laneCenter = laneX + size.width / 2;
      const result = placeChain(lane.steps, laneCenter, laneY);
      if (result.entryId) addEdge(step.id, result.entryId, lane.label);
      exits.push(...result.exits);
      laneX += size.width + H_GAP;
    });

    return { entryId: step.id, exits };
  };

  const placeChain = (
    steps: StepDef[],
    centerX: number,
    y: number,
  ): ChainResult => {
    let entryId: string | null = null;
    let prevExits: { id: string; label?: string }[] = [];
    let curY = y;

    for (const step of steps) {
      const size = measureStep(step);
      const result = placeStep(step, centerX, curY);
      if (!entryId) entryId = result.entryId;
      if (result.entryId) {
        for (const exit of prevExits)
          addEdge(exit.id, result.entryId, exit.label);
      }
      prevExits = result.exits;
      curY += size.height + V_GAP;
    }

    return { entryId, exits: prevExits };
  };

  const steps: StepDef[] = Array.isArray(definition?.steps)
    ? definition.steps
    : [];
  const chainSize = measureChain(steps);
  const centerX = Math.max(chainSize.width, NODE_W) / 2;

  // Trigger pseudo-node at the top of the chain.
  const triggerId = '__trigger__';
  nodes.push({
    id: triggerId,
    type: 'wfNode',
    position: { x: centerX - NODE_W / 2, y: 0 },
    data: {
      kind: 'trigger',
      label: 'Trigger',
      subtitle: triggerSubtitle(definition),
    },
  });

  const chain = placeChain(steps, centerX, NODE_H + V_GAP);
  if (chain.entryId) addEdge(triggerId, chain.entryId);

  return { nodes, edges };
}
