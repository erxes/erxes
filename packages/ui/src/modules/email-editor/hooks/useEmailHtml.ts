import type { JSONContent } from '@tiptap/core';
import { useEffect, useState } from 'react';
import { renderEmailHtml } from '../utils/renderEmailHtml';

/** The email as html, following the content while it is being written. */
export const useEmailHtml = (
  contentJson?: JSONContent,
  previewText?: string,
) => {
  const [html, setHtml] = useState('');
  const [error, setError] = useState<Error>();

  useEffect(() => {
    // Rendering is async, so an older render must not land after a newer one.
    let current = true;

    renderEmailHtml(contentJson, { previewText })
      .then((rendered) => {
        if (current) {
          setHtml(rendered);
          setError(undefined);
        }
      })
      .catch((renderError: Error) => {
        if (current) {
          setError(renderError);
        }
      });

    return () => {
      current = false;
    };
  }, [contentJson, previewText]);

  return { html, error };
};
