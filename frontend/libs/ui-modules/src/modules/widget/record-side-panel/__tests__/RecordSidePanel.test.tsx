/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { RecordSidePanel } from '../RecordSidePanel';

jest.mock('erxes-ui', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const primitives = jest.requireActual<typeof import('radix-ui')>('radix-ui');
  return {
    cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
    Button: ReactModule.forwardRef<
      HTMLButtonElement,
      React.ComponentProps<'button'>
    >(({ children, ...props }, ref) => (
      <button ref={ref} {...props}>
        {children}
      </button>
    )),
    Tabs: Object.assign(primitives.Tabs.Root, primitives.Tabs),
    DropdownMenu: Object.assign(
      primitives.DropdownMenu.Root,
      primitives.DropdownMenu,
    ),
  };
});
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

const Panel = ({ maxWidth }: { maxWidth?: number }) => {
  const [width, setWidth] = useState(400);
  return (
    <RecordSidePanel width={width} maxWidth={maxWidth} onWidthChange={setWidth}>
      Chat
    </RecordSidePanel>
  );
};

it('collapses a page-owned portal header using its controlled expansion state', () => {
  const toggle = jest.fn();
  render(<RecordSidePanel.Header title="Editor" expanded onExpand={toggle} />);
  fireEvent.click(screen.getByRole('button', { name: 'Collapse record' }));
  expect(toggle).toHaveBeenCalledTimes(1);
});

it('expands only the active entry when earlier headers are retained', () => {
  const hidden = jest.fn();
  const active = jest.fn();
  render(
    <RecordSidePanel>
      <div hidden>
        <RecordSidePanel.Header title="Earlier" onExpand={hidden} />
      </div>
      <RecordSidePanel.Header title="Current" onExpand={active} />
    </RecordSidePanel>,
  );
  fireEvent.keyDown(document, { key: 'Enter', ctrlKey: true, shiftKey: true });
  expect(active).toHaveBeenCalledTimes(1);
  expect(hidden).not.toHaveBeenCalled();
});

it('splits the overview in an expanded portal layout without a host context', () => {
  const { IconId } = jest.requireActual<typeof import('@tabler/icons-react')>(
    '@tabler/icons-react',
  );
  render(
    <RecordSidePanel.Layout
      expanded
      value="detail"
      onValueChange={jest.fn()}
      tabs={[
        {
          value: 'detail',
          label: 'Details',
          icon: IconId,
          content: <input aria-label="Draft overview" defaultValue="Keep" />,
        },
        {
          value: 'activity',
          label: 'Activity',
          icon: IconId,
          content: <p>Recent events</p>,
        },
      ]}
    />,
  );
  expect(screen.queryByRole('tab', { name: 'Details' })).toBeNull();
  expect(
    screen.getByRole('tab', { name: 'Activity' }).getAttribute('aria-selected'),
  ).toBe('true');
  expect(screen.getByLabelText('Draft overview')).toBeTruthy();
  expect(screen.getByText('Recent events')).toBeTruthy();
});

let frames: Map<number, FrameRequestCallback>;
let nextFrame = 0;
beforeEach(() => {
  frames = new Map();
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    const id = ++nextFrame;
    frames.set(id, callback);
    return id;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id);
  });
});
afterEach(() => jest.restoreAllMocks());
const paint = () =>
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(0));
  });
const pointer = (
  target: Element | Document,
  type: string,
  clientX = 0,
  options: { pointerId?: number; buttons?: number; button?: number } = {},
) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    clientX,
    button: options.button ?? 0,
    buttons: options.buttons ?? (type === 'pointerup' ? 0 : 1),
  });
  Object.defineProperty(event, 'pointerId', { value: options.pointerId ?? 1 });
  fireEvent(target, event);
};

