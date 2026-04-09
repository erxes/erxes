import React, { useMemo } from 'react';
import { Sheet, Spinner, useToast } from 'erxes-ui';
import type { IBranchPDFData, IItineraryPDFData } from '../types';
import { CustomPdfEditorPage } from './EditorPage';
import {
  createTemplateFromItinerary,
  ensureTemplateHasDefaultDayCards,
} from './itineraryTemplateData';
import { pdfTemplateDocumentSchema } from './template.schema';
import type { PdfTemplateDocument } from './template.types';
import { useItineraryPdfTemplate } from '../../hooks/useItineraryPdfTemplate';
import { useUpsertItineraryPdfTemplate } from '../../hooks/useUpsertItineraryPdfTemplate';

export const CustomTemplateEditorSheet: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itinerary: IItineraryPDFData;
  branch?: IBranchPDFData;
  onSave: (template: PdfTemplateDocument) => void;
}> = React.memo(function CustomTemplateEditorSheet({
  open,
  onOpenChange,
  itinerary,
  branch,
  onSave,
}) {
  const { toast } = useToast();
  const {
    template: savedTemplate,
    loading: loadingTemplate,
    error: loadError,
  } = useItineraryPdfTemplate(itinerary._id, open);
  const { upsertItineraryPdfTemplate, loading: savingTemplate } =
    useUpsertItineraryPdfTemplate();

  const initialTemplate = useMemo(() => {
    if (savedTemplate) {
      return ensureTemplateHasDefaultDayCards(savedTemplate);
    }

    return ensureTemplateHasDefaultDayCards(
      createTemplateFromItinerary({
        itinerary,
        branchId: itinerary.branchId || 'draft-branch',
        userId: 'server-user',
      }),
    );
  }, [itinerary, savedTemplate]);

  const handleSaveTemplate = async (template: PdfTemplateDocument) => {
    try {
      const result = await upsertItineraryPdfTemplate({
        variables: {
          input: {
            itineraryId: itinerary._id,
            branchId: itinerary.branchId,
            kind: 'custom-builder',
            name: template.name,
            description: template.description,
            status: template.status,
            version: template.version,
            doc: template,
          },
        },
      });

      const savedDoc = result.data?.bmsItineraryPdfTemplateUpsert?.doc;
      const parsedSavedDoc = savedDoc
        ? pdfTemplateDocumentSchema.safeParse(savedDoc)
        : null;
      const normalizedTemplate =
        parsedSavedDoc?.success && parsedSavedDoc.data
          ? ensureTemplateHasDefaultDayCards(parsedSavedDoc.data)
          : template;

      onSave(normalizedTemplate);
      toast({
        title: 'Custom template saved',
        description:
          branch?.name || itinerary.name
            ? `Saved for ${itinerary.name || branch?.name}.`
            : 'Your custom PDF template was saved.',
        variant: 'success',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Save failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to save the custom PDF template.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="w-[96vw] sm:max-w-[96vw] p-0">
        {loadingTemplate && !savedTemplate ? (
          <div className="flex h-[80vh] items-center justify-center gap-3 text-sm text-muted-foreground">
            <Spinner />
            Loading saved template...
          </div>
        ) : (
          <div className="flex h-full flex-col">
            {loadError ? (
              <div className="border-b bg-amber-50 px-6 py-3 text-sm text-amber-800">
                Saved template could not be loaded. You can continue editing
                from the default layout and save again.
              </div>
            ) : null}

            <CustomPdfEditorPage
              initialTemplate={initialTemplate}
              onSaveTemplate={handleSaveTemplate}
              saving={savingTemplate}
            />
          </div>
        )}
      </Sheet.View>
    </Sheet>
  );
});
