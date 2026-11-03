/** Selection data contains visible content only; DOM markup never leaves the page. */
export interface ISelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IPageSelection {
  title: string;
  path: string;
  frame?: string;
  text: string;
  width: number;
  height: number;
  image: Blob;
}

export const SELECTION_EXCLUDED =
  '[data-agent-selection-ui], [data-agent-selection-ignore], [data-private], [data-sensitive], input[type="password"], input[type="hidden"], [hidden], [aria-hidden="true"], script, style, noscript';
export const SELECTION_TEXT_LIMIT = 8_000;

export const selectionParent = (node: Element): Element | null => {
  const root = node.getRootNode();
  return (
    node.parentElement ??
    (root.nodeType === 11 && 'host' in root ? (root as ShadowRoot).host : null)
  );
};
const hasVisibleStyles = (element: Element): boolean => {
  let node: Element | null = element;
  const view = element.ownerDocument.defaultView;
  while (node) {
    if (node.matches(SELECTION_EXCLUDED)) return false;
    const style = view?.getComputedStyle(node);
    if (
      style?.display === 'none' ||
      style?.visibility === 'hidden' ||
      style?.opacity === '0'
    )
      return false;
    node = selectionParent(node);
  }
  return true;
};

// Cross-realm DOM nodes need their own document's constructors (HTML previews
// are same-origin, script-disabled frames).
export const isSelectableElement = (node: Element): node is HTMLElement => {
  const view = node.ownerDocument.defaultView;
  if (!view || !(node instanceof view.HTMLElement)) return false;
  if (node.closest(SELECTION_EXCLUDED)) return false;
  if (node === node.ownerDocument.documentElement) return false;
  if (node === document.body) return false;
  const rect = node.getBoundingClientRect();
  return hasVisibleStyles(node) && rect.width > 0 && rect.height > 0;
};

const intersect = (a: ISelectionRect, b: ISelectionRect): ISelectionRect => {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  return {
    x,
    y,
    width: Math.max(0, Math.min(a.x + a.width, b.x + b.width) - x),
    height: Math.max(0, Math.min(a.y + a.height, b.y + b.height) - y),
  };
};
const rectOf = (rect: DOMRect): ISelectionRect => ({
  x: rect.left,
  y: rect.top,
  width: rect.width,
  height: rect.height,
});

/** Clip against scrolling ancestors and each containing frame's viewport. */
export const selectionGeometry = (
  element: HTMLElement,
): {
  local: ISelectionRect;
  screen: ISelectionRect;
} => {
  const doc = element.ownerDocument;
  const view = doc.defaultView;
  if (!view) throw new Error('This element is no longer available.');
  let local = intersect(rectOf(element.getBoundingClientRect()), {
    x: 0,
    y: 0,
    width: view.innerWidth,
    height: view.innerHeight,
  });
  let screen = local;
  let node: Element | null = element;
  let currentView: Window = view;
  let inSource = true;
  while (node) {
    const parent: Element | null = selectionParent(node);
    if (parent) {
      const style = currentView.getComputedStyle(parent);
      const clipX = /auto|scroll|hidden|clip/.test(style.overflowX);
      const clipY = /auto|scroll|hidden|clip/.test(style.overflowY);
      if (clipX || clipY) {
        const rect = parent.getBoundingClientRect();
        screen = intersect(screen, {
          x: clipX ? rect.left + parent.clientLeft : screen.x,
          y: clipY ? rect.top + parent.clientTop : screen.y,
          width: clipX ? parent.clientWidth : screen.width,
          height: clipY ? parent.clientHeight : screen.height,
        });
        if (inSource) local = screen;
      }
      node = parent;
      continue;
    }
    const frame = currentView.frameElement;
    if (!frame) break;
    const frameRect = frame.getBoundingClientRect();
    screen = {
      ...screen,
      x: screen.x + frameRect.left + frame.clientLeft,
      y: screen.y + frameRect.top + frame.clientTop,
    };
    screen = intersect(screen, {
      x: frameRect.left + frame.clientLeft,
      y: frameRect.top + frame.clientTop,
      width: frame.clientWidth,
      height: frame.clientHeight,
    });
    inSource = false;
    currentView = frame.ownerDocument.defaultView ?? window;
    screen = intersect(screen, {
      x: 0,
      y: 0,
      width: currentView.innerWidth,
      height: currentView.innerHeight,
    });
    node = frame;
  }
  // Convert clipping applied outside the source document back to local space.
  let frameOffsetX = 0;
  let frameOffsetY = 0;
  let sourceView: Window | null = view;
  while (sourceView?.frameElement) {
    const frame: Element = sourceView.frameElement;
    const rect = frame.getBoundingClientRect();
    frameOffsetX += rect.left + frame.clientLeft;
    frameOffsetY += rect.top + frame.clientTop;
    sourceView = frame.ownerDocument.defaultView;
  }
  local = {
    x: screen.x - frameOffsetX,
    y: screen.y - frameOffsetY,
    width: screen.width,
    height: screen.height,
  };
  return { local, screen };
};

export const selectionTitle = (element: HTMLElement): string => {
  const label =
    element.getAttribute('aria-label') ||
    element.getAttribute('alt') ||
    element.getAttribute('title') ||
    element.innerText?.trim().split('\n').find(Boolean) ||
    element.tagName.toLowerCase();
  return label.replace(/\s+/g, ' ').slice(0, 80);
};

