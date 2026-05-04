import React from 'react';
import { Document } from '@react-pdf/renderer';
import { ItineraryPage } from '../../itinerary/pdf/ItineraryPage';
import { createDefaultTourPdfConfig, type TourPDFProps } from './types';
import { COLORS } from './styles';
import { TourCoverPage } from './TourCoverPage';
import { TourDetailsPage } from './TourDetailsPage';

export const TourPDF: React.FC<TourPDFProps> = React.memo(function TourPDF({
  tour,
  itinerary,
  branch,
  config = createDefaultTourPdfConfig(),
}) {
  const themeColor = itinerary?.color || COLORS.primary;
  const title = tour.name || config.labels.untitledTourTitle;

  return (
    <Document
      title={title}
      author="erxes"
      subject="Tour Export"
      creator="erxes Tourism Module"
    >
      {config.showCoverPage ? (
        <TourCoverPage
          tour={tour}
          branch={branch}
          themeColor={themeColor}
          config={config}
        />
      ) : null}

      {config.showDetailsPage ? (
        <TourDetailsPage
          tour={tour}
          itinerary={itinerary}
          branch={branch}
          config={config}
        />
      ) : null}

      {config.showItineraryPage && itinerary?.groupDays?.length ? (
        <ItineraryPage
          itinerary={itinerary}
          branch={branch}
          config={config.itineraryConfig}
        />
      ) : null}
    </Document>
  );
});
