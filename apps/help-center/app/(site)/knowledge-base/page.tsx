import { getPortalForms } from '@/modules/forms/api';
import { FormList } from '@/modules/forms/components/FormList';
import { getTopicArticleList } from '@/modules/knowledge-base/api';
import { CategoryCard } from '@/modules/knowledge-base/components/CategoryCard';
import { SectionBlock } from '@/modules/knowledge-base/components/SectionBlock';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { CountBadge } from '@/modules/ui/components/PageHeader';
import { ButtonLink } from '@/modules/ui/components/Button';
import {
  KB_OFF_REASON,
  KB_OFF_TITLE,
} from '@/modules/knowledge-base/constants/guard';
import { FeatureOff } from '@/modules/ui/components/FeatureOff';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { Section } from '@/modules/ui/components/Section';
import { Icon } from '@/modules/ui/components/Icon';
import {
  LoadError,
  SetupNotice,
  Unpublished,
} from '@/modules/ui/components/PortalState';

export const metadata = { title: 'Knowledge base' };

export default async function KnowledgeBasePage() {
  const [topic, forms] = await Promise.all([
    getTopicArticleList(),
    getPortalForms(),
  ]);

  const portalForms = forms.state === 'ready' ? forms.data : [];

  return (
    <PortalShell
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Knowledge base' }]}
      title="Knowledge base"
      description="Guides, answers to common questions and policies, grouped by category."
      meta={
        topic.state === 'ready' && topic.data.sections.length ? (
          <CountBadge
            count={topic.data.sections.length}
            label={topic.data.sections.length === 1 ? 'section' : 'sections'}
          />
        ) : null
      }
    >
      <div>
        {topic.state === 'unconfigured' ? (
          <SetupNotice missing={topic.missing} />
        ) : topic.state === 'unpublished' ? (
          <Unpublished domain={topic.domain} />
        ) : topic.state === 'error' ? (
          <LoadError message={topic.message} />
        ) : !topic.data.knowledgeBaseEnabled ? (
          <FeatureOff title={KB_OFF_TITLE} description={KB_OFF_REASON} />
        ) : topic.data.sections.length ? (
          topic.data.sections.every((section) => !section.children.length) ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {topic.data.sections.map((section, index) => (
                <CategoryCard
                  key={section._id}
                  category={section}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-14">
              {topic.data.sections.map((section) => (
                <SectionBlock key={section._id} section={section} />
              ))}
            </div>
          )
        ) : (
          <EmptyState
            icon="book"
            title="The knowledge base is empty"
            description="This topic has no published categories. Add one under Frontline → Knowledge Base."
            action={
              <ButtonLink href="/tickets/new" size="sm">
                Create a ticket
              </ButtonLink>
            }
          />
        )}
      </div>

      {portalForms.length ? (
        <Section
          className="mt-14 border-t border-line pt-12"
          icon="clipboard"
          title="Forms"
          description="Ready-made forms for sending details to the support team."
          action={
            portalForms.length > 4 ? (
              <ButtonLink href="/forms" size="sm" variant="secondary">
                All forms
                <Icon name="chevronRight" size={15} />
              </ButtonLink>
            ) : null
          }
        >
          <FormList forms={portalForms.slice(0, 4)} />
        </Section>
      ) : null}
    </PortalShell>
  );
}