it('drags beyond the record limit when configured and clamps both width limits', () => {
  render(<Panel maxWidth={1200} />);
  const grip = screen.getByRole('separator', { name: 'Resize side panel' });
  const panel = screen.getByText('Chat');
  pointer(grip, 'pointerdown', 1000);
  pointer(document, 'pointermove', 400);
  paint();
  expect(panel.style.width).toBe('1000px');
  pointer(document, 'pointermove', 0);
  paint();
  expect(panel.style.width).toBe('1200px');
  pointer(document, 'pointermove', 2000);
  paint();
  expect(panel.style.width).toBe('320px');
  pointer(document, 'pointerup');
  expect(document.body.style.cursor).toBe('');
  pointer(document, 'pointermove', 0);
  paint();
  expect(panel.style.width).toBe('320px');
});

it('keeps the default record limit and supports keyboard resizing', () => {
  render(<Panel />);
  const grip = screen.getByRole('separator');
  fireEvent.keyDown(grip, { key: 'ArrowLeft' });
  expect(grip.getAttribute('aria-valuenow')).toBe('416');
  fireEvent.keyDown(grip, { key: 'ArrowRight', shiftKey: true });
  expect(grip.getAttribute('aria-valuenow')).toBe('352');
  fireEvent.keyDown(grip, { key: 'End' });
  expect(grip.getAttribute('aria-valuenow')).toBe('600');
  pointer(grip, 'pointerdown', 800);
  pointer(document, 'pointermove', 0);
  paint();
  expect(screen.getByText('Chat').style.width).toBe('600px');
  pointer(document, 'pointerup');
  fireEvent.keyDown(grip, { key: 'Home' });
  expect(grip.getAttribute('aria-valuenow')).toBe('320');
});

it('restores the cursor and removes drag listeners on cancellation and unmount', () => {
  const { unmount } = render(<Panel maxWidth={1200} />);
  const grip = screen.getByRole('separator');
  pointer(grip, 'pointerdown', 800);
  expect(document.body.style.cursor).toBe('col-resize');
  pointer(document, 'pointercancel');
  expect(document.body.style.cursor).toBe('');
  pointer(document, 'pointermove', 0);
  paint();
  expect(screen.getByText('Chat').style.width).toBe('400px');
  pointer(grip, 'pointerdown', 800);
  unmount();
  expect(document.body.style.cursor).toBe('');
  expect(document.body.style.userSelect).toBe('');
});

it('captures the initiating pointer, batches paints and persists only the final width', () => {
  const onWidthChange = jest.fn();
  render(
    <RecordSidePanel width={400} maxWidth={1200} onWidthChange={onWidthChange}>
      Chat
    </RecordSidePanel>,
  );
  const grip = screen.getByRole('separator');
  const capture = jest.fn();
  const release = jest.fn();
  grip.setPointerCapture = capture;
  grip.hasPointerCapture = () => true;
  grip.releasePointerCapture = release;
  pointer(grip, 'pointerdown', 1000);
  expect(capture).toHaveBeenCalledWith(1);
  expect(
    document.querySelector('[data-side-panel-resize-shield]'),
  ).not.toBeNull();
  pointer(document, 'pointermove', 800, { pointerId: 2 });
  pointer(document, 'pointerup', 800, { pointerId: 2 });
  paint();
  expect(screen.getByText('Chat').style.width).toBe('400px');
  pointer(document, 'pointermove', 900);
  pointer(document, 'pointermove', 800);
  expect(frames.size).toBe(1);
  expect(onWidthChange).not.toHaveBeenCalled();
  paint();
  expect(screen.getByText('Chat').style.width).toBe('600px');
  pointer(document, 'pointermove', 700);
  pointer(document, 'pointerup', 700);
  expect(onWidthChange.mock.calls).toEqual([[700]]);
  expect(release).toHaveBeenCalledWith(1);
  expect(frames.size).toBe(0);
  expect(document.querySelector('[data-side-panel-resize-shield]')).toBeNull();
});

