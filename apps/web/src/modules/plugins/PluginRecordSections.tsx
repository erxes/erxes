import { PanelSection, Spinner, type TContactContentType, type TRecordSection } from 'erxes-ui';
import { type RefObject, Suspense, useLayoutEffect, useRef } from 'react';
import { PluginBoundary } from './PluginBoundary';
import { usePluginText } from './pluginText';
import { usePlugins } from './usePlugins';

/**
 * Hides the section around `body` while the plugin draws nothing in it (a customer who isn't a
 * candidate), so no heading stands over an empty space; it shows again once the plugin draws.
 */
const useHiddenWhileEmpty = (body: RefObject<HTMLElement | null>) =>
  useLayoutEffect(() => {
    const content = body.current;
    const section = content?.closest('section');

    if (!content || !section) return undefined;

    const update = () => {
      section.hidden = !content.hasChildNodes();
    };

    update();

    const observer = new MutationObserver(update);

    observer.observe(content, { childList: true });

    return () => observer.disconnect();
  }, [body]);

/** One plugin's section: its heading, then what it draws, kept apart if it crashes. */
const PluginRecordSection = ({
  plugin,
  section,
  contentType,
  contentId,
}: {
  plugin: string;
  section: TRecordSection;
  contentType: TContactContentType;
  contentId: string;
}) => {
  const Content = section.component;
  const text = usePluginText();
  const body = useRef<HTMLDivElement>(null);

  useHiddenWhileEmpty(body);

  return (
    <PanelSection title={text(plugin, section.title)} icon={section.icon}>
      <div ref={body} className="contents">
        <PluginBoundary name={plugin} compact resetKey={contentId}>
          <Suspense fallback={<Spinner size="sm" />}>
            <Content contentType={contentType} contentId={contentId} />
          </Suspense>
        </PluginBoundary>
      </div>
    </PanelSection>
  );
};

/**
 * What the plugins the member may use add to a customer or company (`recordSections` in their
 * `CONFIG`): the customer's deals, its orders, …, under core's own sections.
 */
export const PluginRecordSections = ({
  contentType,
  contentId,
}: {
  contentType: TContactContentType;
  contentId: string;
}) => {
  const { plugins } = usePlugins();

  return plugins.flatMap(({ remote, config }) =>
    config.recordSections
      .filter((section) => section.contentType === contentType)
      .map((section) => (
        <PluginRecordSection
          key={`${remote}:${section.title}`}
          plugin={config.name}
          section={section}
          contentType={contentType}
          contentId={contentId}
        />
      )),
  );
};
