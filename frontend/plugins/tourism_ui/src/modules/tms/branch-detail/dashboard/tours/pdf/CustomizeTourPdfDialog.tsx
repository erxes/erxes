import React from 'react';
import {
  IconFileDescription,
  IconForms,
  IconLayoutGrid,
} from '@tabler/icons-react';
import { Button, Checkbox, Dialog, Input, Label } from 'erxes-ui';
import type { ItineraryPdfLabels } from '../../itinerary/pdf/types';
import type { TourPdfLabels, TourPdfRenderConfig } from './types';

type ToggleKey = 'showCoverPage' | 'showDetailsPage' | 'showItineraryPage';
type ItineraryToggleKey = 'showDayContent' | 'showElements' | 'showAmenities';

interface CustomizeTourPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfConfig: TourPdfRenderConfig;
  onConfigToggle: (key: ToggleKey, checked: boolean | 'indeterminate') => void;
  onLabelChange: (key: keyof TourPdfLabels, value: string) => void;
  onItineraryConfigToggle: (
    key: ItineraryToggleKey,
    checked: boolean | 'indeterminate',
  ) => void;
  onItineraryLabelChange: (
    key: keyof ItineraryPdfLabels,
    value: string,
  ) => void;
  onReset: () => void;
}

const TOGGLE_OPTIONS: Array<{
  key: ToggleKey;
  title: string;
  description: string;
}> = [
  {
    key: 'showCoverPage',
    title: 'Cover page',
    description: 'Opening page with the main tour image and summary line.',
  },
  {
    key: 'showDetailsPage',
    title: 'Overview page',
    description: 'Tour overview, pricing, and main information sections.',
  },
  {
    key: 'showItineraryPage',
    title: 'Itinerary pages',
    description:
      'Attached day-by-day itinerary pages from the linked itinerary.',
  },
];

const LABEL_FIELDS: Array<{
  key: keyof TourPdfLabels;
  label: string;
  placeholder: string;
}> = [
  { key: 'coverEyebrow', label: 'Cover eyebrow', placeholder: 'Tour Book' },
  {
    key: 'coverFallbackSubtitle',
    label: 'Cover fallback subtitle',
    placeholder: 'Custom Tour',
  },
  {
    key: 'coverDurationLabel',
    label: 'Cover duration label',
    placeholder: 'Duration',
  },
  {
    key: 'coverDaySingularLabel',
    label: 'Cover day singular',
    placeholder: 'Day',
  },
  {
    key: 'coverDayPluralLabel',
    label: 'Cover day plural',
    placeholder: 'Days',
  },
  {
    key: 'detailsPageHeaderTitle',
    label: 'Overview page title',
    placeholder: 'TOUR OVERVIEW',
  },
  {
    key: 'detailsIntroEyebrow',
    label: 'Overview eyebrow',
    placeholder: 'Tour Information',
  },
  {
    key: 'overviewReferenceLabel',
    label: 'Reference label',
    placeholder: 'Reference',
  },
  {
    key: 'overviewDurationLabel',
    label: 'Duration label',
    placeholder: 'Duration',
  },
  {
    key: 'overviewTravelDatesLabel',
    label: 'Travel dates label',
    placeholder: 'Travel Dates',
  },
  {
    key: 'overviewAvailableRangeLabel',
    label: 'Available range label',
    placeholder: 'Available Range',
  },
  {
    key: 'overviewGroupSizeLabel',
    label: 'Group size label',
    placeholder: 'Group Size',
  },
  {
    key: 'pricingSectionTitle',
    label: 'Pricing section title',
    placeholder: 'Pricing Options',
  },
  {
    key: 'pricingUntitledOptionLabel',
    label: 'Untitled option label',
    placeholder: 'Untitled option',
  },
  {
    key: 'pricingPerPersonLabel',
    label: 'Price / person label',
    placeholder: 'Price / Person',
  },
  {
    key: 'pricingAdultLabel',
    label: 'Adult price label',
    placeholder: 'Adult Price',
  },
  {
    key: 'pricingChildLabel',
    label: 'Child price label',
    placeholder: 'Child Price',
  },
  {
    key: 'pricingInfantLabel',
    label: 'Infant price label',
    placeholder: 'Infant Price',
  },
  {
    key: 'pricingAccommodationLabel',
    label: 'Accommodation label',
    placeholder: 'Accommodation',
  },
  {
    key: 'pricingDomesticFlightLabel',
    label: 'Domestic flight label',
    placeholder: 'Domestic Flight',
  },
  {
    key: 'pricingSingleSupplementLabel',
    label: 'Single supplement label',
    placeholder: 'Single Supplement',
  },
  {
    key: 'summarySectionTitle',
    label: 'Summary title',
    placeholder: 'Summary',
  },
  {
    key: 'includedSectionTitle',
    label: 'Included title',
    placeholder: 'Included',
  },
  {
    key: 'notIncludedSectionTitle',
    label: 'Not included title',
    placeholder: 'Not Included',
  },
  {
    key: 'highlightsSectionTitle',
    label: 'Highlights title',
    placeholder: 'Highlights',
  },
  {
    key: 'additionalInfoSectionTitle',
    label: 'Additional info title',
    placeholder: 'Additional Information',
  },
  { key: 'paxSuffixLabel', label: 'Pax suffix', placeholder: 'pax' },
  { key: 'upToLabel', label: 'Up to label', placeholder: 'Up to' },
  {
    key: 'untitledTourTitle',
    label: 'Untitled tour fallback',
    placeholder: 'Untitled Tour',
  },
];

