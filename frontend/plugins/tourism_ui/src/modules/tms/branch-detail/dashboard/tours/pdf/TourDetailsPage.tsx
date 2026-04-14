import React, { useMemo } from 'react';
import { Image, Page, Text, View } from '@react-pdf/renderer';
import { parseHtmlToPdfElements } from '../../itinerary/pdf/htmlParser';
import { stripHtml } from '../../itinerary/pdf/utils';
import type { IBranchPDFData } from '../../itinerary/pdf/types';
import type {
  ITourItineraryPDFData,
  ITourPDFData,
  TourPdfRenderConfig,
} from './types';
import { COLORS, sharedStyles, styles } from './styles';

interface TourDetailsPageProps {
  tour: ITourPDFData;
  itinerary?: ITourItineraryPDFData | null;
  branch?: IBranchPDFData;
  config: TourPdfRenderConfig;
}

interface PricingFact {
  label: string;
  value: string;
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
});

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return dateFormatter.format(date);
};

const formatPrice = (value?: number) => {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPaxRange = (
  minPersons?: number,
  maxPersons?: number,
  labels?: TourPdfRenderConfig['labels'],
) => {
  if (!minPersons && !maxPersons) return '';
  if (minPersons && maxPersons) {
    return `${minPersons}-${maxPersons} ${labels?.paxSuffixLabel || 'pax'}`;
  }
  if (minPersons) return `${minPersons}+ ${labels?.paxSuffixLabel || 'pax'}`;
  return `${labels?.upToLabel || 'Up to'} ${maxPersons} ${
    labels?.paxSuffixLabel || 'pax'
  }`;
};

const InfoSection = ({
  title,
  value,
  themeColor,
}: {
  title: string;
  value?: string;
  themeColor: string;
}) => {
  const parsedContent = useMemo(
    () => parseHtmlToPdfElements(value || ''),
    [value],
  );

  if (!value || !stripHtml(value)) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeadingRow}>
        <View
          style={[styles.sectionAccentBar, { backgroundColor: themeColor }]}
        />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>
        {parsedContent.length > 0 ? (
          parsedContent
        ) : (
          <Text style={styles.fallbackBodyText}>{stripHtml(value)}</Text>
        )}
      </View>
    </View>
  );
};

