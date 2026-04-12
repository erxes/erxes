import React, { useMemo } from 'react';
import { Page, View, Image } from '@react-pdf/renderer';
import type { IBranchPDFData } from './types';
import { styles, COLORS } from './styles';
import { parseHtmlToPdfElements } from './htmlParser';

interface FooterPageProps {
  branch?: IBranchPDFData;
  content?: string;
  color?: string;
}

export const FooterPage: React.FC<FooterPageProps> = React.memo(
  ({ branch, content, color }) => {
    const primaryColor = color || COLORS.primary;

    const parsedContent = useMemo(
      () => parseHtmlToPdfElements(content || ''),
      [content],
    );

    return (
      <Page size="A4" style={styles.footerPage}>
        <View style={styles.pageHeader}>
          {branch?.mainLogoBase64 ? (
            <Image src={branch.mainLogoBase64} style={styles.pageHeaderLogo} />
          ) : null}
        </View>

        <View style={styles.footerPageContent}>
          <View style={styles.footerDivider} />

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
