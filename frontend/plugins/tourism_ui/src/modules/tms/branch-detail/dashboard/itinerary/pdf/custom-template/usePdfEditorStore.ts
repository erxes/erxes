import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { createBlankTemplate } from './template.defaults';
import type {
  AssetReference,
  EditorFrame,
  PdfPageDefinition,
  PdfTemplateDocument,
  PdfTemplateElement,
} from './template.types';

interface EditorViewportState {
  zoom: number;
  activePageId?: string;
  showGrid: boolean;
}

interface HistoryState {
  past: PdfTemplateDocument[];
  future: PdfTemplateDocument[];
}

const createPageId = () => `page-${Math.random().toString(36).slice(2, 10)}`;

const initialTemplate = createBlankTemplate({
  branchId: 'draft-branch',
  userId: 'draft-user',
});

export const editorTemplateAtom = atom<PdfTemplateDocument>(initialTemplate);
export const editorSelectionAtom = atom<string[]>([]);
export const editorViewportAtom = atom<EditorViewportState>({
  zoom: 1,
  activePageId: initialTemplate.pages[0]?.id,
  showGrid: true,
});
export const editorHistoryAtom = atom<HistoryState>({
  past: [],
  future: [],
});

export const activePageAtom = atom((get) => {
  const template = get(editorTemplateAtom);
  const viewport = get(editorViewportAtom);
  return (
    template.pages.find((page) => page.id === viewport.activePageId) ||
    template.pages[0]
  );
});

export const selectedElementAtom = atom((get) => {
  const template = get(editorTemplateAtom);
  const [selectedId] = get(editorSelectionAtom);
  return template.elements.find((element) => element.id === selectedId);
});

export const replaceTemplateAtom = atom(
  null,
  (_get, set, template: PdfTemplateDocument) => {
    set(editorTemplateAtom, template);
    set(editorViewportAtom, (current) => ({
      ...current,
      activePageId: template.pages[0]?.id,
    }));
    set(editorSelectionAtom, []);
  },
);

export const selectElementAtom = atom(
  null,
  (_get, set, elementIds: string[]) => {
    set(editorSelectionAtom, elementIds);
  },
);

export const setZoomAtom = atom(null, (_get, set, zoom: number) => {
  set(editorViewportAtom, (current) => ({
    ...current,
    zoom: Math.min(2, Math.max(0.25, zoom)),
  }));
});

export const setActivePageAtom = atom(null, (_get, set, pageId: string) => {
  set(editorViewportAtom, (current) => ({
    ...current,
    activePageId: pageId,
  }));
  set(editorSelectionAtom, []);
});

export const addPageAtom = atom(null, (get, set) => {
  const template = get(editorTemplateAtom);
  const nextOrder = template.pages.length;
  const pageId = createPageId();

  set(editorTemplateAtom, {
    ...template,
    pages: [
      ...template.pages,
      {
        id: pageId,
        name: `Page ${nextOrder + 1}`,
        order: nextOrder,
        size: {
          width: 794,
          height: 1123,
        },
        orientation: 'portrait',
        margins: {
          top: 40,
          right: 40,
          bottom: 40,
          left: 40,
        },
        background: {
          fill: '#FFFDF8',
        },
        grid: {
          enabled: true,
          size: 8,
          snap: true,
        },
      },
    ],
    metadata: {
      ...template.metadata,
      updatedAt: new Date().toISOString(),
    },
  });
  set(editorViewportAtom, (current) => ({
    ...current,
    activePageId: pageId,
  }));
  set(editorSelectionAtom, []);
});

export const updateElementFrameAtom = atom(
  null,
  (get, set, payload: { elementId: string; frame: Partial<EditorFrame> }) => {
    const template = get(editorTemplateAtom);
    set(editorTemplateAtom, {
      ...template,
      elements: template.elements.map((element) =>
        element.id === payload.elementId
          ? {
              ...element,
              frame: {
                ...element.frame,
                ...payload.frame,
              },
            }
          : element,
      ),
      metadata: {
        ...template.metadata,
        updatedAt: new Date().toISOString(),
      },
    });
  },
);

