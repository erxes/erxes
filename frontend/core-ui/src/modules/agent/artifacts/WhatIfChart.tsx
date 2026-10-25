import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  IconArrowBackUp,
  IconArrowDownRight,
  IconArrowUpRight,
  IconInfoCircle,
} from '@tabler/icons-react';
import {
  evaluateChartFormula,
  type WhatIfChartInput,
  type WhatIfChartOutput,
  type WhatIfChartSpec,
} from './whatIfChartModel';
import {
  formatWhatIfEditable,
  formatWhatIfInputDelta,
  formatWhatIfPercentChange,
  formatWhatIfValue,
  parseWhatIfNumber,
  whatIfAffixes,
  whatIfAutoDecimals,
  whatIfChange,
  whatIfScaleKey,
  whatIfStepDecimals,
  whatIfTone,
  type WhatIfTone,
} from './whatIfFormat';
import { WHAT_IF_CHART_STYLES } from './whatIfChartStyles';

type CSSVariables = CSSProperties & Record<`--${string}`, string>;

type WhatIfResult = {
  output: WhatIfChartOutput;
  baseline: number | null;
  scenario: number | null;
  change: ReturnType<typeof whatIfChange>;
  tone: WhatIfTone;
};

const ASSUMPTION_PREVIEW_LENGTH = 140;

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Eases displayed numbers toward the latest value; instant for reduced motion. */
const useAnimatedNumber = (target: number | null) => {
  const [shown, setShown] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    const from = current.current;
    if (
      target === null ||
      from === null ||
      from === target ||
      prefersReducedMotion() ||
      typeof window.requestAnimationFrame !== 'function'
    ) {
      current.current = target;
      setShown(target);
      return;
    }
    const start = performance.now();
    let frame = window.requestAnimationFrame(function tick(now) {
      const progress = Math.min(1, (now - start) / 260);
      const value = from + (target - from) * (1 - (1 - progress) ** 3);
      current.current = value;
      setShown(value);
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [target]);
  return shown;
};

/** Delays screen-reader announcements until a slider drag settles. */
const useSettled = (value: string, delay = 600) => {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return settled;
};

const clamp = (input: WhatIfChartInput, value: number) =>
  Math.min(input.max, Math.max(input.min, value));
const inputDecimals = (input: WhatIfChartInput) =>
  input.decimals ?? whatIfStepDecimals(input.step);
const roundTo = (value: number, decimals: number) =>
  Number(value.toFixed(decimals));

const formatRelative = (change: WhatIfResult['change']) =>
  change?.relative === null || change?.relative === undefined
    ? '—'
    : formatWhatIfPercentChange(change.relative);

const ChangeChip = ({ result }: { result: WhatIfResult }) => {
  const { change, output, tone } = result;
  if (!change) return null;
  if (change.absolute === 0)
    return (
      <span className="aw-chip" data-tone="neutral">
        No change
      </span>
    );
  const Arrow = change.absolute > 0 ? IconArrowUpRight : IconArrowDownRight;
  return (
    <span
      className="aw-chip"
      data-tone={tone}
      title={formatWhatIfValue(change.absolute, output, { sign: true })}
    >
      <Arrow size={12} stroke={2.4} aria-hidden="true" />
      {change.relative === null
        ? formatWhatIfValue(change.absolute, output, {
            sign: true,
            compact: true,
          })
        : formatWhatIfPercentChange(change.relative)}
    </span>
  );
};

const NumberField = ({
  id,
  input,
  value,
  describedBy,
  onCommit,
}: {
  id: string;
  input: WhatIfChartInput;
  value: number;
  describedBy?: string;
  onCommit: (value: number) => void;
}) => {
  const [draft, setDraft] = useState<string | null>(null);
  const decimals = inputDecimals(input);
  const { prefix, suffix } = whatIfAffixes(input);
  const parsed = draft === null ? value : parseWhatIfNumber(draft);
  const invalid =
    draft !== null &&
    (parsed === null || parsed < input.min || parsed > input.max);
  const commit = (next: number) => onCommit(roundTo(clamp(input, next), 6));
  const finish = () => {
    if (draft === null) return;
    const next = parseWhatIfNumber(draft);
    if (next !== null) commit(next);
    setDraft(null);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') finish();
    else if (event.key === 'Escape') setDraft(null);
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const steps = (event.shiftKey ? 10 : 1) * input.step;
      const next = roundTo(
        clamp(input, value + (event.key === 'ArrowUp' ? steps : -steps)),
        Math.max(decimals, whatIfStepDecimals(input.step)),
      );
      onCommit(next);
      setDraft(formatWhatIfEditable(next));
    }
  };
  return (
    <div className="aw-number" data-invalid={invalid || undefined}>
      {prefix && (
        <span className="aw-affix" aria-hidden="true">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        value={
          draft ??
          formatWhatIfValue(value, input, {
            plain: true,
            decimals: Number.isInteger(value) && !input.decimals ? 0 : decimals,
          })
        }
        onFocus={(event) => {
          setDraft(formatWhatIfEditable(value));
          event.currentTarget.select();
        }}
        onChange={(event) => {
          setDraft(event.target.value);
          const next = parseWhatIfNumber(event.target.value);
          if (next !== null && next >= input.min && next <= input.max)
            commit(next);
        }}
        onBlur={finish}
        onKeyDown={onKeyDown}
      />
      {suffix && (
        <span className="aw-affix" aria-hidden="true">
          {suffix}
        </span>
      )}
    </div>
  );
};

const InputControl = ({
  input,
  baseline,
  value,
  onChange,
}: {
  input: WhatIfChartInput;
  baseline: number;
  value: number;
  onChange: (value: number) => void;
}) => {
  const id = useId();
  const delta = formatWhatIfInputDelta(baseline, value, input);
  const span = input.max - input.min;
  const sliderStyle: CSSVariables = {
    '--aw-fill': String((value - input.min) / span),
  };
  const tickStyle: CSSVariables = {
    '--aw-mark': String((baseline - input.min) / span),
  };
  const describedBy = input.description ? `${id}-hint` : undefined;
  return (
    <div className="aw-field">
      <div className="aw-field-head">
        <label className="aw-label" id={`${id}-label`} htmlFor={`${id}-value`}>
          {input.label}
        </label>
        {delta ? (
          <span
            className="aw-chip"
            data-tone="changed"
            title={`Baseline ${formatWhatIfValue(baseline, input)}`}
          >
            {delta}
          </span>
        ) : (
          <span className="aw-chip" data-tone="neutral">
            Baseline
          </span>
        )}
      </div>
      {input.description && (
        <p className="aw-hint" id={describedBy}>
          {input.description}
        </p>
      )}
      <div className="aw-control">
        <div className="aw-slider-wrap">
          <input
            className="aw-slider"
            type="range"
            min={input.min}
            max={input.max}
            step={input.step}
            value={value}
            style={sliderStyle}
            aria-labelledby={`${id}-label`}
            aria-describedby={describedBy}
            aria-valuetext={formatWhatIfValue(value, input)}
            onChange={(event) => onChange(Number(event.target.value))}
          />
          <span
            className="aw-tick"
            style={tickStyle}
            title="Baseline"
            aria-hidden="true"
          />
        </div>
        <NumberField
          id={`${id}-value`}
          input={input}
          value={value}
          describedBy={describedBy}
          onCommit={onChange}
        />
      </div>
      <div className="aw-range" aria-hidden="true">
        <span>{formatWhatIfValue(input.min, input, { compact: true })}</span>
        <span>{formatWhatIfValue(input.max, input, { compact: true })}</span>
      </div>
    </div>
  );
};

const KpiTile = ({ result }: { result: WhatIfResult }) => {
  const { output, baseline, scenario } = result;
  const shown = useAnimatedNumber(scenario);
  return (
    <div className="aw-kpi">
      <p className="aw-kpi-label">{output.label}</p>
      {output.description && (
        <p className="aw-kpi-hint">{output.description}</p>
      )}
      {scenario === null ? (
        <p className="aw-kpi-value" data-unavailable="">
          Unavailable — check inputs
        </p>
      ) : (
        <p className="aw-kpi-value">
          {formatWhatIfValue(
            shown === null
              ? null
              : roundTo(shown, output.decimals ?? whatIfAutoDecimals(scenario)),
            output,
          )}
        </p>
      )}
      <div className="aw-kpi-foot">
        <ChangeChip result={result} />
        <span>Baseline {formatWhatIfValue(baseline, output)}</span>
      </div>
    </div>
  );
};

const domainOf = (values: (number | null)[]) => {
  const finite = values.filter((value): value is number => value !== null);
  const low = Math.min(0, ...finite);
  const high = Math.max(0, ...finite);
  return { low, span: high - low || 1 };
};

const Bar = ({
  value,
  domain,
  series,
}: {
  value: number | null;
  domain: { low: number; span: number };
  series: 'baseline' | 'scenario';
}) => {
  if (value === null) return null;
  const style: CSSVariables = {
    '--aw-left': String((Math.min(0, value) - domain.low) / domain.span),
    '--aw-width': String(Math.abs(value) / domain.span),
  };
  return (
    <span
      className="aw-bar"
      data-series={series}
      data-zero={value === 0 ? '' : undefined}
      style={style}
    />
  );
};

const BarChart = ({
  results,
  shared,
}: {
  results: WhatIfResult[];
  shared: boolean;
}) => {
  const sharedDomain = domainOf(
    results.flatMap((result) => [result.baseline, result.scenario]),
  );
  return (
    <figure className="aw-chart">
      {results.map((result, index) => {
        const { output, baseline, scenario, change } = result;
        const domain = shared ? sharedDomain : domainOf([baseline, scenario]);
        const zero: CSSVariables = {
          '--aw-left': String(-domain.low / domain.span),
        };
        const label = `${output.label}: baseline ${formatWhatIfValue(
          baseline,
          output,
        )}, scenario ${formatWhatIfValue(scenario, output)}${
          change
            ? `, change ${formatWhatIfValue(change.absolute, output, {
                sign: true,
              })} (${formatRelative(change)})`
            : ''
        }`;
        return (
          <div key={index} className="aw-group" role="img" aria-label={label}>
            <div className="aw-group-label" aria-hidden="true">
              <span>{output.label}</span>
              <ChangeChip result={result} />
            </div>
            {(['baseline', 'scenario'] as const).map((series) => (
              <div key={series} className="aw-bar-row" aria-hidden="true">
                <span className="aw-track">
                  {domain.low < 0 && <span className="aw-zero" style={zero} />}
                  <Bar
                    value={series === 'baseline' ? baseline : scenario}
                    domain={domain}
                    series={series}
                  />
                </span>
                <span className="aw-bar-value" data-series={series}>
                  {formatWhatIfValue(
                    series === 'baseline' ? baseline : scenario,
                    output,
                    { compact: true },
                  )}
                </span>
              </div>
            ))}
          </div>
        );
      })}
      <figcaption className="aw-caption">
        {results.length > 1 && !shared
          ? 'Each metric uses its own scale.'
          : 'Bars share one scale.'}
      </figcaption>
    </figure>
  );
};

const ResultTable = ({ results }: { results: WhatIfResult[] }) => (
  <div className="aw-table-wrap">
    <table className="aw-table">
      <thead>
        <tr>
          <th scope="col">Metric</th>
          <th scope="col">Baseline</th>
          <th scope="col">Scenario</th>
          <th scope="col">Δ</th>
          <th scope="col">Δ%</th>
        </tr>
      </thead>
      <tbody>
        {results.map(({ output, baseline, scenario, change, tone }, index) => (
          <tr key={index}>
            <th scope="row">{output.label}</th>
            <td>{formatWhatIfValue(baseline, output)}</td>
            <td>{formatWhatIfValue(scenario, output)}</td>
            <td data-tone={tone}>
              {change
                ? formatWhatIfValue(change.absolute, output, { sign: true })
                : '—'}
            </td>
            <td data-tone={tone}>{formatRelative(change)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const WhatIfChart = ({ spec }: { spec: WhatIfChartSpec }) => {
  const id = useId();
  const baseline = useMemo(
    () => new Map(spec.inputs.map((input) => [input.id, input.value])),
    [spec],
  );
  const [values, setValues] = useState(baseline);
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [expanded, setExpanded] = useState(false);
  const changed = spec.inputs.some(
    (input) => values.get(input.id) !== input.value,
  );
  const results: WhatIfResult[] = spec.outputs.map((output) => {
    const original = evaluateChartFormula(output.formula, baseline);
    const scenario = evaluateChartFormula(output.formula, values);
    const change = whatIfChange(original, scenario);
    return {
      output,
      baseline: original,
      scenario,
      change,
      tone: change ? whatIfTone(change.absolute, output.better) : 'neutral',
    };
  });
  const shared = new Set(spec.outputs.map(whatIfScaleKey)).size === 1;
  const longAssumption = spec.assumption.length > ASSUMPTION_PREVIEW_LENGTH;
  const announcement = useSettled(
    results
      .map(
        ({ output, scenario, change }) =>
          `${output.label} ${formatWhatIfValue(scenario, output)}${
            change && change.absolute !== 0
              ? ` (${formatRelative(change)} vs baseline)`
              : ''
          }`,
      )
      .join('; '),
  );

  return (
    <section className="aw" aria-labelledby={`${id}-title`}>
      <style>{WHAT_IF_CHART_STYLES}</style>
      <header className="aw-head">
        <div className="aw-titlebar">
          <h3 className="aw-title" id={`${id}-title`}>
            {spec.title}
          </h3>
          <span className="aw-badge">What-if · does not change records</span>
        </div>
        <p className="aw-note">
          <IconInfoCircle size={14} aria-hidden="true" />
          <span
            className="aw-note-text"
            id={`${id}-assumption`}
            data-clamped={longAssumption && !expanded ? '' : undefined}
          >
            {spec.assumption}
          </span>
        </p>
        {longAssumption && (
          <button
            type="button"
            className="aw-link"
            aria-expanded={expanded}
            aria-controls={`${id}-assumption`}
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? 'Show less' : 'Show full assumptions'}
          </button>
        )}
      </header>

      <div className="aw-section" role="group" aria-labelledby={`${id}-inputs`}>
        <div className="aw-section-head">
          <h4 className="aw-eyebrow" id={`${id}-inputs`}>
            Scenario inputs
          </h4>
          <button
            type="button"
            className="aw-btn"
            disabled={!changed}
            onClick={() => setValues(baseline)}
          >
            <IconArrowBackUp size={14} aria-hidden="true" />
            Reset scenario
          </button>
        </div>
        <div className="aw-inputs">
          {spec.inputs.map((input) => (
            <InputControl
              key={input.id}
              input={input}
              baseline={input.value}
              value={values.get(input.id) ?? input.value}
              onChange={(next) =>
                setValues((previous) =>
                  new Map(previous).set(input.id, clamp(input, next)),
                )
              }
            />
          ))}
        </div>
      </div>

      <div
        className="aw-section"
        role="group"
        aria-labelledby={`${id}-results`}
      >
        <div className="aw-section-head">
          <h4 className="aw-eyebrow" id={`${id}-results`}>
            Results
          </h4>
          <div className="aw-seg" role="group" aria-label="Results view">
            {(['chart', 'table'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                onClick={() => setView(option)}
              >
                {option === 'chart' ? 'Chart' : 'Table'}
              </button>
            ))}
          </div>
        </div>
        <div className="aw-kpis">
          {results.map((result, index) => (
            <KpiTile key={index} result={result} />
          ))}
        </div>
        {view === 'chart' ? (
          <>
            <p className="aw-legend" aria-hidden="true">
              <span>
                <span className="aw-swatch" data-series="baseline" />
                Baseline
              </span>
              <span>
                <span className="aw-swatch" data-series="scenario" />
                Scenario
              </span>
            </p>
            <BarChart results={results} shared={shared} />
          </>
        ) : (
          <ResultTable results={results} />
        )}
      </div>
      <p className="aw-sr-only" aria-live="polite" aria-atomic="true">
        {changed ? `Scenario: ${announcement}` : ''}
      </p>
    </section>
  );
};
