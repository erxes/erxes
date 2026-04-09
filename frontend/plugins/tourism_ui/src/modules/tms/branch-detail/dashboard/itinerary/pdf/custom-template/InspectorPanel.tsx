import React from 'react';
import { Input, Textarea } from 'erxes-ui';
import { usePdfEditorStore } from './usePdfEditorStore';

export const InspectorPanel: React.FC = React.memo(function InspectorPanel() {
  const {
    activePage,
    selectedElement,
    removeElement,
    updateElement,
    updateElementFrame,
    updatePage,
    upsertAsset,
  } = usePdfEditorStore();

  if (!selectedElement) {
    return (
      <aside className="w-80 border-l bg-background p-4">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Page settings
            </p>
            <h3 className="mt-2 text-lg font-semibold">{activePage?.name}</h3>
          </div>

          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Background</span>
            <Input
              type="color"
              value={activePage?.background.fill || '#ffffff'}
              onChange={(event) => {
                if (!activePage) return;
                updatePage({
                  pageId: activePage.id,
                  updater: (page) => ({
                    ...page,
                    background: {
                      ...page.background,
                      fill: event.target.value,
                    },
                  }),
                });
              }}
            />
          </label>

          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            Select an element to edit content, bindings, colors, and layout.
          </div>
        </div>
      </aside>
    );
  }

  const isTextElement =
    selectedElement.type === 'text' || selectedElement.type === 'dynamic-text';

  return (
    <aside className="w-80 border-l bg-background p-4">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Inspector
            </p>
            <h3 className="mt-2 text-lg font-semibold">
              {selectedElement.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedElement.type} element
            </p>
          </div>
          <button
            type="button"
            className="rounded-md border px-2 py-1 text-xs text-destructive"
            onClick={() => removeElement(selectedElement.id)}
          >
            Delete
          </button>
        </div>

        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Name</span>
          <Input
            value={selectedElement.name}
            onChange={(event) =>
              updateElement({
                elementId: selectedElement.id,
                updater: (element) => ({
                  ...element,
                  name: event.target.value,
                }),
              })
            }
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          {(['x', 'y', 'width', 'height'] as const).map((field) => (
            <label key={field} className="space-y-1 text-sm">
              <span className="capitalize text-muted-foreground">{field}</span>
              <Input
                type="number"
                value={selectedElement.frame[field]}
                onChange={(event) =>
                  updateElementFrame({
                    elementId: selectedElement.id,
                    frame: {
                      [field]: Number(event.target.value),
                    },
                  })
                }
              />
            </label>
          ))}
        </div>

        {selectedElement.type === 'text' ? (
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Content</span>
            <Textarea
              rows={6}
              value={selectedElement.props.content}
              onChange={(event) =>
                updateElement({
                  elementId: selectedElement.id,
                  updater: (element) =>
                    element.type === 'text'
                      ? {
                          ...element,
                          props: {
                            ...element.props,
                            content: event.target.value,
                          },
                        }
                      : element,
                })
              }
            />
          </label>
        ) : null}

        {selectedElement.type === 'dynamic-text' ? (
          <>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Binding path</span>
              <Input
                value={selectedElement.props.binding.path}
                onChange={(event) =>
                  updateElement({
                    elementId: selectedElement.id,
                    updater: (element) =>
                      element.type === 'dynamic-text'
                        ? {
                            ...element,
                            props: {
                              ...element.props,
                              binding: {
                                ...element.props.binding,
                                path: event.target.value,
                              },
                            },
                          }
                        : element,
                  })
                }
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Placeholder</span>
              <Input
                value={selectedElement.props.placeholder}
                onChange={(event) =>
                  updateElement({
                    elementId: selectedElement.id,
                    updater: (element) =>
                      element.type === 'dynamic-text'
                        ? {
                            ...element,
                            props: {
                              ...element.props,
                              placeholder: event.target.value,
                            },
                          }
                        : element,
                  })
                }
              />
            </label>
          </>
        ) : null}

        {selectedElement.type === 'image' ? (
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">
              Image binding or URL asset
            </span>
            <Input
              value={
                selectedElement.props.binding?.path ||
                (selectedElement.props.assetId
                  ? selectedElement.props.assetId
                  : '')
              }
              onChange={(event) =>
                updateElement({
                  elementId: selectedElement.id,
                  updater: (element) =>
                    element.type === 'image'
                      ? {
                          ...element,
                          props: {
                            ...element.props,
                            binding: {
                              key: event.target.value,
                              source: 'custom',
                              path: event.target.value,
                            },
                          },
                        }
                      : element,
                })
              }
            />
            <button
              type="button"
              className="rounded-md border px-3 py-2 text-xs"
              onClick={() => {
                const value = selectedElement.props.binding?.path;
                if (!value || !value.startsWith('http')) {
                  return;
                }

                upsertAsset({
                  id: selectedElement.id,
                  name: selectedElement.name,
                  kind: 'image',
                  url: value,
                  mimeType: 'image/jpeg',
                  fileSize: 0,
                });
              }}
            >
              Treat as remote asset URL
            </button>
          </label>
        ) : null}

        {selectedElement.type === 'shape' ? (
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Fill</span>
            <Input
              type="color"
              value={selectedElement.props.fill}
              onChange={(event) =>
                updateElement({
                  elementId: selectedElement.id,
                  updater: (element) =>
                    element.type === 'shape'
                      ? {
                          ...element,
                          props: {
                            ...element.props,
                            fill: event.target.value,
                          },
                        }
                      : element,
                })
              }
            />
          </label>
        ) : null}

        {isTextElement ? (
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Font size</span>
              <Input
                type="number"
                value={selectedElement.props.typography.fontSize}
                onChange={(event) =>
                  updateElement({
                    elementId: selectedElement.id,
                    updater: (element) =>
                      element.type === 'text' || element.type === 'dynamic-text'
                        ? ({
                            ...element,
                            props: {
                              ...element.props,
                              typography: {
                                ...element.props.typography,
                                fontSize: Number(event.target.value),
                              },
                            },
                          } as typeof element)
                        : element,
                  })
                }
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Color</span>
              <Input
                type="color"
                value={selectedElement.props.typography.color}
                onChange={(event) =>
                  updateElement({
                    elementId: selectedElement.id,
                    updater: (element) =>
                      element.type === 'text' || element.type === 'dynamic-text'
                        ? ({
                            ...element,
                            props: {
                              ...element.props,
                              typography: {
                                ...element.props.typography,
                                color: event.target.value,
                              },
                            },
                          } as typeof element)
                        : element,
                  })
                }
              />
            </label>
          </div>
        ) : null}
      </div>
    </aside>
  );
});