export const addElementAtom = atom(
  null,
  (_get, set, element: PdfTemplateElement) => {
    set(editorTemplateAtom, (template) => ({
      ...template,
      elements: [...template.elements, element],
      metadata: {
        ...template.metadata,
        updatedAt: new Date().toISOString(),
      },
    }));
    set(editorSelectionAtom, [element.id]);
  },
);

export const removeElementAtom = atom(null, (_get, set, elementId: string) => {
  set(editorTemplateAtom, (template) => ({
    ...template,
    elements: template.elements.filter((element) => element.id !== elementId),
    metadata: {
      ...template.metadata,
      updatedAt: new Date().toISOString(),
    },
  }));
  set(editorSelectionAtom, []);
});

export const updateElementAtom = atom(
  null,
  (
    _get,
    set,
    payload: {
      elementId: string;
      updater: (element: PdfTemplateElement) => PdfTemplateElement;
    },
  ) => {
    set(editorTemplateAtom, (template) => ({
      ...template,
      elements: template.elements.map((element) =>
        element.id === payload.elementId ? payload.updater(element) : element,
      ),
      metadata: {
        ...template.metadata,
        updatedAt: new Date().toISOString(),
      },
    }));
  },
);

export const updateTemplateAtom = atom(
  null,
  (
    _get,
    set,
    updater: (template: PdfTemplateDocument) => PdfTemplateDocument,
  ) => {
    set(editorTemplateAtom, (template) => updater(template));
  },
);

export const updatePageAtom = atom(
  null,
  (
    _get,
    set,
    payload: {
      pageId: string;
      updater: (page: PdfPageDefinition) => PdfPageDefinition;
    },
  ) => {
    set(editorTemplateAtom, (template) => ({
      ...template,
      pages: template.pages.map((page) =>
        page.id === payload.pageId ? payload.updater(page) : page,
      ),
      metadata: {
        ...template.metadata,
        updatedAt: new Date().toISOString(),
      },
    }));
  },
);

export const upsertAssetAtom = atom(
  null,
  (_get, set, asset: AssetReference) => {
    set(editorTemplateAtom, (template) => {
      const hasAsset = template.assets.some(
        (existing) => existing.id === asset.id,
      );

      return {
        ...template,
        assets: hasAsset
          ? template.assets.map((existing) =>
              existing.id === asset.id ? asset : existing,
            )
          : [...template.assets, asset],
        metadata: {
          ...template.metadata,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },
);

export const usePdfEditorStore = () => {
  const template = useAtomValue(editorTemplateAtom);
  const selection = useAtomValue(editorSelectionAtom);
  const viewport = useAtomValue(editorViewportAtom);
  const activePage = useAtomValue(activePageAtom);
  const selectedElement = useAtomValue(selectedElementAtom);

  const replaceTemplate = useSetAtom(replaceTemplateAtom);
  const selectElement = useSetAtom(selectElementAtom);
  const setZoom = useSetAtom(setZoomAtom);
  const setActivePage = useSetAtom(setActivePageAtom);
  const addPage = useSetAtom(addPageAtom);
  const addElement = useSetAtom(addElementAtom);
  const removeElement = useSetAtom(removeElementAtom);
  const updateElement = useSetAtom(updateElementAtom);
  const updateElementFrame = useSetAtom(updateElementFrameAtom);
  const updateTemplate = useSetAtom(updateTemplateAtom);
  const updatePage = useSetAtom(updatePageAtom);
  const upsertAsset = useSetAtom(upsertAssetAtom);

  return useMemo(
    () => ({
      template,
      selection,
      viewport,
      activePage,
      selectedElement,
      replaceTemplate,
      selectElement,
      setZoom,
      setActivePage,
      addPage,
      addElement,
      removeElement,
      updateElement,
      updateElementFrame,
      updateTemplate,
      updatePage,
      upsertAsset,
    }),
    [
      template,
      selection,
      viewport,
      activePage,
      selectedElement,
      replaceTemplate,
      selectElement,
      setZoom,
      setActivePage,
      addPage,
      addElement,
      removeElement,
      updateElement,
      updateElementFrame,
      updateTemplate,
      updatePage,
      upsertAsset,
    ],
  );
};