it.each([
  'missing button',
  'lost capture',
  'blur',
  'Escape',
  'hidden document',
])('ends a drag on %s and never resumes on hover', (reason) => {
  render(<Panel maxWidth={1200} />);
  const grip = screen.getByRole('separator');
  pointer(grip, 'pointerdown', 1000);
  pointer(document, 'pointermove', 800);
  // Cleanup must flush this pending final width before removing the drag.
  if (reason === 'missing button')
    pointer(document, 'pointermove', 0, { buttons: 0 });
  if (reason === 'lost capture') pointer(grip, 'lostpointercapture');
  if (reason === 'blur') fireEvent(window, new Event('blur'));
  if (reason === 'Escape') fireEvent.keyDown(document, { key: 'Escape' });
  if (reason === 'hidden document') {
    const visibility = jest
      .spyOn(document, 'visibilityState', 'get')
      .mockReturnValue('hidden');
    fireEvent(document, new Event('visibilitychange'));
    visibility.mockRestore();
  }
  expect(document.body.style.cursor).toBe('');
  expect(document.querySelector('[data-side-panel-resize-shield]')).toBeNull();
  pointer(document, 'pointermove', 0);
  paint();
  expect(screen.getByText('Chat').style.width).toBe('600px');
});

it('does not start on right click or resize just by hovering', () => {
  render(<Panel />);
  const grip = screen.getByRole('separator');
  pointer(document, 'pointermove', 100);
  pointer(grip, 'pointerdown', 800, { button: 2, buttons: 2 });
  pointer(document, 'pointermove', 100);
  paint();
  expect(screen.getByText('Chat').style.width).toBe('400px');
  expect(document.querySelector('[data-side-panel-resize-shield]')).toBeNull();
});

it('expands and collapses in place while preserving the draft and resized width', () => {
  render(
    <RecordSidePanel width={480} onWidthChange={jest.fn()}>
      <RecordSidePanel.Header title="Task" onClose={jest.fn()} />
      <input aria-label="Draft" defaultValue="Keep my edits" />
    </RecordSidePanel>,
  );
  const panel = screen.getByRole('complementary');
  const draft = screen.getByRole('textbox');
  fireEvent.change(draft, { target: { value: 'Unsaved edit' } });
  fireEvent.click(screen.getByRole('button', { name: 'Expand record' }));
  expect(panel.style.width).toBe('100%');
  expect(panel.getAttribute('data-expanded')).toBe('true');
  expect(screen.queryByRole('separator')).toBeNull();
  expect(screen.getByRole('textbox')).toBe(draft);
  fireEvent.click(screen.getByRole('button', { name: 'Collapse record' }));
  expect(panel.style.width).toBe('480px');
  expect(panel.hasAttribute('data-expanded')).toBe(false);
  expect(screen.getByRole('separator').getAttribute('aria-valuenow')).toBe(
    '480',
  );
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe(
    'Unsaved edit',
  );
});

it('keeps an explicitly supplied expand handler', () => {
  const expand = jest.fn();
  render(
    <RecordSidePanel width={400}>
      <RecordSidePanel.Header
        title="Task"
        onExpand={expand}
        onClose={jest.fn()}
      />
    </RecordSidePanel>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Expand record' }));
  expect(expand).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('complementary').style.width).toBe('400px');
});

it.each([{ ctrlKey: true }, { metaKey: true }])(
  'toggles with the exact fullscreen shortcut and preserves other Enter shortcuts (%o)',
  (modifier) => {
    render(
      <RecordSidePanel width={480}>
        <RecordSidePanel.Header title="Task" onClose={jest.fn()} />
        <input aria-label="Draft" />
        <div contentEditable aria-label="Description" />
      </RecordSidePanel>,
    );
    const panel = screen.getByRole('complementary');
    const shortcut = { key: 'Enter', shiftKey: true, ...modifier };
    fireEvent.keyDown(document, { key: 'Enter', ...modifier });
    fireEvent.keyDown(document, { ...shortcut, altKey: true });
    fireEvent.keyDown(document, { ...shortcut, repeat: true });
    fireEvent.keyDown(document, { ...shortcut, isComposing: true });
    fireEvent.keyDown(screen.getByRole('textbox'), shortcut);
    fireEvent.keyDown(screen.getByLabelText('Description'), shortcut);
    expect(panel.hasAttribute('data-expanded')).toBe(false);
    fireEvent.keyDown(document, shortcut);
    expect(panel.getAttribute('data-expanded')).toBe('true');
    fireEvent.keyDown(document, shortcut);
    expect(panel.style.width).toBe('480px');
  },
);

