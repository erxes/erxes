import { StyleSheet } from '@react-pdf/renderer';
import { PDF_FONT_FAMILY } from './fonts';

export const COLORS = {
  primary: '#2a7c6f', // teal/green from reference design
  primaryDark: '#1e5c52',
  white: '#ffffff',
  black: '#1a1a1a',
  text: '#2d2d3a',
  textLight: '#555566',
  gray: '#999999',
  lightGray: '#e8e8e8',
  overlay: 'rgba(0, 0, 0, 0.45)',
};

export const styles = StyleSheet.create({
  /* ---- Cover Page ---- */
  coverPage: {
    fontFamily: PDF_FONT_FAMILY,
    padding: 0,
    margin: 0,
  },
  coverContentWrapper: {
    width: 595.28,
    height: 841.89,
    position: 'relative',
  },
  coverBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 595.28,
    height: 841.89,
  },
  coverDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 595.28,
    height: 841.89,
    backgroundColor: '#000000',
    opacity: 0.15,
  },
  coverLogoContainer: {
    position: 'absolute',
    top: 30,
    left: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coverLogo: {
    width: 40,
    height: 40,
    objectFit: 'contain',
  },
  coverBranchName: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: 9,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  coverAccentLine: {
    position: 'absolute',
    top: 55,
    left: 75,
    width: 80,
    height: 2,
    backgroundColor: COLORS.white,
  },
  coverOverlayBox: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    paddingVertical: 30,
    paddingHorizontal: 28,
    borderRadius: 4,
  },
  coverTitle: {
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 'bold',
    fontSize: 26,
    color: COLORS.white,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    lineHeight: 1.3,
    marginBottom: 14,
  },
  coverDivider: {
    width: 80,
    height: 2,
    backgroundColor: COLORS.white,
    alignSelf: 'center',
    marginBottom: 14,
  },
  coverDateText: {
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 13,
    color: COLORS.white,
    textAlign: 'center',
  },

  /* ---- Itinerary Pages ---- */
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: 10,
    color: COLORS.text,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 40,
    backgroundColor: COLORS.white,
  },
  pageHeader: {
    marginBottom: 8,
  },
  pageHeaderLogo: {
    width: 80,
    height: 35,
    objectFit: 'contain',
    marginBottom: 4,
  },
  pageHeaderTitle: {
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 6,
  },
  pageHeaderDivider: {
    height: 2,
    marginBottom: 16,
  },

  /* ---- Day Block ---- */
  dayBlock: {
    marginBottom: 24,
  },
  dayTitle: {
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 'bold',
    fontSize: 10,
    color: COLORS.black,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  dayTwoColumn: {
    flexDirection: 'row',
    gap: 16,
  },
  dayImageColumn: {
    width: '42%',
  },
  dayContentColumn: {
    width: '58%',
  },
  dayImageColumnWide: {
    width: '42%',
  },
  dayContentColumnWide: {
    width: '58%',
  },
  dayImage: {
    width: '100%',
    height: 150,
    objectFit: 'cover',
    borderRadius: 3,
  },
  dayContent: {
    fontSize: 9,
    color: COLORS.text,
    lineHeight: 1.6,
    textAlign: 'justify',
  },
  dayContentBold: {
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 'bold',
    fontSize: 9,
    color: COLORS.text,
  },
  dayNoImage: {
    width: '100%',
  },
  noItineraryText: {
    fontSize: 11,
    color: COLORS.gray,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 40,
  },

  /* ---- Footer Page ---- */
  footerPage: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: 10,
    color: COLORS.text,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 40,
    backgroundColor: COLORS.white,
    position: 'relative',
  },
  footerPageContent: {
    flex: 1,
  },
  footerDivider: {
    height: 2,
    backgroundColor: COLORS.lightGray,
    marginVertical: 20,
    alignSelf: 'center',
    width: '60%',
  },
  footerNotesBlock: {
    marginBottom: 14,
  },
  footerNotesText: {
    fontSize: 9,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 1.6,
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 'bold',
  },
  footerDefinitionText: {
    fontSize: 8.5,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 1.7,
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 'bold',
  },
  footerDisclaimer: {
    fontSize: 8.5,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 16,
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  footerAccentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 16,
  },

  /* ---- Page Footer (fixed) ---- */
  fixedFooter: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 6,
  },
  fixedFooterText: {
    fontSize: 7,
    color: COLORS.gray,
  },
});
