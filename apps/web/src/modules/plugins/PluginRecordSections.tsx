import { PanelSection, Spinner, type TContactContentType, type TRecordSection } from 'erxes-ui';
import { Suspense } from 'react';
import { PluginBoundary } from './PluginBoundary';
import { usePluginText } from './pluginText';
import { usePlugins } from './usePlugins';

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

  return (
    <PanelSection title={text(plugin, section.title)} icon={section.icon}>
      <PluginBoundary name={plugin} compact resetKey={contentId}>
        <Suspense fallback={<Spinner size="sm" />}>
          <Content contentType={contentType} contentId={contentId} />
        </Suspense>
      </PluginBoundary>
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