it('does not toggle through an open menu or a previously handled shortcut', () => {
  render(
    <RecordSidePanel>
      <RecordSidePanel.Header title="Task" onClose={jest.fn()} />
      <div role="menu" data-state="open" />
    </RecordSidePanel>,
  );
  const shortcut = { key: 'Enter', ctrlKey: true, shiftKey: true };
  fireEvent.keyDown(document, shortcut);
  expect(screen.getByRole('complementary').hasAttribute('data-expanded')).toBe(
    false,
  );
  screen.getByRole('menu').remove();
  const handled = new KeyboardEvent('keydown', {
    ...shortcut,
    cancelable: true,
  });
  handled.preventDefault();
  fireEvent(document, handled);
  expect(screen.getByRole('complementary').hasAttribute('data-expanded')).toBe(
    false,
  );
});

it('exposes every tab vertically in fullscreen and keeps the active editor mounted', () => {
  const { IconId } = jest.requireActual<typeof import('@tabler/icons-react')>(
    '@tabler/icons-react',
  );
  const TabbedPanel = () => {
    const [value, setValue] = useState('detail');
    return (
      <RecordSidePanel>
        <RecordSidePanel.Header title="Task" onClose={jest.fn()} />
        <RecordSidePanel.Tabs
          value={value}
          onValueChange={setValue}
          visibleCount={2}
          tabs={['detail', 'properties', 'activity', 'files'].map((tab) => ({
            value: tab,
            label: tab,
            icon: IconId,
            content:
              tab === 'detail' ? (
                <input aria-label="Draft" defaultValue="Unsaved" />
              ) : (
                tab
              ),
          }))}
        />
      </RecordSidePanel>
    );
  };
  render(<TabbedPanel />);
  const draft = screen.getByRole('textbox');
  fireEvent.click(screen.getByRole('button', { name: 'Expand record' }));
  expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe(
    'vertical',
  );
  expect(screen.getAllByRole('tab')).toHaveLength(4);
  expect(screen.getByRole('textbox')).toBe(draft);
  fireEvent.click(screen.getByRole('button', { name: 'Collapse record' }));
  expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe(
    'horizontal',
  );
  expect(screen.getByRole('textbox')).toBe(draft);
});

it('slides in only when opening as a panel, not as a page', () => {
  const { unmount } = render(<RecordSidePanel>Panel</RecordSidePanel>);
  expect(screen.getByRole('complementary').className).toContain(
    'slide-in-from-right-8',
  );
  unmount();

  render(
    <RecordSidePanel expanded expandedMode="page">
      Page
    </RecordSidePanel>,
  );
  expect(screen.getByRole('complementary').className).not.toContain(
    'slide-in-from-right-8',
  );
});

it('draws no expand button when the panel cannot expand', () => {
  render(
    <RecordSidePanel expandable={false}>
      <RecordSidePanel.Header title="Task" onClose={jest.fn()} />
    </RecordSidePanel>,
  );

  expect(screen.queryByRole('button', { name: 'Expand record' })).toBeNull();
});

it('draws no collapse or close button on a record page', () => {
  render(
    <RecordSidePanel expanded expandedMode="page" expandable={false}>
      <RecordSidePanel.Header title="Task" />
    </RecordSidePanel>,
  );

  expect(screen.queryByRole('button', { name: 'Collapse record' })).toBeNull();
  expect(screen.queryByTitle('Close')).toBeNull();
});

