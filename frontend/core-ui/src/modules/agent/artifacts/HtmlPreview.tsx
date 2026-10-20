import { useAgentReferenceRegistry } from '../references/AgentReferenceScope';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { buildSandboxedSrcDoc } from './htmlSandbox';
import { applyHtmlThemePolicy, HTML_THEME_DEFAULTS } from './htmlTheme';
import {
  mountHtmlReferences,
  type IHtmlReferenceMount,
} from './htmlReferences';
import { AgentReferenceChip } from '../components/AgentReferenceChip';
import { WhatIfChart } from './WhatIfChart';
import { parseWhatIfChart, type WhatIfChartSpec } from './whatIfChartModel';

const EMPTY_FRAME = buildSandboxedSrcDoc('');

export const HtmlPreview = ({
  html,
  title = 'HTML artifact preview',
  references = false,
}: {
  html: string;
  title?: string;
  references?: boolean;
}) => {
  const registry = useAgentReferenceRegistry();
  const frame = useRef<HTMLIFrameElement>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const refresh = useRef<(() => void) | null>(null);
  const latest = useRef({ html, references, registry });
  latest.current = { html, references, registry };
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [height, setHeight] = useState(48);
  const [mounts, setMounts] = useState<IHtmlReferenceMount[]>([]);
  const [charts, setCharts] = useState<
    { element: Element; spec: WhatIfChartSpec }[]
  >([]);

  useEffect(() => {
    // Update the existing document at most every 120ms while streaming,
    // avoiding frame reloads and preserving the transcript's scroll position.
    if (!timer.current)
      timer.current = setTimeout(() => {
        timer.current = null;
        refresh.current?.();
      }, 120);
  }, [html, references, registry]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      cleanup.current?.();
    },
    [],
  );

  const onLoad = () => {
    cleanup.current?.();
    const element = frame.current;
    const document = element?.contentDocument;
    if (!element || !document?.body) return;

    const syncTheme = () => {
      const parentStyle = window.getComputedStyle(element);
      for (const [name, fallback] of Object.entries(HTML_THEME_DEFAULTS)) {
        const value =
          parentStyle.getPropertyValue(`--${name}`).trim() ||
          (name === 'foreground' ? parentStyle.color : '') ||
          fallback;
        document.documentElement.style.setProperty(
          `--${name}`,
          typeof CSS === 'undefined' || CSS.supports('color', value)
            ? value
            : `hsl(${value})`,
          'important',
        );
      }
      document.documentElement.style.colorScheme = window.getComputedStyle(
        window.document.documentElement,
      ).colorScheme;
    };
    const measure = () =>
      setHeight(
        Math.max(24, Math.ceil(document.body.getBoundingClientRect().height)),
      );
    refresh.current = () => {
      const parsed = new DOMParser().parseFromString(
        buildSandboxedSrcDoc(latest.current.html),
        'text/html',
      );
      document.head.innerHTML = parsed.head.innerHTML;
      // Workspace destinations can only come from verified reference metadata.
      for (const anchor of Array.from(
        parsed.body.querySelectorAll('a[href]'),
      )) {
        const href = anchor.getAttribute('href');
        let allowed = false;
        try {
          const url = new URL(href ?? '', window.location.origin);
          allowed =
            url.protocol === 'mailto:' ||
            ((url.protocol === 'https:' || url.protocol === 'http:') &&
              url.origin !== window.location.origin);
        } catch {
          /* Unknown destinations remain plain text. */
        }
        if (!allowed) anchor.replaceWith(...Array.from(anchor.childNodes));
      }
      document.body.innerHTML = parsed.body.innerHTML;
      const chartMounts: { element: Element; spec: WhatIfChartSpec }[] = [];
      for (const element of Array.from(
        document.body.querySelectorAll('div[data-agent-chart]'),
      )) {
        const spec = parseWhatIfChart(
          element.getAttribute('data-agent-chart') ?? '',
        );
        element.removeAttribute('data-agent-chart');
        if (spec && chartMounts.length < 4) {
          element.replaceChildren();
          chartMounts.push({ element, spec });
        } else {
          const error = document.createElement('p');
          error.textContent =
            'Interactive chart unavailable: invalid or unsupported formula.';
          element.replaceChildren(error);
        }
      }
      setCharts(chartMounts);
      // Full documents may style the root/body as well as their content.
      for (const [target, source] of [
        [document.documentElement, parsed.documentElement],
        [document.body, parsed.body],
      ]) {
        for (const attribute of ['style', 'class', 'id', 'dir', 'lang']) {
          const value = source.getAttribute(attribute);
          if (value === null) target.removeAttribute(attribute);
          else target.setAttribute(attribute, value);
        }
      }
      applyHtmlThemePolicy(document);
      syncTheme();
      setMounts(
        latest.current.references
          ? mountHtmlReferences(document, latest.current.registry)
          : [],
      );
      measure();
    };
    refresh.current();
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(measure);
    observer?.observe(document.body);
    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(window.document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    document.addEventListener('load', measure, true);
    window.addEventListener('resize', measure);

    const onClick = (event: MouseEvent) => {
      // Never let model-provided links replace the frame or navigate the app.
      const target = event.target;
      const anchor =
        target && 'nodeType' in target && (target as Node).nodeType === 1
          ? (target as Element).closest('a')
          : null;
      if (!anchor) return;
      event.preventDefault();
      const href = anchor.getAttribute('href');
      if (
        href &&
        /^(https?:|mailto:)/i.test(href) &&
        new URL(href, window.location.origin).origin !== window.location.origin
      ) {
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    };
    document.addEventListener('click', onClick);
    cleanup.current = () => {
      refresh.current = null;
      observer?.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('load', measure, true);
      document.removeEventListener('click', onClick);
      window.removeEventListener('resize', measure);
    };
  };

  return (
    <>
      <iframe
        ref={frame}
        title={title}
        // Same-origin permits trusted parent sizing and reference portals. Model
        // scripts remain disabled by both the sandbox and the enforced CSP.
        sandbox="allow-same-origin"
        srcDoc={EMPTY_FRAME}
        onLoad={onLoad}
        referrerPolicy="no-referrer"
        style={{ height }}
        className="block w-full border-0 bg-transparent text-foreground"
      />
      {mounts.map(({ element, reference }, index) =>
        createPortal(
          <AgentReferenceChip reference={reference} embedded />,
          element,
          String(index),
        ),
      )}
      {charts.map(({ element, spec }, index) =>
        createPortal(<WhatIfChart spec={spec} />, element, `chart-${index}`),
      )}
    </>
  );
};
