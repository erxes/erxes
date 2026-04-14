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

    const parsedContent = useMemo(
      () =>
        parseHtmlToPdfElements(content || '', {
          defaultAlignment: template === 'editorial' ? 'left' : 'center',
          forceAlignment: template === 'editorial' ? 'left' : undefined,
        }),
      [content, template],
    );

    if (template === 'editorial') {
      return (
        <Page size="A4" style={editorialStyles.footerPage}>
          <View style={editorialStyles.paperTextureBar} />

          <View style={editorialStyles.footerBody}>
            <View style={editorialStyles.dayImageColumn}>
              <View style={editorialStyles.dayImageFrame}>
                {imageBase64 ? (
                  <Image src={imageBase64} style={editorialStyles.dayImage} />
                ) : (
                  <View style={editorialStyles.dayImageFallback} />
                )}
              </View>
            </View>

            <View style={editorialStyles.dayTextColumn}>
              <Text style={editorialStyles.dayTitle}>
                {config.labels.footerNotesTitle}
              </Text>
              <View style={editorialStyles.dayDivider} />

              {parsedContent.length > 0 ? (
                <View style={editorialStyles.footerNotesBlock}>
                  {parsedContent}
                </View>
              ) : null}
            </View>
          </View>

          <View style={editorialStyles.fixedFooter} fixed>
            <Text style={editorialStyles.fixedFooterText}></Text>
            <Text
              style={editorialStyles.fixedFooterText}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
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
            style={[styles.pageHeaderDivider, { backgroundColor: primaryColor }]}
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
