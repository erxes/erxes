import React, { useMemo } from 'react';
import { Text, View, Image } from '@react-pdf/renderer';
import type { IGroupDayWithImages, ItineraryPdfRenderConfig } from './types';
import { styles } from './styles';
import { stripHtml } from './utils';

interface DayBlockProps {
  groupDay: IGroupDayWithImages;
  index: number;
  config: ItineraryPdfRenderConfig;
}

const splitParagraphs = (text: string): string[] =>
  text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const normalizeBulletSpacing = (text: string) =>
  text.replace(/(^|\n)\s*•(?!\s)/g, '$1• ');

const parseBoldSegments = (
  text: string,
): Array<{ text: string; bold: boolean }> => {
  const segments: Array<{ text: string; bold: boolean }> = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false });
  }

  return segments.length > 0 ? segments : [{ text, bold: false }];
};

export const DayBlock: React.FC<DayBlockProps> = React.memo(
  ({ groupDay, index, config }) => {
    const plainContent = useMemo(
      () => normalizeBulletSpacing(stripHtml(groupDay.content)),
      [groupDay.content],
    );
    const paragraphs = useMemo(
      () => splitParagraphs(plainContent),
      [plainContent],
    );
    const image = groupDay.base64Images?.[0];
    const resolvedElements = useMemo(
      () => groupDay.resolvedElements || [],
      [groupDay.resolvedElements],
    );
    const resolvedAmenities = useMemo(
      () => groupDay.resolvedAmenities || [],
      [groupDay.resolvedAmenities],
    );
    const dayNumber = groupDay.day ?? index + 1;
    const isImageLeft = index % 2 === 0;

    const titleParts = useMemo(
      () =>
        [
          `${config.labels.dayLabel} ${dayNumber}.`,
          (groupDay.title || 'UNTITLED').toUpperCase(),
        ]
          .filter(Boolean)
          .join(' '),
      [config.labels.dayLabel, dayNumber, groupDay.title],
    );

    const contentView = useMemo(
      () => (
        <View style={styles.dayContentGroup}>
          {config.showDayContent && paragraphs.length > 0 ? (
            <View style={styles.daySection}>
              <Text style={styles.daySectionTitle}>
                {config.labels.dayOverviewTitle}
              </Text>
              {paragraphs.map((paragraph, paragraphIndex) => {
                const contentSegments = parseBoldSegments(paragraph);

                return (
                  <Text
                    key={`day-${dayNumber}-paragraph-${paragraphIndex}`}
                    style={[
                      styles.dayContent,
                      ...(paragraphIndex < paragraphs.length - 1
                        ? [styles.dayContentParagraph]
                        : []),
                    ]}
                  >
                    {contentSegments.map((seg, i) =>
                      seg.bold ? (
                        <Text
                          key={`day-${dayNumber}-paragraph-${paragraphIndex}-seg-${i}-${seg.text.slice(
                            0,
                            16,
                          )}`}
                          style={styles.dayContentBold}
                        >
                          {seg.text}
                        </Text>
                      ) : (
                        <Text
                          key={`day-${dayNumber}-paragraph-${paragraphIndex}-seg-${i}-${seg.text.slice(
                            0,
                            16,
                          )}`}
                        >
                          {seg.text}
                        </Text>
                      ),
                    )}
                  </Text>
                );
              })}
            </View>
          ) : null}

          {config.showElements && resolvedElements.length > 0 ? (
            <View style={styles.daySection}>
              <Text style={styles.daySectionTitle}>
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
                    key={`day-${dayNumber}-element-${
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
            <View style={styles.daySection}>
              {resolvedAmenities.map((amenity, amenityIndex) => (
                <Text
                  key={`day-${dayNumber}-amenity-${
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
      ),
      [
        config.showAmenities,
        config.showDayContent,
        config.showElements,
        config.labels.dayActivitiesTitle,
        config.labels.dayOverviewTitle,
        dayNumber,
        paragraphs,
        resolvedAmenities,
        resolvedElements,
      ],
    );

    if (!image) {
      return (
        <View style={styles.dayBlock} wrap={false}>
          <Text style={styles.dayTitle}>{titleParts}</Text>
          <View style={styles.dayNoImage}>{contentView}</View>
        </View>
      );
    }

    return (
      <View style={styles.dayBlock} wrap={false}>
        <View style={styles.dayTwoColumn}>
          {isImageLeft ? (
            <>
              <View style={styles.dayImageColumn}>
                <Text style={styles.dayTitle}>{titleParts}</Text>
                <Image src={image} style={styles.dayImage} />
              </View>
              <View style={styles.dayContentColumn}>{contentView}</View>
            </>
          ) : (
            <>
              <View style={styles.dayContentColumnWide}>{contentView}</View>
              <View style={styles.dayImageColumnWide}>
                <Text style={styles.dayTitle}>{titleParts}</Text>
                <Image src={image} style={styles.dayImage} />
              </View>
            </>
          )}
        </View>
      </View>
    );
  },
);
