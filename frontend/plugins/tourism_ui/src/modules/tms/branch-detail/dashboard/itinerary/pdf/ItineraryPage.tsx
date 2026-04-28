import React from 'react';
import { Page, Text, View, Image } from '@react-pdf/renderer';
import type {
  IItineraryPDFData,
  IBranchPDFData,
  ItineraryPdfRenderConfig,
} from './types';
import { DEFAULT_ITINERARY_PDF_CONFIG } from './types';
import { styles, COLORS } from './styles';
import { DayBlock } from './DayBlock';

interface ItineraryPageProps {
  itinerary: IItineraryPDFData;
  branch?: IBranchPDFData;
  config?: ItineraryPdfRenderConfig;
}

const PageHeaderSection: React.FC<{
  branch?: IBranchPDFData;
  primaryColor: string;
  title: string;
}> = React.memo(function PageHeaderSection({ branch, primaryColor, title }) {
  return (
    <View style={styles.pageHeader} fixed>
      {branch?.mainLogoBase64 ? (
        <Image src={branch.mainLogoBase64} style={styles.pageHeaderLogo} />
      ) : null}
      <Text style={styles.pageHeaderTitle}>{title}</Text>
      <View
        style={[styles.pageHeaderDivider, { backgroundColor: primaryColor }]}
      />
    </View>
  );
});

const PageFooterSection: React.FC<{ name: string }> = React.memo(
  function PageFooterSection({ name }) {
    return (
      <View style={styles.fixedFooter} fixed>
        <Text style={styles.fixedFooterText}>{name}</Text>
        <Text
          style={styles.fixedFooterText}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </View>
    );
  },
);

export const ItineraryPage: React.FC<ItineraryPageProps> = React.memo(
  function ItineraryPage({ itinerary, branch, config }) {
    const resolvedConfig = config || DEFAULT_ITINERARY_PDF_CONFIG;
    const groupDays = itinerary.groupDays ?? [];
    const primaryColor = itinerary.color || COLORS.primary;
    const name = itinerary.name || 'Untitled Itinerary';

    return (
      <Page size="A4" style={styles.page} wrap>
        <PageHeaderSection
          branch={branch}
          primaryColor={primaryColor}
          title={resolvedConfig.labels.pageHeaderTitle}
        />
        <PageFooterSection name={name} />

        {groupDays.length === 0 ? (
          <Text style={styles.noItineraryText}>
            No daily itinerary has been added yet.
          </Text>
        ) : (
          groupDays.map((day, idx) => (
            <DayBlock
              key={`day-${day.day ?? idx}`}
              groupDay={day}
              index={idx}
              config={resolvedConfig}
            />
          ))
        )}
      </Page>
    );
  },
);
