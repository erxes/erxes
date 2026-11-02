import { useState } from 'react';
import { Button, Dialog, Input, Label, ScrollArea, Spinner } from 'erxes-ui';
import { IconExternalLink } from '@tabler/icons-react';
import { useInView } from 'react-intersection-observer';
import { useFormConversionTranslation } from '../conversionTranslations';
import type { useFormFieldConversion } from '../hooks/useFormFieldConversion';

export const FormConversionFeedback = ({
  check,
}: {
  check: ReturnType<typeof useFormFieldConversion>;
}) => {
  const { t, errorMessage } = useFormConversionTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { ref: bottomRef } = useInView({
    rootMargin: '100px',
    skip:
      !open ||
      !check.result?.hasMore ||
      check.checking ||
      check.loadingMore ||
      !!check.loadMoreError,
    onChange: (inView) => {
      if (inView) void check.loadMore();
    },
  });
  if (!check.enabled && !check.checking) return null;
  const { result, error, checking } = check;
  const failure = error ? errorMessage(error) ?? t('unavailable') : undefined;
  const status = checking
    ? t('checking')
    : failure ??
      (result
        ? result.invalidCount
          ? t('incompatible', {
              invalid: result.invalidCount,
              total: result.checkedCount,
            })
          : result.checkedCount
          ? t('compatible', { count: result.checkedCount })
          : t('empty')
        : t('checking'));
  return (
    <>
      <div
        className="space-y-2 rounded-md border bg-muted/30 p-3"
        aria-live="polite"
        aria-busy={checking}
      >
        <p
          className={`text-sm ${
            failure || result?.invalidCount ? 'text-destructive' : ''
          }`}
        >
          {status}
        </p>
        {checking && (
          <p className="text-xs text-muted-foreground">{t('checkingHelp')}</p>
        )}
        {!!result?.invalidCount && (
          <>
            <p className="text-xs text-muted-foreground">{t('blockedHelp')}</p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSearch(check.search);
                setOpen(true);
              }}
            >
              {t('review')}
            </Button>
          </>
        )}
        {failure && (
          <Button type="button" variant="secondary" onClick={check.retry}>
            {t('retry')}
          </Button>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="max-w-2xl max-h-[85vh] flex flex-col">
          <Dialog.Header>
            <Dialog.Title>{t('review')}</Dialog.Title>
            <Dialog.Description>{t('reviewHelp')}</Dialog.Description>
          </Dialog.Header>
          <div className="space-y-2">
            <Label htmlFor="conversion-answer-search">{t('search')}</Label>
            <div className="flex gap-2">
              <Input
                id="conversion-answer-search"
                value={search}
                maxLength={200}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    check.searchAnswers(search);
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={checking}
                onClick={() => check.searchAnswers(search)}
              >
                {t('searchAction')}
              </Button>
            </div>
          </div>
          {checking ? (
            <Spinner containerClassName="py-12" />
          ) : failure ? (
            <div role="alert" className="space-y-2">
              <p className="text-sm text-destructive">{failure}</p>
              <Button type="button" variant="secondary" onClick={check.retry}>
                {t('retry')}
              </Button>
            </div>
          ) : (
            result && (
              <>
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  {t('found', { count: result.matchingCount })}
                </p>
                {!result.examples.length ? (
                  <p className="py-6 text-sm text-center">{t('noMatches')}</p>
                ) : (
                  <ScrollArea
                    key={check.reviewKey}
                    className="h-[45vh] min-h-0 rounded-md border"
                  >
                    <ul className="divide-y">
                      {result.examples.map((example) => (
                        <li key={example.id} className="p-3 space-y-1">
                          <p className="break-words text-sm font-medium whitespace-pre-wrap">
                            {example.value}
                          </p>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs text-muted-foreground">
                              {t(
                                example.reason === 'TYPE'
                                  ? 'typeMismatch'
                                  : 'ruleMismatch',
                              )}
                            </p>
                            {example.submissionId && (
                              <Button
                                asChild
                                type="button"
                                variant="link"
                                size="sm"
                              >
                                <a
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  href={`/frontline/forms/submissions/${encodeURIComponent(
                                    check.formId ?? '',
                                  )}?submissionId=${encodeURIComponent(
                                    example.submissionId,
                                  )}`}
                                >
                                  {t('viewSubmission')}
                                  <IconExternalLink size={14} />
                                </a>
                              </Button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                    {check.loadMoreError ? (
                      <div role="alert" className="p-3 space-y-2">
                        <p className="text-sm text-destructive">
                          {errorMessage(check.loadMoreError) ??
                            t('loadMoreFailed')}
                        </p>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={check.retryLoadMore}
                        >
                          {t('retry')}
                        </Button>
                      </div>
                    ) : result.hasMore ? (
                      <div
                        ref={bottomRef}
                        role="status"
                        aria-label={t('loadingMore')}
                      >
                        <Spinner containerClassName="py-4" />
                      </div>
                    ) : (
                      <p className="p-3 text-xs text-center text-muted-foreground">
                        {t('allLoaded')}
                      </p>
                    )}
                  </ScrollArea>
                )}
              </>
            )
          )}
          <Dialog.Footer>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              {t('close')}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
