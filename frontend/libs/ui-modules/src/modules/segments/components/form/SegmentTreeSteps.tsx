import { Breadcrumb } from 'erxes-ui';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useSegmentTreeSteps } from '../../hooks/useSegmentTreeSteps';
import { TNodePath } from '../../types';
import { SegmentGroup } from './SegmentGroup';

export const SegmentTreeSteps = ({ root = 'root' }: { root?: TNodePath }) => {
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });
  const { openPath, crumbs, enter, leaveTo } = useSegmentTreeSteps(root);

  return (
    <div className="pt-4">
      <Breadcrumb className="pb-2">
        <Breadcrumb.List>
          {crumbs.map((crumb, position) => {
            const isOpen = position === crumbs.length - 1;

            const label =
              crumb.index === undefined
                ? t('all-conditions')
                : t('group-number', { number: crumb.index + 1 });

            return (
              <Fragment key={crumb.path}>
                {position > 0 && <Breadcrumb.Separator />}
                <Breadcrumb.Item>
                  {isOpen ? (
                    <Breadcrumb.Page>{label}</Breadcrumb.Page>
                  ) : (
                    <Breadcrumb.Link asChild>
                      <button type="button" onClick={() => enter(crumb.path)}>
                        {label}
                      </button>
                    </Breadcrumb.Link>
                  )}
                </Breadcrumb.Item>
              </Fragment>
            );
          })}
        </Breadcrumb.List>
      </Breadcrumb>

      <SegmentGroup
        key={openPath}
        path={openPath}
        sortable={false}
        onEnterGroup={enter}
        onRemove={openPath === root ? undefined : () => leaveTo(openPath)}
      />
    </div>
  );
};
