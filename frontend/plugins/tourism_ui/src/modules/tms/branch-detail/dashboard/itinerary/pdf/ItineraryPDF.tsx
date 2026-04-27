import React from 'react';
import { Document } from '@react-pdf/renderer';
import { DEFAULT_ITINERARY_PDF_CONFIG, type ItineraryPDFProps } from './types';
import { CoverPage } from './CoverPage';
import { ItineraryPage } from './ItineraryPage';
import { FooterPage } from './FooterPage';
import { EditorialItineraryPage } from './EditorialTemplate';

export const ItineraryPDF: React.FC<ItineraryPDFProps> = React.memo(
  function ItineraryPDF({
    itinerary,
    branch,
    template = 'classic',
    config = DEFAULT_ITINERARY_PDF_CONFIG,
  }) {
    const name = itinerary.name || 'Untitled Itinerary';
    const isEditorial = template === 'editorial';

    return (
      <Document
        title={name}
        author="erxes"
        subject="Itinerary Export"
        creator="erxes Tourism Module"
      >
        {isEditorial ? (
          <EditorialItineraryPage
            itinerary={itinerary}
            branch={branch}
            config={config}
          />
        ) : (
          <>
            {config.showCoverPage ? (
              <CoverPage
                itinerary={itinerary}
                branch={branch}
                coverImageBase64={itinerary.coverImageBase64}
                config={config}
              />
            ) : null}
            <ItineraryPage
              itinerary={itinerary}
              branch={branch}
              config={config}
            />
            {config.showFooterPage ? (
              <FooterPage
                branch={branch}
                content={itinerary.content}
                color={itinerary.color}
                config={config}
                template={template}
                itineraryName={name}
                imageBase64={itinerary.coverImageBase64}
              />
            ) : null}
          </>
        )}

        {isEditorial && config.showFooterPage ? (
          <FooterPage
            branch={branch}
            content={itinerary.content}
            color={itinerary.color}
            config={config}
            template={template}
            itineraryName={name}
            imageBase64={itinerary.coverImageBase64}
          />
        ) : null}
      </Document>
    );
  },
);
