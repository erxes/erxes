import { useId, useState } from 'react';
import { Button, Input } from 'erxes-ui';
import { evaluateChartFormula, type WhatIfChartSpec } from './whatIfChartModel';

const format = (value: number | null, unit?: string) =>
  value === null
    ? 'Unavailable (check inputs)'
    : `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
        value,
      )}${unit ? ` ${unit}` : ''}`;

export const WhatIfChart = ({ spec }: { spec: WhatIfChartSpec }) => {
  const id = useId();
  const baseline = new Map(spec.inputs.map((input) => [input.id, input.value]));
  const [values, setValues] = useState(baseline);
  const update = (key: string, raw: string, min: number, max: number) => {
    if (!raw.trim()) return;
    const value = Number(raw);
    if (Number.isFinite(value))
      setValues((previous) =>
        new Map(previous).set(key, Math.max(min, Math.min(max, value))),
      );
  };
  return (
    <section
      aria-label={spec.title}
      style={{ margin: '16px 0', color: 'var(--foreground)' }}
    >
      <h3>{spec.title}</h3>
      <p>{spec.assumption}</p>
      <p style={{ fontSize: 12 }}>
        What-if scenario · changes here do not update workspace records.
      </p>
      {spec.inputs.map((input, index) => (
        <div key={input.id} style={{ marginBottom: 12 }}>
          <label htmlFor={`${id}-${index}`}>
            {input.label}
            {input.unit ? ` (${input.unit})` : ''}
          </label>
          <Input
            id={`${id}-${index}`}
            type="number"
            min={input.min}
            max={input.max}
            step={input.step}
            value={values.get(input.id)}
            onChange={(event) =>
              update(input.id, event.target.value, input.min, input.max)
            }
          />
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={() => setValues(baseline)}>
        Reset scenario
      </Button>
      <p style={{ fontSize: 12 }}>
        Baseline (outline) · Scenario (solid) · each metric has its own scale
      </p>
      <div aria-live="polite" aria-atomic="true">
        {spec.outputs.map((output, index) => {
          const original = evaluateChartFormula(output.formula, baseline);
          const scenario = evaluateChartFormula(output.formula, values);
          const low = Math.min(0, original ?? 0, scenario ?? 0);
          const high = Math.max(0, original ?? 0, scenario ?? 0);
          const span = high - low || 1;
          const zero = 20 + (-low / span) * 360;
          const bar = (value: number) => ({
            x: Math.min(zero, 20 + ((value - low) / span) * 360),
            width: Math.abs(value / span) * 360,
          });
          return (
            <div key={index} style={{ marginTop: 16 }}>
              <strong>{output.label}</strong>
              <div>
                Baseline: {format(original, output.unit)} · Scenario:{' '}
                {format(scenario, output.unit)}
              </div>
              <svg
                viewBox="0 0 400 64"
                role="img"
                aria-label={`${output.label}: baseline ${format(
                  original,
                  output.unit,
                )}, scenario ${format(scenario, output.unit)}`}
                style={{ width: '100%', height: 64 }}
              >
                <line
                  x1={zero}
                  x2={zero}
                  y1="0"
                  y2="64"
                  stroke="currentColor"
                  opacity="0.4"
                />
                {original !== null && (
                  <rect
                    {...bar(original)}
                    y="6"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                  />
                )}
                {scenario !== null && (
                  <rect
                    {...bar(scenario)}
                    y="36"
                    height="20"
                    fill="var(--primary)"
                  />
                )}
              </svg>
              <small>
                Change:{' '}
                {format(
                  original !== null && scenario !== null
                    ? scenario - original
                    : null,
                  output.unit,
                )}
              </small>
            </div>
          );
        })}
      </div>
    </section>
  );
};
