import React, { useMemo } from 'react';
import { Text, View, Image } from '@react-pdf/renderer';
import type { IGroupDayWithImages } from './types';
import { styles } from './styles';
import { stripHtml } from './utils';

interface DayBlockProps {
  groupDay: IGroupDayWithImages;
  index: number;
}

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
  ({ groupDay, index }) => {
    const plainContent = useMemo(
      () => stripHtml(groupDay.content),
      [groupDay.content],
    );
    const image = groupDay.base64Images?.[0];
    const dayNumber = groupDay.day ?? index + 1;
    const isImageLeft = index % 2 === 0;

    const titleParts = useMemo(
      () =>
        [`DAY ${dayNumber}.`, (groupDay.title || 'UNTITLED').toUpperCase()]
          .filter(Boolean)
          .join(' '),
      [dayNumber, groupDay.title],
    );

    const contentSegments = useMemo(
      () => parseBoldSegments(plainContent),
      [plainContent],
    );

    const contentView = useMemo(
      () => (
        <Text style={styles.dayContent}>
          {contentSegments.map((seg, i) =>
            seg.bold ? (
              <Text key={i} style={styles.dayContentBold}>
                {seg.text}
              </Text>
            ) : (
              <Text key={i}>{seg.text}</Text>
            ),
          )}
        </Text>
      ),
      [contentSegments],
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
        <Text style={styles.dayTitle}>{titleParts}</Text>
        <View style={styles.dayTwoColumn}>
          {isImageLeft ? (
            <>
              <View style={styles.dayImageColumn}>
                <Image src={image} style={styles.dayImage} />
              </View>
              <View style={styles.dayContentColumn}>{contentView}</View>
            </>
          ) : (
            <>
              <View style={styles.dayContentColumnWide}>{contentView}</View>
              <View style={styles.dayImageColumnWide}>
                <Image src={image} style={styles.dayImage} />
              </View>
            </>
          )}
        </View>
      </View>
    );
  },
);
