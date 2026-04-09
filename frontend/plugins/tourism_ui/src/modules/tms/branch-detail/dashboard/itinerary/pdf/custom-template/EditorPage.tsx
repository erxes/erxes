import React from 'react';
import { Button, Input, Textarea } from 'erxes-ui';
import { PdfEditorCanvas } from './Canvas';
import { InspectorPanel } from './InspectorPanel';
import type {
  PdfTemplateDocument,
  PdfTemplateElement,
  TextElement,
} from './template.types';
import { usePdfEditorStore } from './usePdfEditorStore';

const createId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const createTextElement = (pageId: string): PdfTemplateElement => ({
  id: createId('element'),
  type: 'text',
  name: 'Text block',
  pageId,
  frame: {
    x: 72,
    y: 72,
    width: 320,
    height: 64,
    rotation: 0,
  },
  locked: false,
  visible: true,
  zIndex: Date.now(),
  box: {},
  opacity: 1,
  props: {
    content: 'Add your custom copy here',
    typography: {
      fontFamily: 'Inter',
      fontSize: 18,
      fontWeight: 600,
      fontStyle: 'normal',
      lineHeight: 1.4,
      letterSpacing: 0,
      color: '#111827',
      textAlign: 'left',
    },
  },
});

const createDynamicTextElement = (
  pageId: string,
  label: string,
  path: string,
  placeholder: string,
): PdfTemplateElement => ({
  id: createId('element'),
  type: 'dynamic-text',
  name: label,
  pageId,
  frame: {
    x: 72,
    y: 160,
    width: 320,
    height: 56,
    rotation: 0,
  },
  locked: false,
  visible: true,
  zIndex: Date.now(),
  box: {},
  opacity: 1,
  props: {
    label,
    placeholder,
    binding: {
      key: path,
      source: 'itinerary',
      path,
    },
    typography: {
      fontFamily: 'Inter',
      fontSize: 24,
      fontWeight: 700,
      fontStyle: 'normal',
      lineHeight: 1.2,
      letterSpacing: 0,
      color: '#111827',
      textAlign: 'left',
    },
  },
});

const createImageElement = (pageId: string): PdfTemplateElement => ({
  id: createId('element'),
  type: 'image',
  name: 'Image',
  pageId,
  frame: {
    x: 72,
    y: 240,
    width: 260,
    height: 180,
    rotation: 0,
  },
  locked: false,
  visible: true,
  zIndex: Date.now(),
  box: {
    borderRadius: 14,
  },
  opacity: 1,
  props: {
    binding: {
      key: 'itinerary.coverImageBase64',
      source: 'itinerary',
      path: 'itinerary.coverImageBase64',
    },
    fit: 'cover',
  },
});

const createShapeElement = (pageId: string): PdfTemplateElement => ({
  id: createId('element'),
  type: 'shape',
  name: 'Shape',
  pageId,
  frame: {
    x: 72,
    y: 440,
    width: 240,
    height: 100,
    rotation: 0,
  },
  locked: false,
  visible: true,
  zIndex: Date.now(),
  box: {
    borderRadius: 18,
  },
  opacity: 1,
  props: {
    shape: 'rectangle',
    fill: '#F3F4F6',
  },
});

const createDayCardElements = (
  pageId: string,
  dayIndex: number,
): PdfTemplateElement[] => {
  const offsetY = 520 + dayIndex * 28;
  const dayBadge: TextElement = {
    ...(createTextElement(pageId) as TextElement),
    name: `Day ${dayIndex + 1} badge`,
    frame: {
      x: 72,
      y: offsetY,
      width: 96,
      height: 28,
      rotation: 0,
    },
    props: {
      content: `DAY ${dayIndex + 1}`,
      typography: {
        fontFamily: 'Inter',
        fontSize: 11,
        fontWeight: 700,
        fontStyle: 'normal',
        lineHeight: 1.1,
        letterSpacing: 0.8,
        color: '#374151',
        textAlign: 'left',
        textTransform: 'uppercase',
      },
    },
  };
  const baseElements: PdfTemplateElement[] = [
    createImageElement(pageId),
    createDynamicTextElement(
      pageId,
      `Day ${dayIndex + 1} title`,
      `itinerary.days[${dayIndex}].title`,
      `{{itinerary.days[${dayIndex}].title}}`,
    ),
    dayBadge,
  ];

  return baseElements.map((element, index) => ({
    ...element,
    frame: {
      ...element.frame,
      x: element.frame.x + (dayIndex % 2) * 340,
      y: element.frame.y + offsetY + index * 32,
    },
  }));
};

