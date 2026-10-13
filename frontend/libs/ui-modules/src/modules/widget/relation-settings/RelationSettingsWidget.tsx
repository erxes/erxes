import {
  IRelationSettingsModule,
  IRelationSettingsWidgetContext,
  useRelationSettingsWidget,
} from './relationSettingsWidgetContext';

// `pluginName.name`: what a host keys a tab by.
export const relationSettingsModuleKey = ({
  pluginName,
  name,
}: IRelationSettingsModule) => `${pluginName}.${name}`;

/**
 * The sections other plugins add to a settings page, for the host to show as
 * its own tabs. The host names only itself; which plugins show up is theirs.
 */
export const useRelationSettingsModules = () =>
  useRelationSettingsWidget().relationSettingsWidgetsModules;

export const RelationSettingsWidget = ({
  moduleKey,
  contentType,
  contentId,
  context,
}: {
  moduleKey: string;
  contentType: string;
  contentId: string;
  context: IRelationSettingsWidgetContext;
}) => {
  const { RelationSettingsWidget: Render, relationSettingsWidgetsModules } =
    useRelationSettingsWidget();
  const module = relationSettingsWidgetsModules.find(
    (candidate) => relationSettingsModuleKey(candidate) === moduleKey,
  );

  if (!module) {
    return null;
  }

  // Hosts often sit inside their own form; a plugin's sheets and forms must
  // never submit it, and React events bubble through portals to here.
  return (
    <div onSubmit={(event) => event.stopPropagation()}>
      <Render
        module={module.name}
        pluginName={module.pluginName}
        contentType={contentType}
        contentId={contentId}
        context={context}
      />
    </div>
  );
};