it('leads elsewhere instead of expanding when given a change handler and a fixed state', () => {
  const onExpandedChange = jest.fn();
  render(
    <RecordSidePanel expanded={false} onExpandedChange={onExpandedChange}>
      <RecordSidePanel.Header title="Task" onClose={jest.fn()} />
    </RecordSidePanel>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Expand record' }));

  expect(onExpandedChange).toHaveBeenCalledWith(true);
  expect(screen.getByRole('complementary').hasAttribute('data-expanded')).toBe(
    false,
  );
});

it('shows the overview header only when expanded, without remounting the overview', () => {
  render(
    <RecordSidePanel>
      <RecordSidePanel.Header title="Task" onClose={jest.fn()} />
      <RecordSidePanel.Tabs
        tabs={[
          {
            value: 'detail',
            label: 'Detail',
            icon: () => null,
            content: <input aria-label="Name" />,
          },
          {
            value: 'activity',
            label: 'Activity',
            icon: () => null,
            content: 'Log',
          },
        ]}
        value="detail"
        onValueChange={jest.fn()}
        overviewTab="detail"
        overviewHeader="Identity"
        expandedDefaultTab="activity"
      />
    </RecordSidePanel>,
  );
  const draft = screen.getByRole('textbox', { name: 'Name' });
  expect(screen.queryByText('Identity')).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Expand record' }));

  expect(screen.getByText('Identity')).toBeTruthy();
  expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe(
    'horizontal',
  );
  expect(screen.getByRole('textbox', { name: 'Name' })).toBe(draft);
});

it.each([false, true])(
  'respects reduced motion when toggling (%s)',
  (reducedMotion) => {
    const animate = jest.fn();
    const originalAnimate = HTMLElement.prototype.animate;
    const originalMatchMedia = window.matchMedia;
    HTMLElement.prototype.animate = animate;
    window.matchMedia = jest.fn().mockReturnValue({ matches: reducedMotion });
    try {
      render(
        <RecordSidePanel>
          <RecordSidePanel.Header title="Task" onClose={jest.fn()} />
        </RecordSidePanel>,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Expand record' }));
      expect(animate).toHaveBeenCalledTimes(reducedMotion ? 0 : 1);
      expect(
        screen.getByRole('complementary').getAttribute('data-expanded'),
      ).toBe('true');
    } finally {
      HTMLElement.prototype.animate = originalAnimate;
      window.matchMedia = originalMatchMedia;
    }
  },
);

it.each(['detail', 'overview'])(
  'uses the customer split layout for a record with a %s tab',
  (detailTab) => {
    const { IconId } = jest.requireActual<typeof import('@tabler/icons-react')>(
      '@tabler/icons-react',
    );
    render(
      <RecordSidePanel expanded expandedMode="page">
        <RecordSidePanel.Layout
          header={<RecordSidePanel.Header title="Record" onClose={jest.fn()} />}
          profile={<h2>Record profile</h2>}
          value={detailTab}
          onValueChange={jest.fn()}
          tabs={[
            {
              value: detailTab,
              label: 'Details',
              icon: IconId,
              content: (
                <input aria-label="Record field" defaultValue="Unsaved" />
              ),
            },
            {
              value: 'activity',
              label: 'Activity',
              icon: IconId,
              content: 'Record history',
            },
          ]}
        />
      </RecordSidePanel>,
    );
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe(
      'horizontal',
    );
    expect(screen.queryByRole('tab', { name: 'Details' })).toBeNull();
    expect(
      screen
        .getByRole('tab', { name: 'Activity' })
        .getAttribute('aria-selected'),
    ).toBe('true');
    expect(
      screen
        .getByRole('textbox', { name: 'Record field' })
        .closest('[role="tabpanel"]')?.className,
    ).toContain('md:row-span-2');
    expect(
      screen
        .getByText('Record profile')
        .compareDocumentPosition(screen.getByRole('tablist')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  },
);

// A record's own page: its overview column beside the tabs.
const renderRecordPage = () => {
  const { IconId } = jest.requireActual<typeof import('@tabler/icons-react')>(
    '@tabler/icons-react',
  );
  localStorage.clear();
  render(
    <RecordSidePanel.Layout
      expanded
      value="detail"
      onValueChange={jest.fn()}
      overviewTab="detail"
      tabs={[
        { value: 'detail', label: 'Details', icon: IconId, content: 'Fields' },
        {
          value: 'activity',
          label: 'Activity',
          icon: IconId,
          content: 'History',
        },
      ]}
    />,
  );
  const grip = screen.getByRole('separator', { name: 'Resize details' });
  const layout = grip.closest('[role="tabpanel"]')?.parentElement;
  return {
    grip,
    layout,
    columnWidth: () =>
      layout?.style.getPropertyValue('--record-overview-width'),
  };
};

it('resizes the overview column of a record page from its right edge', () => {
  const { grip, columnWidth } = renderRecordPage();
  expect(columnWidth()).toBe('384px');
  pointer(grip, 'pointerdown', 400);
  pointer(document, 'pointermove', 500);
  paint();
  expect(columnWidth()).toBe('484px');
  pointer(document, 'pointermove', -1000);
  paint();
  expect(columnWidth()).toBe('288px');
  pointer(document, 'pointerup');
  expect(grip.getAttribute('aria-valuenow')).toBe('288');
  fireEvent.keyDown(grip, { key: 'ArrowRight' });
  expect(grip.getAttribute('aria-valuenow')).toBe('304');
  fireEvent.keyDown(grip, { key: 'End' });
  expect(columnWidth()).toBe('640px');
  expect(localStorage.getItem('erxes:recordOverviewWidth')).toBe('640');
});

it('limits the overview column by the page width, keeping room for the tabs', () => {
  // Only observers watching the page itself hear its width.
  const observed = new Map<ResizeObserverCallback, Element[]>();
  Object.defineProperty(window, 'ResizeObserver', {
    configurable: true,
    value: class {
      private readonly targets: Element[] = [];
      constructor(callback: ResizeObserverCallback) {
        observed.set(callback, this.targets);
      }
      observe(target: Element) {
        this.targets.push(target);
      }
      unobserve = jest.fn();
      disconnect = jest.fn();
    },
  });
  try {
    const { grip, layout, columnWidth } = renderRecordPage();
    const pageWidth = (width: number) =>
      act(() =>
        observed.forEach((targets, callback) => {
          if (layout && targets.includes(layout)) {
            callback(
              [{ contentRect: { width } } as ResizeObserverEntry],
              {} as ResizeObserver,
            );
          }
        }),
      );
    pageWidth(1000);
    expect(grip.getAttribute('aria-valuemax')).toBe('640');
    fireEvent.keyDown(grip, { key: 'End' });
    expect(columnWidth()).toBe('640px');
    pageWidth(800);
    expect(grip.getAttribute('aria-valuemax')).toBe('440');
    expect(columnWidth()).toBe('440px');
    // Pressing outwards at the limit keeps the wider stored width.
    fireEvent.keyDown(grip, { key: 'ArrowRight' });
    expect(localStorage.getItem('erxes:recordOverviewWidth')).toBe('640');
    pageWidth(500);
    expect(columnWidth()).toBe('288px');
    pageWidth(1200);
    expect(columnWidth()).toBe('640px');
    // A page narrowed mid-drag ends the drag within its new limit.
    pointer(grip, 'pointerdown', 0);
    pointer(document, 'pointermove', 200);
    paint();
    expect(columnWidth()).toBe('840px');
    pageWidth(800);
    expect(columnWidth()).toBe('440px');
    expect(document.body.style.cursor).toBe('');
  } finally {
    Reflect.deleteProperty(window, 'ResizeObserver');
  }
});
