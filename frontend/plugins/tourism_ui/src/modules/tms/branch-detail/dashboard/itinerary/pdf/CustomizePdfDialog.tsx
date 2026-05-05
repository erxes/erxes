import React from 'react';
import {
  IconFileDescription,
  IconForms,
  IconLayoutGrid,
} from '@tabler/icons-react';
import { Button, Checkbox, Dialog, Input, Label } from 'erxes-ui';
import type { ItineraryPdfLabels, ItineraryPdfRenderConfig } from './types';

type ToggleKey =
  | 'showCoverPage'
  | 'showFooterPage'
  | 'showDayContent'
  | 'showElements'
  | 'showAmenities';

interface CustomizePdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfConfig: ItineraryPdfRenderConfig;
  onConfigToggle: (key: ToggleKey, checked: boolean | 'indeterminate') => void;
  onLabelChange: (key: keyof ItineraryPdfLabels, value: string) => void;
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
    description: 'Opening page with the main image, title, and trip summary.',
  },
  {
    key: 'showFooterPage',
    title: 'Footer page',
    description: 'Closing page for notes, remarks, and brand presentation.',
  },
  {
    key: 'showDayContent',
    title: 'Day content',
    description: 'Written overview text shown for each day block.',
  },
  {
    key: 'showElements',
    title: 'Activities',
    description: 'Scheduled activities with time, duration, and details.',
  },
  {
    key: 'showAmenities',
    title: 'Amenities',
    description: 'Short amenity list shown alongside the daily content.',
  },
];

const LABEL_FIELDS: Array<{
  key: keyof ItineraryPdfLabels;
  label: string;
  placeholder: string;
}> = [
  {
    key: 'pageHeaderTitle',
    label: 'Itinerary title',
    placeholder: 'ITINERARY',
  },
  {
    key: 'coverDurationLabel',
    label: 'Cover duration',
    placeholder: 'Duration',
  },
  {
    key: 'coverDaysLabel',
    label: 'Cover days',
    placeholder: 'Days',
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
  {
    key: 'footerNotesTitle',
    label: 'Footer page title',
    placeholder: 'ITINERARY NOTES',
  },
  {
    key: 'footerPageCounter',
    label: 'Page counter',
    placeholder: 'Page {page} of {total}',
  },
];

export const CustomizePdfDialog: React.FC<CustomizePdfDialogProps> = ({
  open,
  onOpenChange,
  pdfConfig,
  onConfigToggle,
  onLabelChange,
  onReset,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-5xl p-0 overflow-hidden">
        <div className="grid md:grid-cols-[1.15fr_0.85fr] max-h-[80vh]">
          <section className="min-h-0 overflow-y-auto bg-background">
            <Dialog.Header className="px-6 py-6 border-b bg-muted/30">
              <Dialog.Title className="text-xl">Customize PDF</Dialog.Title>
              <Dialog.Description className="max-w-xl text-sm leading-6">
                Control which sections appear and shape the language used in the
                exported itinerary.
              </Dialog.Description>
            </Dialog.Header>

            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">
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
                        id={`pdf-${option.key}`}
                        checked={pdfConfig[option.key]}
                        onCheckedChange={(checked) =>
                          onConfigToggle(option.key, checked)
                        }
                        className="mt-0.5"
                      />

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <Label
                            htmlFor={`pdf-${option.key}`}
                            className="text-sm font-semibold"
                          >
                            {option.title}
                          </Label>
                        </div>
                        <p className="text-sm leading-5 text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="min-h-0 overflow-y-auto border-l bg-muted/20">
            <div className="px-6 py-6 border-b bg-background/70 backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">
                <IconForms size={14} />
                Static Text
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Rename the built-in labels shown across the cover, day blocks,
                and notes page.
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="px-4 py-4 border shadow-sm rounded-2xl border-border/60 bg-background">
                <div className="flex items-center gap-2 mb-4 text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">
                  <IconFileDescription size={14} />
                  Label Editor
                </div>

                <div className="space-y-4">
                  {LABEL_FIELDS.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={`pdf-label-${field.key}`}>
                        {field.label}
                      </Label>
                      <Input
                        id={`pdf-label-${field.key}`}
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

              <div className="px-4 py-4 border border-dashed rounded-2xl border-border/70 bg-background/70">
                <p className="text-sm leading-6 text-muted-foreground">
                  Preview refreshes automatically when these values change. Use
                  short labels for the cleanest PDF layout.
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
