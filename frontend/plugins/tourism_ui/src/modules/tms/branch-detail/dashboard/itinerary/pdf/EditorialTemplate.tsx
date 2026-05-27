import React, { useMemo } from 'react';
import { Image, Page, Text, View } from '@react-pdf/renderer';
import type {
  IBranchPDFData,
  IGroupDayWithImages,
  IItineraryPDFData,
} from './types';
import { editorialStyles as styles } from './editorialStyles';
import { stripHtml } from './utils';

const splitParagraphs = (text: string): string[] =>
  text
    .split(/\n+/)
    .map((paragraph) =>
      paragraph
        .replaceAll(/^[\s*•-]+/g, '')
        .replaceAll(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean);

const EditorialMasthead: React.FC<{
  branch?: IBranchPDFData;
  itineraryName?: string;
}> = React.memo(function EditorialMasthead({ branch, itineraryName }) {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.headerLogoRow}>
        {branch?.mainLogoBase64 ? (
          <Image src={branch.mainLogoBase64} style={styles.pageHeaderLogo} />
        ) : null}
      </View>

      {itineraryName ? (
        <View style={styles.itineraryNameBanner}>
          <Text style={styles.itineraryNameText}>{itineraryName}</Text>
          <Text style={styles.itineraryNameSubtext}>
            Day-by-day travel plan
          </Text>
          <View style={styles.itineraryNameDivider} />
        </View>
      ) : null}
    </View>
  );
});

const EditorialPageFooter: React.FC<{
  name: string;
}> = React.memo(function EditorialPageFooter({ name }) {
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
});

const EditorialDayBlock: React.FC<{
  groupDay: IGroupDayWithImages;
  index: number;
}> = React.memo(function EditorialDayBlock({ groupDay, index }) {
  const plainContent = useMemo(
    () => stripHtml(groupDay.content),
    [groupDay.content],
  );
  const paragraphs = useMemo(
    () => splitParagraphs(plainContent),
    [plainContent],
  );
  const dayNumber = groupDay.day ?? index + 1;
  const image = groupDay.base64Images?.[0];
  const isImageRight = index % 2 === 1;

  return (
    <View style={styles.dayBlock} wrap={false}>
      <View
        style={[
          styles.dayLayout,
          ...(isImageRight ? [styles.dayBlockReverse] : []),
        ]}
      >
        <View style={styles.dayImageColumn}>
          <View style={styles.dayImageFrame}>
            {image ? (
              <Image src={image} style={styles.dayImage} />
            ) : (
              <View style={styles.dayImageFallback} />
            )}
          </View>
          <View style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>Day {dayNumber}</Text>
          </View>
        </View>

        <View style={styles.dayTextColumn}>
          <Text style={styles.dayTitle}>
            {groupDay.title || `Day ${dayNumber}`}
          </Text>
          <View style={styles.dayDivider} />

          <View style={styles.dayContentGroup}>
            {paragraphs.map((paragraph, paragraphIndex) => (
              <Text
                key={`editorial-day-${dayNumber}-paragraph-${paragraphIndex}`}
                style={[
                  styles.dayContent,
                  ...(paragraphIndex < paragraphs.length - 1
                    ? [styles.dayContentParagraph]
                    : []),
                ]}
              >
                {paragraph}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
});

export const EditorialItineraryPage: React.FC<{
  itinerary: IItineraryPDFData;
  branch?: IBranchPDFData;
}> = React.memo(function EditorialItineraryPage({ itinerary, branch }) {
  const groupDays = itinerary.groupDays ?? [];
  const itineraryName = itinerary.name || 'Untitled Itinerary';

  return (
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.paperTextureBar} />
      <EditorialMasthead branch={branch} itineraryName={itineraryName} />

      {groupDays.length === 0 ? (
        <Text style={styles.noItineraryText}>
          No daily itinerary has been added yet.
        </Text>
      ) : (
        groupDays.map((day, idx) => (
          <EditorialDayBlock
            key={`editorial-day-${day.day ?? idx}`}
            groupDay={day}
            index={idx}
          />
        ))
      )}

      <EditorialPageFooter name={itineraryName} />
    </Page>
  );
});