const ITINERARY_TOGGLE_OPTIONS: Array<{
  key: ItineraryToggleKey;
  title: string;
  description: string;
}> = [
  {
    key: 'showDayContent',
    title: 'Day content',
    description:
      'Written overview text shown for each day in the attached itinerary.',
  },
  {
    key: 'showElements',
    title: 'Activities',
    description: 'Scheduled activities with time, duration, and details.',
  },
  {
    key: 'showAmenities',
    title: 'Amenities',
    description:
      'Short amenity list shown inside the attached itinerary pages.',
  },
];

const ITINERARY_LABEL_FIELDS: Array<{
  key: keyof ItineraryPdfLabels;
  label: string;
  placeholder: string;
}> = [
  {
    key: 'pageHeaderTitle',
    label: 'Itinerary page title',
    placeholder: 'ITINERARY',
  },
  {
    key: 'dayLabel',
    label: 'Day label',
    placeholder: 'DAY',
  },
  {
    key: 'dayOverviewTitle',
    label: 'Overview label',
    placeholder: 'Overview',
  },
  {
    key: 'dayActivitiesTitle',
    label: 'Activities label',
    placeholder: 'Activities',
  },
];

export const CustomizeTourPdfDialog: React.FC<CustomizeTourPdfDialogProps> = ({
  open,
  onOpenChange,
  pdfConfig,
  onConfigToggle,
  onLabelChange,
  onItineraryConfigToggle,
  onItineraryLabelChange,
  onReset,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-5xl p-0 overflow-hidden">
        <div className="grid max-h-[80vh] md:grid-cols-[1.05fr_0.95fr]">
          <section className="min-h-0 overflow-y-auto bg-background">
            <Dialog.Header className="px-6 py-6 border-b bg-muted/30">
              <Dialog.Title className="text-xl">
                Customize Tour PDF
              </Dialog.Title>
              <Dialog.Description className="max-w-xl text-sm leading-6">
                Control which tour sections appear and rename the built-in text
                used in the exported PDF.
              </Dialog.Description>
            </Dialog.Header>

            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <IconLayoutGrid size={14} />
                Visible Sections
              </div>

              <div className="grid gap-3">
                {TOGGLE_OPTIONS.map((option) => (
                  <div
                    key={option.key}
                    className="px-4 py-4 transition-colors border shadow-sm rounded-2xl border-border/60 bg-background hover:border-primary/30"
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`tour-pdf-${option.key}`}
                        checked={pdfConfig[option.key]}
                        onCheckedChange={(checked) =>
                          onConfigToggle(option.key, checked)
                        }
                        className="mt-0.5"
                      />

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Label
                          htmlFor={`tour-pdf-${option.key}`}
                          className="text-sm font-semibold"
                        >
                          {option.title}
                        </Label>
                        <p className="text-sm leading-5 text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  <IconLayoutGrid size={14} />
                  Attached Itinerary
                </div>

                <div className="grid gap-3">
                  {ITINERARY_TOGGLE_OPTIONS.map((option) => (
                    <div
                      key={option.key}
                      className="px-4 py-4 transition-colors border shadow-sm rounded-2xl border-border/60 bg-background hover:border-primary/30"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`tour-itinerary-pdf-${option.key}`}
                          checked={pdfConfig.itineraryConfig[option.key]}
                          onCheckedChange={(checked) =>
                            onItineraryConfigToggle(option.key, checked)
                          }
                          className="mt-0.5"
                        />

                        <div className="min-w-0 flex-1 space-y-1.5">
                          <Label
                            htmlFor={`tour-itinerary-pdf-${option.key}`}
                            className="text-sm font-semibold"
                          >
                            {option.title}
                          </Label>
                          <p className="text-sm leading-5 text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="min-h-0 overflow-y-auto border-l bg-muted/20">
            <div className="px-6 py-6 border-b bg-background/70 backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <IconForms size={14} />
                Static Text
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Update the built-in labels used in the cover, overview, and
                pricing sections.
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="px-4 py-4 border shadow-sm rounded-2xl border-border/60 bg-background">
                <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  <IconFileDescription size={14} />
                  Tour Labels
                </div>

                <div className="space-y-4">
                  {LABEL_FIELDS.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={`tour-pdf-label-${field.key}`}>
                        {field.label}
                      </Label>
                      <Input
                        id={`tour-pdf-label-${field.key}`}
                        value={pdfConfig.labels[field.key]}
                        placeholder={field.placeholder}
                        onChange={(event) =>
                          onLabelChange(field.key, event.target.value)
                        }
                        className="bg-background"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4 border shadow-sm rounded-2xl border-border/60 bg-background">
                <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  <IconFileDescription size={14} />
                  Itinerary Labels
                </div>

                <div className="space-y-4">
                  {ITINERARY_LABEL_FIELDS.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={`tour-itinerary-pdf-label-${field.key}`}>
                        {field.label}
                      </Label>
                      <Input
                        id={`tour-itinerary-pdf-label-${field.key}`}
                        value={pdfConfig.itineraryConfig.labels[field.key]}
                        placeholder={field.placeholder}
                        onChange={(event) =>
                          onItineraryLabelChange(field.key, event.target.value)
                        }
                        className="bg-background"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4 border border-dashed rounded-2xl border-border/70 bg-background/70">
                <p className="text-sm leading-6 text-muted-foreground">
                  Preview refreshes automatically when these values change.
                  Short labels usually fit best in the exported layout.
                </p>
              </div>
            </div>

            <Dialog.Footer className="sticky bottom-0 px-6 py-4 border-t bg-background/95 backdrop-blur">
              <Button variant="outline" onClick={onReset}>
                Reset to defaults
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </Dialog.Footer>
          </aside>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