/** Read intersecting text nodes, never hidden siblings, attributes, or inputs. */
export const selectionVisibleText = (
  element: HTMLElement,
  clip: ISelectionRect,
): string => {
  const doc = element.ownerDocument;
  const walker = doc.createTreeWalker(element, 4 /* SHOW_TEXT */);
  const chunks: string[] = [];
  let length = 0;
  let previousParent: Element | null = null;
  let node = walker.nextNode();
  while (node && length < SELECTION_TEXT_LIMIT) {
    const parent = node.parentElement;
    const text = node.textContent?.trim();
    if (
      parent &&
      text &&
      !parent.closest(`${SELECTION_EXCLUDED}, input, textarea, select`)
    ) {
      if (hasVisibleStyles(parent)) {
        const range = doc.createRange();
        range.selectNodeContents(node);
        const rectangles = Array.from(range.getClientRects());
        // Partially clipped text nodes may contain many offscreen lines. The
        // snapshot remains authoritative; don't send the unseen suffix as text.
        const visible =
          rectangles.length > 0 &&
          rectangles.every(
            (rect) =>
              rect.left >= clip.x - 1 &&
              rect.top >= clip.y - 1 &&
              rect.right <= clip.x + clip.width + 1 &&
              rect.bottom <= clip.y + clip.height + 1,
          );
        if (visible) {
          if (parent === previousParent)
            chunks[chunks.length - 1] += ` ${text}`;
          else chunks.push(text);
          previousParent = parent;
          length += text.length;
        }
      }
    }
    node = walker.nextNode();
  }
  return chunks.join('\n').slice(0, SELECTION_TEXT_LIMIT);
};

export const capturePageSelection = async (
  element: HTMLElement,
): Promise<IPageSelection> => {
  if (!element.isConnected || !isSelectableElement(element))
    throw new Error('This element is no longer available. Select it again.');
  if (element.querySelector('iframe') || element.tagName === 'IFRAME')
    throw new Error(
      'Select content inside the frame instead of the whole embedded page.',
    );
  const { local } = selectionGeometry(element);
  if (local.width < 1 || local.height < 1)
    throw new Error('Scroll the element into view and select it again.');
  const rect = element.getBoundingClientRect();
  const text = selectionVisibleText(element, local);
  const title =
    text.split('\n').find(Boolean)?.slice(0, 80) ||
    element.getAttribute('aria-label')?.slice(0, 80) ||
    element.tagName.toLowerCase();
  const path = location.pathname;
  const view = element.ownerDocument.defaultView;
  const frame = view?.frameElement;
  const frameTitle = frame?.getAttribute('title') || undefined;
  const { domToCanvas } = await import('modern-screenshot');
  const scale = Math.min(1, 2400 / Math.max(rect.width, rect.height));
  const style = view?.getComputedStyle(element);
  let background = style?.backgroundColor;
  let parent: Element | null = element.parentElement;
  while (
    (!background ||
      background === 'rgba(0, 0, 0, 0)' ||
      background === 'transparent') &&
    parent
  ) {
    background = view?.getComputedStyle(parent).backgroundColor;
    parent = parent.parentElement;
  }
  if (
    !background ||
    background === 'rgba(0, 0, 0, 0)' ||
    background === 'transparent'
  )
    background = getComputedStyle(document.body).backgroundColor;
  const canvas = await domToCanvas(element, {
    scale,
    maximumCanvasSize: 2400,
    timeout: 10_000,
    features: { restoreScrollPosition: true },
    backgroundColor: background,
    // Keep the existing layout and computed styles; don't reflow to the crop.
    style: {
      margin: '0',
      position: 'relative',
      left: '0',
      top: '0',
      right: 'auto',
      bottom: 'auto',
      scrollbarWidth: 'none',
      transform: 'none',
      animation: 'none',
      transition: 'none',
    },
    filter: (node) =>
      node.nodeType !== 1 || !(node as Element).matches(SELECTION_EXCLUDED),
  });
  const output = document.createElement('canvas');
  const outputScale = Math.min(
    scale,
    1600 / Math.max(local.width, local.height),
  );
  output.width = Math.max(1, Math.round(local.width * outputScale));
  output.height = Math.max(1, Math.round(local.height * outputScale));
  const context = output.getContext('2d');
  if (!context) throw new Error('Your browser could not capture this element.');
  context.drawImage(
    canvas,
    ((local.x - rect.left) / rect.width) * canvas.width,
    ((local.y - rect.top) / rect.height) * canvas.height,
    (local.width / rect.width) * canvas.width,
    (local.height / rect.height) * canvas.height,
    0,
    0,
    output.width,
    output.height,
  );
  const image = await new Promise<Blob>((resolve, reject) => {
    output.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error('Could not create the snapshot.')),
      'image/png',
    );
  });
  if (image.size > 2 * 1024 * 1024)
    throw new Error(
      'This selection is too detailed. Select a smaller element.',
    );
  return {
    title,
    path,
    frame: frameTitle,
    text,
    width: Math.round(local.width),
    height: Math.round(local.height),
    image,
  };
};
