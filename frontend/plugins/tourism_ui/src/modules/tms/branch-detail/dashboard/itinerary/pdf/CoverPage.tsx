import React from 'react';
import { Page, Text, View, Image } from '@react-pdf/renderer';
import type {
  IItineraryPDFData,
  IBranchPDFData,
  ItineraryPdfRenderConfig,
} from './types';
import { styles, COLORS } from './styles';

interface CoverPageProps {
  itinerary: IItineraryPDFData;
  branch?: IBranchPDFData;
  coverImageBase64?: string;
  config: ItineraryPdfRenderConfig;
}

export const CoverPage: React.FC<CoverPageProps> = React.memo(
  function CoverPage({ itinerary, branch, coverImageBase64, config }) {
    const primaryColor = itinerary.color || COLORS.primary;
    const title = itinerary.name || 'Untitled Itinerary';
    const duration = itinerary.duration;

    return (
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverContentWrapper}>
          {coverImageBase64 ? (
            <Image src={coverImageBase64} style={styles.coverBackgroundImage} />
          ) : (
            <View
              style={[
                styles.coverBackgroundImage,
                { backgroundColor: primaryColor },
              ]}
            />
          )}

          <View style={styles.coverDarkOverlay} />

          {branch?.mainLogoBase64 ? (
            <View style={styles.coverLogoContainer}>
              <Image src={branch.mainLogoBase64} style={styles.coverLogo} />
            </View>
          ) : null}

          <View
            style={[
              styles.coverOverlayBox,
              { backgroundColor: primaryColor, opacity: 0.85 },
            ]}
          >
            <Text style={styles.coverTitle}>{title}</Text>
            <View style={styles.coverDivider} />
            <Text style={styles.coverDateText}>
              {config.labels.coverDurationLabel}: {duration}{' '}
              {config.labels.coverDaysLabel}
            </Text>
          </View>
        </View>
      </Page>
    );
  },
);
