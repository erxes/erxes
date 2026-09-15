import { useMutation, useQuery } from '@apollo/client';
import { Button, Checkbox, Sheet, Textarea } from 'erxes-ui';
import { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CMS_POSTIZ_ENABLE,
  CMS_POSTIZ_OPTIONS,
  CMS_POSTIZ_SHARE,
  CMS_POSTIZ_VALIDATE,
  type PostizOptions,
  type PostizShareInput,
} from './graphql';
import { PostizDeliveryList } from './PostizDeliveryList';

interface Props {
  websiteId: string;
  language: string;
  initialCaption: string;
  images: string[];
  save: () => Promise<string>;
  onClose: (saved: boolean) => void;
}

export function PostizPublishSheet({
  websiteId,
  language,
  initialCaption,
  images,
  save,
  onClose,
}: Props) {
  const { t } = useTranslation('content');
  const captionId = useId();
  const [caption, setCaption] = useState(initialCaption.slice(0, 2800));
  const [channels, setChannels] = useState<string[]>([]);
  const [media, setMedia] = useState<string[]>([]);
  const [postId, setPostId] = useState('');
  const [queued, setQueued] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const busyRef = useRef(false);
  const savedId = useRef('');
  // A network retry must retain the exact request and content, even if the response was lost.
  const request = useRef<PostizShareInput>();
  const options = useQuery<{ cmsPostizOptions: PostizOptions }>(
    CMS_POSTIZ_OPTIONS,
    {
      variables: { clientPortalId: websiteId, language },
      fetchPolicy: 'network-only',
    },
  );
  const [enable] = useMutation(CMS_POSTIZ_ENABLE);
  const [share] = useMutation(CMS_POSTIZ_SHARE);
  const [validate] = useMutation(CMS_POSTIZ_VALIDATE);
  const connection = options.data?.cmsPostizOptions;
  const locked = busy || Boolean(request.current);

  async function submit(social: boolean) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError('');
    try {
      if (!savedId.current) {
        savedId.current = await save();
        setPostId(savedId.current);
      }
      if (!social) {
        onClose(true);
        return;
      }
      if (!request.current) {
        const input = {
          postId: savedId.current,
          requestId: crypto.randomUUID(),
          language,
          channelIds: channels,
          caption,
          media,
        };
        await validate({ variables: { input } });
        request.current = input;
      }
      await share({ variables: { input: request.current } });
      setQueued(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : t('cms-social-request-failed', {
              defaultValue: 'Could not complete this request. Try again.',
            }),
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function enableSharing() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError('');
    try {
      await enable({
        variables: { clientPortalId: websiteId, language, enabled: true },
      });
      await options.refetch();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : t('cms-social-enable-failed', {
              defaultValue: 'Could not enable CMS sharing.',
            }),
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open && !busyRef.current) onClose(Boolean(savedId.current));
      }}
    >
      <Sheet.View className="w-[calc(100vw-1rem)] sm:max-w-lg p-0 flex flex-col">
        <Sheet.Header className="h-auto items-start py-4 gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Sheet.Title>
              {t('cms-social-publish-title', { defaultValue: 'Publish post' })}
            </Sheet.Title>
            <Sheet.Description>
              {t('cms-social-publish-description', {
                defaultValue:
                  'Publish to your website and optionally share through this organization’s Postiz workspace.',
              })}
            </Sheet.Description>
          </div>
          {!busy && (
            <Sheet.Close
              aria-label={t('close', { defaultValue: 'Close' })}
              className="min-h-11 min-w-11"
            />
          )}
        </Sheet.Header>
        <Sheet.Content className="flex-1 overflow-y-auto p-4 space-y-5">
          {postId && (
            <p role="status" className="text-sm font-medium">
              {t('cms-social-cms-saved', {
                defaultValue: 'Your CMS post is published.',
              })}
            </p>
          )}
          {queued ? (
            <PostizDeliveryList postId={postId} language={language} />
          ) : (
            <>
              {options.loading && (
                <p role="status">
                  {t('cms-social-checking', {
                    defaultValue: 'Checking Postiz channels…',
                  })}
                </p>
              )}
              {options.error && (
                <div role="alert" className="space-y-2 text-sm">
                  <p>
                    {t('cms-social-unavailable', {
                      defaultValue:
                        'Postiz is unavailable or you do not have sharing access. You can still publish to the CMS.',
                    })}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11"
                    onClick={() =>
                      void options.refetch().catch(() => undefined)
                    }
                  >
                    {t('retry', { defaultValue: 'Retry' })}
                  </Button>
                </div>
              )}
              {connection && !connection.enabled && (
                <div className="space-y-3 text-sm">
                  <p>
                    {t('cms-social-disabled', {
                      defaultValue:
                        'CMS sharing is off for this Postiz workspace. A Postiz Admin can enable it.',
                    })}
                  </p>
                  {connection.canManage && (
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11"
                      disabled={busy}
                      onClick={enableSharing}
                    >
                      {t('cms-social-enable', {
                        defaultValue: 'Enable CMS sharing',
                      })}
                    </Button>
                  )}
                </div>
              )}
              {connection?.enabled && (
                <>
                  <fieldset disabled={locked} className="space-y-2">
                    <legend className="text-sm font-medium mb-2">
                      {t('cms-social-channels', { defaultValue: 'Channels' })}
                    </legend>
                    {!connection.channels.length && (
                      <p className="text-sm text-muted-foreground">
                        {t('cms-social-no-channels', {
                          defaultValue:
                            'Connect Facebook, Instagram, X, or LinkedIn in Postiz, then refresh this list.',
                        })}
                      </p>
                    )}
                    {connection.channels.map((channel) => (
                      <label
                        key={channel.id}
                        className="flex items-center gap-3 min-h-11 p-2 rounded border cursor-pointer"
                      >
                        <Checkbox
                          disabled={
                            locked ||
                            !channel.usable ||
                            (!channels.includes(channel.id) &&
                              channels.length >= 10)
                          }
                          checked={channels.includes(channel.id)}
                          onCheckedChange={(checked) =>
                            setChannels((current) =>
                              checked === true
                                ? [...current, channel.id]
                                : current.filter((id) => id !== channel.id),
                            )
                          }
                        />
                        <span className="min-w-0 flex-1 break-words text-sm">
                          {channel.name}
                          <span className="block text-muted-foreground">
                            {channel.provider}
                            {!channel.usable &&
                              ` · ${t('cms-social-reconnect', {
                                defaultValue: 'Reconnect in Postiz',
                              })}`}
                          </span>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  <div className="space-y-2">
                    <label htmlFor={captionId} className="text-sm font-medium">
                      {t('cms-social-caption', {
                        defaultValue: 'Social caption',
                      })}
                    </label>
                    <Textarea
                      id={captionId}
                      value={caption}
                      disabled={locked}
                      onChange={(event) => setCaption(event.target.value)}
                      maxLength={2800}
                      rows={5}
                      aria-describedby={`${captionId}-help`}
                    />
                    <p
                      id={`${captionId}-help`}
                      className="text-sm text-muted-foreground"
                    >
                      {t('cms-social-caption-help', {
                        defaultValue:
                          'Your public article link is added automatically. Each channel’s character and media limits still apply.',
                      })}
                    </p>
                  </div>
                  {!!images.length && (
                    <fieldset disabled={locked} className="space-y-2">
                      <legend className="text-sm font-medium mb-2">
                        {t('cms-social-images', {
                          defaultValue: 'Images (up to 4)',
                        })}
                      </legend>
                      {images.map((url, index) => (
                        <label
                          key={url}
                          className="flex items-center gap-3 min-h-11 p-2 border rounded"
                        >
                          <Checkbox
                            disabled={
                              locked ||
                              (!media.includes(url) && media.length >= 4)
                            }
                            checked={media.includes(url)}
                            onCheckedChange={(checked) =>
                              setMedia((current) =>
                                checked === true
                                  ? [...current, url]
                                  : current.filter((item) => item !== url),
                              )
                            }
                          />
                          <img
                            src={url}
                            alt=""
                            className="size-14 object-cover rounded"
                            loading="lazy"
                          />
                          <span className="text-sm">
                            {t('cms-social-image-number', {
                              defaultValue: 'Image {{number}}',
                              number: index + 1,
                            })}
                          </span>
                        </label>
                      ))}
                    </fieldset>
                  )}
                </>
              )}
            </>
          )}
          {error && (
            <div role="alert" className="text-sm text-destructive space-y-1">
              <p>{error}</p>
              {request.current && (
                <p>
                  {t('cms-social-retry-same', {
                    defaultValue:
                      'Retry uses the same request to avoid duplicates. Check delivery history before starting a new share.',
                  })}
                </p>
              )}
            </div>
          )}
        </Sheet.Content>
        <div className="border-t p-4 flex flex-col sm:flex-row gap-2">
          {queued ? (
            <Button
              type="button"
              className="min-h-11"
              onClick={() => onClose(true)}
            >
              {t('done', { defaultValue: 'Done' })}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={busy}
                onClick={() => void submit(false)}
              >
                {postId
                  ? t('cms-social-close', { defaultValue: 'Close' })
                  : t('cms-social-cms-only', {
                      defaultValue: 'Publish to CMS only',
                    })}
              </Button>
              <Button
                type="button"
                className="min-h-11"
                disabled={
                  busy ||
                  (!request.current &&
                    (!connection?.enabled ||
                      !channels.length ||
                      !caption.trim()))
                }
                onClick={() => void submit(true)}
              >
                {busy
                  ? t('cms-social-publishing', { defaultValue: 'Saving…' })
                  : postId
                    ? t('cms-social-send', { defaultValue: 'Send to Postiz' })
                    : t('cms-social-publish-share', {
                        defaultValue: 'Publish and share',
                      })}
              </Button>
            </>
          )}
        </div>
      </Sheet.View>
    </Sheet>
  );
}
