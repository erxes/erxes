import type {
  DynamicBinding,
  PdfTemplateDocument,
  TextElement,
} from './template.types';

const createId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const nowIso = () => new Date().toISOString();

const defaultTitleElement = (pageId: string): TextElement => ({
  id: createId('element'),
  type: 'text',
  name: 'Title',
  pageId,
  frame: {
    x: 56,
    y: 60,
    width: 520,
    height: 56,
    rotation: 0,
  },
  locked: false,
  visible: true,
  zIndex: 10,
  box: {},
  opacity: 1,
  props: {
    content: 'Travel Itinerary',
    typography: {
      fontFamily: 'Inter',
      fontSize: 30,
      fontWeight: 700,
      fontStyle: 'normal',
      lineHeight: 1.2,
      letterSpacing: 0,
      color: '#111827',
      textAlign: 'left',
    },
  },
});

const defaultBindings = (): DynamicBinding[] => [
  {
    key: 'tour.title',
    source: 'tour',
    path: 'tour.title',
  },
  {
    key: 'tour.price',
    source: 'pricing',
    path: 'pricing.startingFrom',
    formatter: 'currency',
  },
];

export const createBlankTemplate = ({
  branchId,
  userId,
  name = 'Custom Builder Template',
}: {
  branchId: string;
  userId: string;
  name?: string;
}): PdfTemplateDocument => {
  const pageId = createId('page');

  return {
    id: createId('template'),
    branchId,
    name,
    slug: name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'),
    description: 'Editable PDF template for brochure and itinerary exports.',
    status: 'draft',
    version: 1,
    versionStatus: 'active',
    unit: 'px',
    locale: 'en',
    theme: {
      primaryColor: '#DC2626',
      secondaryColor: '#F59E0B',
      surfaceColor: '#FFFFFF',
      textColor: '#111827',
      headingFontFamily: 'Inter',
      bodyFontFamily: 'Inter',
    },
    pages: [
      {
        id: pageId,
        name: 'Cover',
        order: 0,
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
    elements: [defaultTitleElement(pageId)],
    reusableBlocks: [],
    assets: [],
    bindings: defaultBindings(),
    metadata: {
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdBy: userId,
      updatedBy: userId,
      tags: ['custom-builder'],
    },
  };
};
