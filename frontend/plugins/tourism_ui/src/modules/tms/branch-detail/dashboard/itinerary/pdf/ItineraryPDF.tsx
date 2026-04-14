import React from 'react';
import { Document } from '@react-pdf/renderer';
import type { ItineraryPDFProps } from './types';
import { CoverPage } from './CoverPage';
import { ItineraryPage } from './ItineraryPage';
import { FooterPage } from './FooterPage';
import { EditorialItineraryPage } from './EditorialTemplate';

export const ItineraryPDF: React.FC<ItineraryPDFProps> = React.memo(
  function ItineraryPDF({ itinerary, branch, template = 'classic' }) {
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
          <EditorialItineraryPage itinerary={itinerary} branch={branch} />
        ) : (
          <>
            <CoverPage
              itinerary={itinerary}
              branch={branch}
              coverImageBase64={itinerary.coverImageBase64}
            />
            <ItineraryPage itinerary={itinerary} branch={branch} />
            <FooterPage
              branch={branch}
              content={itinerary.content}
              color={itinerary.color}
            />
          </>
        )}
      </Document>
    );
  },
);
