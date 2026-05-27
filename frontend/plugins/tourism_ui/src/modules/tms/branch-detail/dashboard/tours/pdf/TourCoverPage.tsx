import React from 'react';
import { Image, Page, Text, View } from '@react-pdf/renderer';
import type { IBranchPDFData } from '../../itinerary/pdf/types';
import type { ITourPDFData } from './types';
import { COLORS, styles } from './styles';

interface TourCoverPageProps {
  tour: ITourPDFData;
  branch?: IBranchPDFData;
  themeColor?: string;
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
});

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return dateFormatter.format(date);
};

const buildDateLabel = (tour: ITourPDFData) => {
  if (tour.dateType === 'flexible') {
    const from = formatDate(tour.availableFrom);
    const to = formatDate(tour.availableTo);
    return [from, to].filter(Boolean).join(' - ');
  }

  const start = formatDate(tour.startDate);
  const end = formatDate(tour.endDate);
  return [start, end].filter(Boolean).join(' - ');
};

export const TourCoverPage: React.FC<TourCoverPageProps> = React.memo(
  function TourCoverPage({ tour, branch, themeColor }) {
    const primaryColor = themeColor || COLORS.primary;
    const dateLabel = buildDateLabel(tour);
    const durationUnit = tour.duration === 1 ? 'Day' : 'Days';
    const durationLabel = tour.duration
      ? `Duration: ${tour.duration} ${durationUnit}`
      : '';
    const subtitle = [dateLabel, durationLabel].filter(Boolean).join(' | ');

    return (
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverWrapper}>
          {tour.coverImageBase64 ? (
            <Image
              src={tour.coverImageBase64}
              style={styles.coverBackgroundImage}
            />
          ) : (
            <View
              style={[
                styles.coverBackgroundImage,
                { backgroundColor: primaryColor },
              ]}
            />
          )}

          <View style={styles.coverOverlay} />

          {branch?.mainLogoBase64 ? (
            <View style={styles.coverLogoRow}>
              <Image src={branch.mainLogoBase64} style={styles.coverLogo} />
            </View>
          ) : null}

          <View
            style={[
              styles.coverInfoBox,
              { backgroundColor: primaryColor, opacity: 0.85 },
            ]}
          >
            <Text style={styles.coverEyebrow}>Tour Book</Text>
            <Text style={styles.coverTitle}>
              {tour.name || 'Untitled Tour'}
            </Text>
            <View style={styles.coverDivider} />
            <Text style={styles.coverDateText}>
              {subtitle || 'Custom Tour'}
            </Text>
          </View>
        </View>
      </Page>
    );
  },
);
