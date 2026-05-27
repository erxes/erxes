import React, { useMemo } from 'react';
import { Image, Page, Text, View } from '@react-pdf/renderer';
import type {
  IBranchPDFData,
  IGroupDayWithImages,
  IItineraryPDFData,
  ItineraryPdfRenderConfig,
} from './types';
import { editorialStyles as styles } from './editorialStyles';
import { stripHtml } from './utils';

const normalizeBulletSpacing = (text: string) =>
  text.replace(/^\s*•(?!\s)/, '• ');

const splitParagraphs = (text: string): string[] =>
  text
    .split(/\n+/)
    .map((paragraph) =>
      paragraph
        .replace(/^\s*-\s*/, '• ')
        .replace(/^\s*•(?!\s)/, '• ')
        .replaceAll(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean);

const EditorialMasthead: React.FC<{
  branch?: IBranchPDFData;
  itineraryName?: string;
  config: ItineraryPdfRenderConfig;
}> = React.memo(function EditorialMasthead({ branch, itineraryName, config }) {
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
            {config.labels.pageHeaderTitle}
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
  config: ItineraryPdfRenderConfig;
}> = React.memo(function EditorialDayBlock({ groupDay, index, config }) {
  const plainContent = useMemo(
    () => normalizeBulletSpacing(stripHtml(groupDay.content)),
    [groupDay.content],
  );
  const paragraphs = useMemo(
    () => splitParagraphs(plainContent),
    [plainContent],
  );
  const dayNumber = groupDay.day ?? index + 1;
  const image = groupDay.base64Images?.[0];
  const resolvedElements = groupDay.resolvedElements || [];
  const resolvedAmenities = groupDay.resolvedAmenities || [];
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
            <Text style={styles.dayBadgeText}>
              {config.labels.dayLabel} {dayNumber}
            </Text>
          </View>
        </View>

        <View style={styles.dayTextColumn}>
          <Text style={styles.dayTitle}>
            {groupDay.title || `${config.labels.dayLabel} ${dayNumber}`}
          </Text>
          <View style={styles.dayDivider} />

          <View style={styles.dayContentGroup}>
            {config.showDayContent
              ? paragraphs.map((paragraph, paragraphIndex) => (
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
                ))
              : null}

            {config.showElements && resolvedElements.length > 0 ? (
              <View style={styles.dayElementsGroup}>
                <Text style={styles.dayElementsTitle}>
                  {config.labels.dayActivitiesTitle}
                </Text>
                {resolvedElements.map((element, elementIndex) => {
                  const meta = [
                    element.startTime,
                    element.duration ? `${element.duration} min` : '',
                  ]
                    .filter(Boolean)
                    .join(' • ');
                  const description = stripHtml(
                    element.note || element.content || '',
                  );
                  const title = element.name || `Activity ${elementIndex + 1}`;

                  return (
                    <View
                      key={`editorial-day-${dayNumber}-element-${
                        element._id || elementIndex
                      }`}
                      style={styles.dayElementItem}
                    >
                      <Text style={styles.dayElementTitle}>
                        • {title}
                        {meta ? (
                          <Text
                            style={styles.dayElementMeta}
                          >{` (${meta})`}</Text>
                        ) : null}
                      </Text>
                      {description ? (
                        <Text style={styles.dayElementDescription}>
                          {description}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ) : null}

            {config.showAmenities && resolvedAmenities.length > 0 ? (
              <View style={styles.dayElementsGroup}>
                {resolvedAmenities.map((amenity, amenityIndex) => (
                  <Text
                    key={`editorial-day-${dayNumber}-amenity-${
                      amenity._id || amenityIndex
                    }`}
                    style={styles.dayAmenityItem}
                  >
                    • {amenity.name || `Amenity ${amenityIndex + 1}`}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
});

export const EditorialItineraryPage: React.FC<{
  itinerary: IItineraryPDFData;
  branch?: IBranchPDFData;
  config: ItineraryPdfRenderConfig;
}> = React.memo(function EditorialItineraryPage({ itinerary, branch, config }) {
  const groupDays = itinerary.groupDays ?? [];
  const itineraryName = itinerary.name || 'Untitled Itinerary';

  return (
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.paperTextureBar} />
      <EditorialMasthead
        branch={branch}
        itineraryName={itineraryName}
        config={config}
      />

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
            config={config}
          />
        ))
      )}

      <EditorialPageFooter name={itineraryName} />
    </Page>
  );
});
