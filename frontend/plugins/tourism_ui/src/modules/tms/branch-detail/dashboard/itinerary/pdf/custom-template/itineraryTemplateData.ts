import type { IBranchPDFData, IItineraryPDFData } from '../types';
import { stripHtml } from '../utils';
import { createBlankTemplate } from './template.defaults';
import type { PdfTemplateDocument, PdfTemplateElement } from './template.types';

const createId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const buildCustomTemplateData = (
  itinerary: IItineraryPDFData,
  branch?: IBranchPDFData,
) => ({
  itinerary: {
    id: itinerary._id,
    name: itinerary.name || '',
    duration: itinerary.duration || 0,
    content: stripHtml(itinerary.content || ''),
    coverImageBase64: itinerary.coverImageBase64 || '',
    totalCost: itinerary.totalCost || 0,
    color: itinerary.color || '',
    days: (itinerary.groupDays || []).map((day, index) => ({
      day: day.day ?? index + 1,
      title: day.title || '',
      content: stripHtml(day.content || ''),
      image: day.base64Images?.[0] || '',
    })),
  },
  branch: {
    name: branch?.name || '',
    mainLogoBase64: branch?.mainLogoBase64 || '',
  },
});

const createDayCardElements = ({
  pageId,
  dayIndex,
  x,
  y,
}: {
  pageId: string;
  dayIndex: number;
  x: number;
  y: number;
}): PdfTemplateElement[] => {
  const dayLabel = `Day ${dayIndex + 1}`;
  const bindingBase = `itinerary.days[${dayIndex}]`;

  return [
    {
      id: createId('element'),
      type: 'image',
      name: `${dayLabel} image`,
      pageId,
      frame: {
        x,
        y: y + 24,
        width: 308,
        height: 184,
        rotation: 0,
      },
      locked: false,
      visible: true,
      zIndex: 4,
      box: {
        borderRadius: 18,
      },
      opacity: 1,
      props: {
        binding: {
          key: `${bindingBase}.image`,
          source: 'itinerary',
          path: `${bindingBase}.image`,
        },
        fit: 'cover',
        alt: `${dayLabel} image`,
      },
    },
    {
      id: createId('element'),
      type: 'shape',
      name: `${dayLabel} badge`,
      pageId,
      frame: {
        x: x + 18,
        y,
        width: 88,
        height: 34,
        rotation: 0,
      },
      locked: false,
      visible: true,
      zIndex: 5,
      box: {
        borderRadius: 10,
      },
      opacity: 0.98,
      props: {
        shape: 'rectangle',
        fill: '#FFFFFF',
      },
    },
    {
      id: createId('element'),
      type: 'text',
      name: `${dayLabel} text`,
      pageId,
      frame: {
        x: x + 32,
        y: y + 8,
        width: 72,
        height: 18,
        rotation: 0,
      },
      locked: false,
      visible: true,
      zIndex: 6,
      box: {},
      opacity: 1,
      props: {
        content: dayLabel.toUpperCase(),
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
    },
    {
      id: createId('element'),
      type: 'dynamic-text',
      name: `${dayLabel} title`,
      pageId,
      frame: {
        x,
        y: y + 228,
        width: 308,
        height: 42,
        rotation: 0,
      },
      locked: false,
      visible: true,
      zIndex: 4,
      box: {},
      opacity: 1,
      props: {
        label: `${dayLabel} title`,
        placeholder: `{{${bindingBase}.title}}`,
        binding: {
          key: `${bindingBase}.title`,
          source: 'itinerary',
          path: `${bindingBase}.title`,
          fallback: `Add ${dayLabel.toLowerCase()} title`,
        },
        typography: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: 700,
          fontStyle: 'normal',
          lineHeight: 1.25,
          letterSpacing: 0,
          color: '#111827',
          textAlign: 'left',
        },
      },
    },
    {
      id: createId('element'),
      type: 'dynamic-text',
      name: `${dayLabel} content`,
      pageId,
      frame: {
        x,
        y: y + 278,
        width: 308,
        height: 84,
        rotation: 0,
      },
      locked: false,
      visible: true,
      zIndex: 4,
      box: {},
      opacity: 1,
      props: {
        label: `${dayLabel} content`,
        placeholder: `{{${bindingBase}.content}}`,
        binding: {
          key: `${bindingBase}.content`,
          source: 'itinerary',
          path: `${bindingBase}.content`,
          fallback: `Add ${dayLabel.toLowerCase()} content`,
        },
        typography: {
          fontFamily: 'Inter',
          fontSize: 11,
          fontWeight: 400,
          fontStyle: 'normal',
          lineHeight: 1.55,
          letterSpacing: 0,
          color: '#4B5563',
          textAlign: 'left',
        },
      },
    },
  ];
};

