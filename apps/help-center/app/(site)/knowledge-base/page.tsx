import { getPortalForms } from '@/modules/forms/api';
import { FormList } from '@/modules/forms/components/FormList';
import { getTopicOverview } from '@/modules/knowledge-base/api';
import { CategoryCard } from '@/modules/knowledge-base/components/CategoryCard';
import { SectionBlock } from '@/modules/knowledge-base/components/SectionBlock';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { ButtonLink } from '@/modules/ui/components/Button';
import {
  KB_OFF_REASON,
  KB_OFF_TITLE,
} from '@/modules/knowledge-base/constants/guard';
import { Container } from '@/modules/ui/components/Container';
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
  const [{ headline }, topic, forms] = await Promise.all([
    getPortalIdentity(),
    getTopicOverview(),
    getPortalForms(),
  ]);

  const portalForms = forms.state === 'ready' ? forms.data : [];

  return (
    <>
      <Hero headline={headline} />

      <Container className="py-10 lg:py-14">
        <Breadcrumbs
          items={[{ label: 'Home', href: '/' }, { label: 'Knowledge base' }]}
        />

        <h1 className="mt-6 text-[30px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">
          Knowledge base
        </h1>

        <div className="mt-10 lg:mt-12">
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            className="mt-14 border-t border-line pt-12 lg:mt-16"
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
      </Container>
    </>
  );
}
