import React from 'react';
import { Document } from '@react-pdf/renderer';
import { ItineraryPage } from '../../itinerary/pdf/ItineraryPage';
import type { TourPDFProps } from './types';
import { COLORS } from './styles';
import { TourCoverPage } from './TourCoverPage';
import { TourDetailsPage } from './TourDetailsPage';

export const TourPDF: React.FC<TourPDFProps> = React.memo(function TourPDF({
  tour,
  itinerary,
  branch,
}) {
  const themeColor = itinerary?.color || COLORS.primary;
  const title = tour.name || 'Untitled Tour';

  return (
    <Document
      title={title}
      author="erxes"
      subject="Tour Export"
      creator="erxes Tourism Module"
    >
      <TourCoverPage tour={tour} branch={branch} themeColor={themeColor} />
      <TourDetailsPage tour={tour} itinerary={itinerary} branch={branch} />

      {itinerary?.groupDays?.length ? (
        <ItineraryPage itinerary={itinerary} branch={branch} />
      ) : null}
    </Document>
  );
});

