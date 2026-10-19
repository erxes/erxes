import {
  isSelectableElement,
  selectionVisibleText,
  SELECTION_EXCLUDED,
} from '../utils/pageSelection';
import type { IPageElementCatalog } from './pageFocusContract';

interface IPageSnapshot {
  catalog: IPageElementCatalog;
  pageKey: string;
  targets: Map<
    string,
    { element: HTMLElement; label: string; context: string }
  >;
}
const snapshots = new Map<string, IPageSnapshot>();
const currentPageKey = () => {
  const query = new URLSearchParams(location.search);
  query.delete('panel');
  return `${location.pathname}?${query.toString()}`;
};
const candidates =
  'button, a[href], input, select, textarea, label, summary, h1, h2, h3, h4, h5, h6, p, li, th, td, caption, strong, span, div, img, [role], [aria-label], [data-agent-focus], svg';
const excluded = `${SELECTION_EXCLUDED}, [contenteditable="true"], .driver-overlay, .driver-popover, [data-side-panel-resize-shield]`;
const clean = (value: string, max = 120) =>
  value.replace(/\s+/g, ' ').trim().slice(0, max);
const safeText = (element: HTMLElement): string => {
  const rect = element.getBoundingClientRect();
  return clean(
    selectionVisibleText(element, {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    }),
  );
};
const labelFor = (element: HTMLElement) => {
  const label =
    element.getAttribute('aria-label') ||
    element.getAttribute('alt') ||
    element.getAttribute('title');
  if (label) return clean(label);
  const labelledBy = element
    .getAttribute('aria-labelledby')
    ?.split(/\s+/)
    .map((id) => element.ownerDocument.getElementById(id))
    .filter(
      (node): node is HTMLElement => node !== null && isSelectableElement(node),
    )
    .map(safeText)
    .join(' ');
  if (labelledBy) return clean(labelledBy);
  const control = element as HTMLInputElement;
  if (element.matches('input, select, textarea')) {
    return clean(
      Array.from(control.labels ?? [])
        .filter(isSelectableElement)
        .map(safeText)
        .join(' ') ||
        element.getAttribute('placeholder') ||
        '',
    );
  }
  return safeText(element);
};

const contextFor = (element: HTMLElement): string => {
  const row = element.closest('tr, [role="row"]');
  if (row && isSelectableElement(row)) return safeText(row);
  const section = element.closest(
    'section, article, nav, header, form, [role="dialog"], aside',
  );
  const heading = section?.querySelector('h1,h2,h3,[role="heading"]');
  return heading && isSelectableElement(heading) ? safeText(heading) : '';
};

/** Bounded, semantic metadata only. Raw DOM, selectors, input values and pixels
 * are never attached. Same-origin report frames retain exact local references. */
export const capturePageElements = (): IPageElementCatalog => {
  const catalog: IPageElementCatalog = {
    snapshotId: crypto.randomUUID(),
    path: location.pathname.slice(0, 200),
    elements: [],
  };
  const targets: IPageSnapshot['targets'] = new Map();
  const documents = new Set<Document>();
  const seen = new Set<Element>();
  let scanned = 0;
  const visit = (root: Document | ShadowRoot, frame?: string, depth = 0) => {
    if (depth > 5 || catalog.elements.length >= 240 || scanned >= 5000) return;
    if (root.nodeType === 9) {
      if (documents.has(root as Document)) return;
      documents.add(root as Document);
    }
    for (const element of Array.from(root.querySelectorAll('*'))) {
      if (++scanned > 5000 || catalog.elements.length >= 240) break;
      if (
        element.matches('div, span') &&
        !element.shadowRoot &&
        !element.matches(
          '[aria-label], [aria-labelledby], [role], [data-agent-focus]',
        ) &&
        !Array.from(element.childNodes).some(
          (node) => node.nodeType === 3 && node.textContent?.trim(),
        )
      )
        continue;
      if (!isSelectableElement(element) || element.closest(excluded)) continue;
      if (element.shadowRoot) visit(element.shadowRoot, frame, depth + 1);
      if (element.tagName === 'IFRAME') {
        try {
          const doc = (element as HTMLIFrameElement).contentDocument;
          if (doc)
            visit(
              doc,
              clean(element.getAttribute('title') || 'Embedded content', 80),
              depth + 1,
            );
        } catch {
          /* Cross-origin content cannot supply target references. */
        }
        continue;
      }
      if (!element.matches(candidates) || seen.has(element)) continue;
      const label = labelFor(element);
      if (!label) continue;
      seen.add(element);
      const id = `element-${catalog.elements.length + 1}`;
      const context = contextFor(element);
      catalog.elements.push({
        id,
        label,
        role: clean(
          element.getAttribute('role') || element.tagName.toLowerCase(),
          40,
        ),
        context,
        ...(frame ? { frame } : {}),
      });
      targets.set(id, { element, label, context });
    }
  };
  visit(document);
  snapshots.set(catalog.snapshotId, {
    catalog,
    targets,
    pageKey: currentPageKey(),
  });
  // Multiple recent threads can finish concurrently without retaining old DOM indefinitely.
  while (snapshots.size > 5) {
    const oldest = snapshots.keys().next().value;
    if (oldest === undefined) break;
    snapshots.delete(oldest);
  }
  return catalog;
};

export const resolvePageElement = (
  snapshotId: string,
  targetId: string,
  path: string,
): HTMLElement | undefined => {
  const snapshot = snapshots.get(snapshotId);
  const target = snapshot?.targets.get(targetId);
  if (
    !snapshot ||
    !target ||
    snapshot.catalog.path !== path ||
    snapshot.pageKey !== currentPageKey() ||
    location.pathname !== path ||
    !target.element.isConnected ||
    !isSelectableElement(target.element)
  )
    return undefined;
  // A virtualized row can reuse its DOM node for another record. Never retarget it.
  if (
    labelFor(target.element) !== target.label ||
    contextFor(target.element) !== target.context
  )
    return undefined;
  return target.element;
};
