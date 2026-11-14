import { REFERENCE_PATTERN } from '@erxes/core-contract';

const REFERENCE_PREFIX = '#erxes-ref-';

const REFERENCE_HREF = /^#erxes-ref-[\w-]{1,64}$/;

const PARTIAL_REFERENCE = /\[(\[(r(e(f(:[\w-]*)?)?)?)?)?$/;

export const withReferenceLinks = (text: string, streaming: boolean) =>
  (streaming ? text.replace(PARTIAL_REFERENCE, '') : text).replace(
    REFERENCE_PATTERN,
    (_token, handle: string) => `[record](${REFERENCE_PREFIX}${handle})`,
  );

export const isReferenceHref = (href: string) => REFERENCE_HREF.test(href);

export const referenceOfHref = (href: string | undefined) =>
  href && isReferenceHref(href) ? href.slice(REFERENCE_PREFIX.length) : null;