export const CustomPdfEditorPage: React.FC<{
  initialTemplate: PdfTemplateDocument;
  onSaveTemplate: (template: PdfTemplateDocument) => void | Promise<void>;
  saving?: boolean;
}> = React.memo(function CustomPdfEditorPage({
  initialTemplate,
  onSaveTemplate,
  saving = false,
}) {
  const {
    activePage,
    addPage,
    addElement,
    replaceTemplate,
    setActivePage,
    setZoom,
    template,
    updateTemplate,
    viewport,
  } = usePdfEditorStore();

  React.useEffect(() => {
    replaceTemplate(initialTemplate);
  }, [initialTemplate, replaceTemplate]);

  const activePageId = activePage?.id || template.pages[0]?.id;

  return (
    <div className="flex h-full min-h-[760px] flex-col bg-background">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="min-w-0 flex-1 pr-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Custom Builder
          </p>
          <Input
            className="mt-2 h-11 max-w-xl text-lg font-semibold"
            value={template.name}
            onChange={(event) =>
              updateTemplate((current) => ({
                ...current,
                name: event.target.value,
                metadata: {
                  ...current.metadata,
                  updatedAt: new Date().toISOString(),
                },
              }))
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setZoom(viewport.zoom - 0.1)}
          >
            Zoom out
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setZoom(viewport.zoom + 0.1)}
          >
            Zoom in
          </Button>
          <Button
            type="button"
            onClick={() => onSaveTemplate(template)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save template'}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="w-80 border-r bg-background p-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Pages
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addPage()}
                >
                  Add page
                </Button>
              </div>
              <div className="mt-3 grid gap-2">
                {template.pages
                  .sort((left, right) => left.order - right.order)
                  .map((page) => {
                    const isActive = page.id === activePageId;

                    return (
                      <button
                        key={page.id}
                        type="button"
                        className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                          isActive
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/40'
                        }`}
                        onClick={() => setActivePage(page.id)}
                      >
                        <div className="text-sm font-medium">{page.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {page.size.width} x {page.size.height}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Blocks
              </p>
              <div className="mt-3 grid gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    activePageId && addElement(createTextElement(activePageId))
                  }
                >
                  Add text
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    activePageId &&
                    addElement(
                      createDynamicTextElement(
                        activePageId,
                        'Itinerary title',
                        'itinerary.name',
                        '{{itinerary.name}}',
                      ),
                    )
                  }
                >
                  Add title placeholder
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    activePageId &&
                    addElement(
                      createDynamicTextElement(
                        activePageId,
                        'Duration',
                        'itinerary.duration',
                        '{{itinerary.duration}}',
                      ),
                    )
                  }
                >
                  Add duration placeholder
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    activePageId && addElement(createImageElement(activePageId))
                  }
                >
                  Add hero image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    activePageId && addElement(createShapeElement(activePageId))
                  }
                >
                  Add shape
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!activePageId) return;

                    createDayCardElements(activePageId, 0).forEach(
                      (element) => {
                        addElement(element);
                      },
                    );
                  }}
                >
                  Add day card
                </Button>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Notes
              </p>
              <Textarea
                rows={8}
                className="mt-3"
                value={template.description || ''}
                onChange={(event) =>
                  updateTemplate((current) => ({
                    ...current,
                    description: event.target.value,
                    metadata: {
                      ...current.metadata,
                      updatedAt: new Date().toISOString(),
                    },
                  }))
                }
              />
            </div>

            <div className="rounded-xl bg-muted/40 p-4 text-xs leading-6 text-muted-foreground">
              Drag blocks directly on the page. Use the right panel to edit
              content, binding paths, colors, and sizing before saving.
            </div>
          </div>
        </div>

        <PdfEditorCanvas />
        <InspectorPanel />
      </div>
    </div>
  );
});
