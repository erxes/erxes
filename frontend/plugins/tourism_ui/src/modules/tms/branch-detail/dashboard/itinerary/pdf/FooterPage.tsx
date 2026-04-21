import React, { useMemo } from 'react';
import { Page, View, Image, Text } from '@react-pdf/renderer';
import type {
  IBranchPDFData,
  ItineraryPdfRenderConfig,
  ItineraryPdfTemplate,
} from './types';
import { styles, COLORS } from './styles';
import { editorialStyles } from './editorialStyles';
import { parseHtmlToPdfElements } from './htmlParser';

interface FooterPageProps {
  branch?: IBranchPDFData;
  content?: string;
  color?: string;
  config: ItineraryPdfRenderConfig;
  template?: ItineraryPdfTemplate;
  itineraryName?: string;
  imageBase64?: string;
}

export const FooterPage: React.FC<FooterPageProps> = React.memo(
  ({
    branch,
    content,
    color,
    config,
    template = 'classic',
    itineraryName,
    imageBase64,
  }) => {
    const primaryColor = color || COLORS.primary;
    const accentPanelColor = withOpacity(primaryColor, 0.16);
    const accentFallbackColor = withOpacity(primaryColor, 0.1);

    const parsedContent = useMemo(
      () =>
        parseHtmlToPdfElements(content || '', {
          defaultAlignment: template === 'editorial' ? 'left' : 'center',
          forceAlignment: template === 'editorial' ? 'left' : undefined,
        }),
      [content, template],
    );
    const pageCounterLabel = config.labels.footerPageCounter || '';

    if (template === 'editorial') {
      return (
        <Page size="A4" style={editorialStyles.footerPage}>
          <View
            style={[
              editorialStyles.paperTextureBar,
              { backgroundColor: accentPanelColor },
            ]}
          />

          <View style={editorialStyles.footerBody}>
            <View style={editorialStyles.dayImageColumn}>
              <View
                style={[
                  editorialStyles.dayImageFrame,
                  { backgroundColor: accentPanelColor },
                ]}
              >
                {imageBase64 ? (
                  <Image src={imageBase64} style={editorialStyles.dayImage} />
                ) : (
                  <View
                    style={[
                      editorialStyles.dayImageFallback,
                      { backgroundColor: accentFallbackColor },
                    ]}
                  />
                )}
              </View>
            </View>

            <View style={editorialStyles.dayTextColumn}>
              <Text style={[editorialStyles.dayTitle, { color: primaryColor }]}>
                {config.labels.footerNotesTitle}
              </Text>
              <View
                style={[
                  editorialStyles.dayDivider,
                  { backgroundColor: primaryColor },
                ]}
              />

              {parsedContent.length > 0 ? (
                <View style={editorialStyles.footerNotesBlock}>
                  {parsedContent}
                </View>
              ) : null}
            </View>
          </View>

          <View style={editorialStyles.fixedFooter}>
            <Text style={editorialStyles.fixedFooterText}>
              {itineraryName || ''}
            </Text>
            <Text
              style={editorialStyles.fixedFooterText}
              render={({ pageNumber, totalPages }) =>
                formatPageCounter(pageCounterLabel, pageNumber, totalPages)
              }
            />
          </View>
        </Page>
      );
    }

    return (
      <Page size="A4" style={styles.footerPage}>
        <View style={styles.pageHeader}>
          {branch?.mainLogoBase64 ? (
            <Image src={branch.mainLogoBase64} style={styles.pageHeaderLogo} />
          ) : null}
          <Text style={styles.pageHeaderTitle}>
            {config.labels.footerNotesTitle}
          </Text>
          <View
            style={[
              styles.pageHeaderDivider,
              { backgroundColor: primaryColor },
            ]}
          />
        </View>

        <View style={styles.footerPageContent}>
          {parsedContent.length > 0 ? (
            <View style={styles.footerNotesBlock}>{parsedContent}</View>
          ) : null}
        </View>

        <View
          style={[styles.footerAccentBar, { backgroundColor: primaryColor }]}
        />
      </Page>
    );
  },
);

const normalizeHex = (hex: string): string | null => {
  const value = hex.trim().replace('#', '');

  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    return value
      .split('')
      .map((char) => char + char)
      .join('');
  }

  if (/^[0-9a-fA-F]{6}$/.test(value)) {
    return value;
  }

  return null;
};

const withOpacity = (input: string, opacity: number): string => {
  const hex = normalizeHex(input);

  if (hex) {
    const red = parseInt(hex.slice(0, 2), 16);
    const green = parseInt(hex.slice(2, 4), 16);
    const blue = parseInt(hex.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  }

  return input;
};

const formatPageCounter = (
  template: string,
  pageNumber: number,
  totalPages: number,
) =>
  template
    .replaceAll('{page}', String(pageNumber))
    .replaceAll('{total}', String(totalPages));