export const createTemplateFromItinerary = ({
  itinerary,
  branchId,
  userId,
}: {
  itinerary: IItineraryPDFData;
  branchId: string;
  userId: string;
}): PdfTemplateDocument => {
  const template = createBlankTemplate({
    branchId,
    userId,
    name: itinerary.name || 'Custom Builder Template',
  });
  const pageId = template.pages[0].id;

  template.elements = [
    {
      id: createId('element'),
      type: 'image',
      name: 'Hero image',
      pageId,
      frame: {
        x: 44,
        y: 44,
        width: 706,
        height: 280,
        rotation: 0,
      },
      locked: false,
      visible: true,
      zIndex: 1,
      box: {
        borderRadius: 18,
      },
      opacity: 1,
      props: {
        binding: {
          key: 'itinerary.coverImageBase64',
          source: 'itinerary',
          path: 'itinerary.coverImageBase64',
        },
        fit: 'cover',
        alt: 'Hero image',
      },
    },
    {
      id: createId('element'),
      type: 'shape',
      name: 'Title backdrop',
      pageId,
      frame: {
        x: 44,
        y: 336,
        width: 706,
        height: 128,
        rotation: 0,
      },
      locked: false,
      visible: true,
      zIndex: 2,
      box: {
        borderRadius: 18,
      },
      opacity: 0.92,
      props: {
        shape: 'rectangle',
        fill: '#FFF8F1',
      },
    },
    {
      id: createId('element'),
      type: 'dynamic-text',
      name: 'Itinerary title',
      pageId,
      frame: {
        x: 72,
        y: 366,
        width: 520,
        height: 48,
        rotation: 0,
      },
      locked: false,
      visible: true,
      zIndex: 3,
      box: {},
      opacity: 1,
      props: {
        label: 'Itinerary title',
        placeholder: '{{itinerary.name}}',
        binding: {
          key: 'itinerary.name',
          source: 'itinerary',
          path: 'itinerary.name',
        },
        typography: {
          fontFamily: 'Inter',
          fontSize: 28,
          fontWeight: 700,
          fontStyle: 'normal',
          lineHeight: 1.2,
          letterSpacing: 0,
          color: '#111827',
          textAlign: 'left',
        },
      },
    },
    {
      id: createId('element'),
      type: 'dynamic-text',
      name: 'Duration',
      pageId,
      frame: {
        x: 72,
        y: 418,
        width: 220,
        height: 24,
        rotation: 0,
      },
      locked: false,
      visible: true,
      zIndex: 3,
      box: {},
      opacity: 1,
      props: {
        label: 'Duration',
        placeholder: '{{itinerary.duration}} days',
        binding: {
          key: 'itinerary.duration',
          source: 'itinerary',
          path: 'itinerary.duration',
        },
        typography: {
          fontFamily: 'Inter',
          fontSize: 13,
          fontWeight: 500,
          fontStyle: 'normal',
          lineHeight: 1.4,
          letterSpacing: 0.2,
          color: '#6B7280',
          textAlign: 'left',
        },
      },
    },
    {
      id: createId('element'),
      type: 'dynamic-text',
      name: 'Intro text',
      pageId,
      frame: {
        x: 44,
        y: 504,
        width: 706,
        height: 160,
        rotation: 0,
      },
      locked: false,
      visible: true,
      zIndex: 2,
      box: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: {
          top: 24,
          right: 24,
          bottom: 24,
          left: 24,
        },
      },
      opacity: 1,
      props: {
        label: 'Intro',
        placeholder: '{{itinerary.content}}',
        binding: {
          key: 'itinerary.content',
          source: 'itinerary',
          path: 'itinerary.content',
          fallback: 'Add itinerary summary content.',
        },
        typography: {
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: 400,
          fontStyle: 'normal',
          lineHeight: 1.6,
          letterSpacing: 0,
          color: '#374151',
          textAlign: 'left',
        },
      },
    },
    ...createDayCardElements({
      pageId,
      dayIndex: 0,
      x: 44,
      y: 700,
    }),
    ...createDayCardElements({
      pageId,
      dayIndex: 1,
      x: 398,
      y: 700,
    }),
  ];

  return template;
};

export const ensureTemplateHasDefaultDayCards = (
  template: PdfTemplateDocument,
): PdfTemplateDocument => {
  const hasDayZeroCard = template.elements.some((element) => {
    if (element.type !== 'dynamic-text' && element.type !== 'image') {
      return false;
    }

    return (
      ('binding' in element.props &&
        element.props.binding?.path === 'itinerary.days[0].title') ||
      ('binding' in element.props &&
        element.props.binding?.path === 'itinerary.days[0].image')
    );
  });

  if (hasDayZeroCard || !template.pages[0]) {
    return template;
  }

  return {
    ...template,
    elements: [
      ...template.elements,
      ...createDayCardElements({
        pageId: template.pages[0].id,
        dayIndex: 0,
        x: 44,
        y: 700,
      }),
      ...createDayCardElements({
        pageId: template.pages[0].id,
        dayIndex: 1,
        x: 398,
        y: 700,
      }),
    ],
    metadata: {
      ...template.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
};