export const TourDetailsPage: React.FC<TourDetailsPageProps> = React.memo(
  function TourDetailsPage({ tour, itinerary, branch, config }) {
    const themeColor = itinerary?.color || COLORS.primary;
    const formatDurationValue = (value?: number) => {
      if (typeof value !== 'number') {
        return '-';
      }

      return `${value} ${
        value === 1
          ? config.labels.coverDaySingularLabel
          : config.labels.coverDayPluralLabel
      }`;
    };
    const travelDateLabel =
      tour.dateType === 'flexible'
        ? config.labels.overviewAvailableRangeLabel
        : config.labels.overviewTravelDatesLabel;
    const travelDateValue =
      tour.dateType === 'flexible'
        ? `${formatDate(tour.availableFrom)} - ${formatDate(tour.availableTo)}`
        : `${formatDate(tour.startDate)} - ${formatDate(tour.endDate)}`;
    const currencySymbol = tour.currencySymbol || '$';
    const overview = [
      {
        label: config.labels.overviewReferenceLabel,
        value: tour.refNumber || '-',
      },
      {
        label: config.labels.overviewDurationLabel,
        value:
          typeof tour.duration === 'number'
            ? formatDurationValue(tour.duration)
            : typeof itinerary?.duration === 'number'
            ? formatDurationValue(itinerary.duration)
            : '-',
      },
      {
        label: travelDateLabel,
        value: travelDateValue,
      },
      {
        label: config.labels.overviewGroupSizeLabel,
        value: tour.groupSize ? `${tour.groupSize}` : '-',
      },
    ];
    const infoSections = [
      { title: config.labels.summarySectionTitle, value: tour.content },
      { title: config.labels.includedSectionTitle, value: tour.info1 },
      { title: config.labels.notIncludedSectionTitle, value: tour.info2 },
      { title: config.labels.highlightsSectionTitle, value: tour.info3 },
      {
        title: config.labels.additionalInfoSectionTitle,
        value: tour.info4,
      },
    ];

    const pricingOptions = tour.pricingOptions || [];

    return (
      <Page size="A4" style={styles.page} wrap>
        <View style={sharedStyles.pageHeader} fixed>
          {branch?.mainLogoBase64 ? (
            <Image
              src={branch.mainLogoBase64}
              style={sharedStyles.pageHeaderLogo}
            />
          ) : null}
          <Text style={sharedStyles.pageHeaderTitle}>
            {config.labels.detailsPageHeaderTitle}
          </Text>
          <View
            style={[
              sharedStyles.pageHeaderDivider,
              { backgroundColor: themeColor },
            ]}
          />
        </View>

        <View style={sharedStyles.fixedFooter} fixed>
          <Text style={sharedStyles.fixedFooterText}>
            {tour.name || config.labels.untitledTourTitle}
          </Text>
          <Text
            style={sharedStyles.fixedFooterText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>

        <View style={styles.introSection}>
          <Text style={[styles.overviewEyebrow, { color: themeColor }]}>
            {config.labels.detailsIntroEyebrow}
          </Text>
          <View
            style={[styles.titleDivider, { backgroundColor: themeColor }]}
          />
        </View>

        <View style={styles.metaGrid}>
          {overview.map((item) => (
            <View key={item.label} style={styles.metaCard}>
              <Text style={styles.metaLabel}>{item.label}</Text>
              <Text style={styles.metaValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionDivider} />

        {pricingOptions.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeadingRow}>
              <View
                style={[
                  styles.sectionAccentBar,
                  { backgroundColor: themeColor },
                ]}
              />
              <Text style={styles.sectionTitle}>
                {config.labels.pricingSectionTitle}
              </Text>
            </View>
            {pricingOptions.map((option, index) => {
              const pricingFacts: PricingFact[] = [
                typeof option.pricePerPerson === 'number'
                  ? {
                      label: config.labels.pricingPerPersonLabel,
                      value: `${currencySymbol}${formatPrice(
                        option.pricePerPerson,
                      )}`,
                    }
                  : null,
                option.accommodationType
                  ? {
                      label: config.labels.pricingAccommodationLabel,
                      value: option.accommodationType,
                    }
                  : null,
                typeof option.domesticFlightPerPerson === 'number'
                  ? {
                      label: config.labels.pricingDomesticFlightLabel,
                      value: `${currencySymbol}${formatPrice(
                        option.domesticFlightPerPerson,
                      )}`,
                    }
                  : null,
                typeof option.singleSupplement === 'number'
                  ? {
                      label: config.labels.pricingSingleSupplementLabel,
                      value: `${currencySymbol}${formatPrice(
                        option.singleSupplement,
                      )}`,
                    }
                  : null,
              ].filter((fact): fact is PricingFact => Boolean(fact));

              return (
                <View key={option._id} style={styles.pricingCard}>
                  <View style={styles.pricingHeaderRow}>
                    <Text style={styles.pricingTitle}>
                      {option.title || config.labels.pricingUntitledOptionLabel}
                    </Text>
                    <Text style={[styles.pricingRange, { color: themeColor }]}>
                      {formatPaxRange(
                        option.minPersons,
                        option.maxPersons,
                        config.labels,
                      )}
                    </Text>
                  </View>

                  <View style={styles.pricingBodyRow}>
                    {pricingFacts.map((fact) => (
                      <View key={fact.label} style={styles.pricingFact}>
                        <Text style={styles.pricingFactLabel}>
                          {fact.label}
                        </Text>
                        <Text style={styles.pricingFactValue}>
                          {fact.value}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {option.note ? (
                    <Text style={styles.pricingNote}>
                      {stripHtml(option.note)}
                    </Text>
                  ) : null}

                  {index < pricingOptions.length - 1 ? (
                    <View style={styles.pricingDivider} />
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}

        {infoSections.map((section, index) => (
          <View key={section.title}>
            <InfoSection
              title={section.title}
              value={section.value}
              themeColor={themeColor}
            />
            {index < infoSections.length - 1 ? (
              <View style={styles.sectionDivider} />
            ) : null}
          </View>
        ))}
      </Page>
    );
  },
);
