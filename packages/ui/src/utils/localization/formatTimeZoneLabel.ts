const timeZoneName = (timeZone: string, style: 'long' | 'longOffset') =>
  new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: style })
    .formatToParts()
    .find((part) => part.type === 'timeZoneName')?.value ?? timeZone;

/**
 * A select option label for an IANA time zone. Throws a RangeError for an unknown zone.
 * @example 'Europe/Paris' => '(GMT+01:00) Central European Standard Time - Paris'
 */
export const formatTimeZoneLabel = (ianaTimeZone: string) => {
  const offset = timeZoneName(ianaTimeZone, 'longOffset');
  const name = timeZoneName(ianaTimeZone, 'long');
  const label = name === offset ? `(${offset})` : `(${offset}) ${name}`;

  const location = ianaTimeZone.includes('/')
    ? ianaTimeZone.split('/').at(-1)?.replaceAll('_', ' ')
    : undefined;

  return !location || label.includes(location) ? label : `${label} - ${location}`;
};
