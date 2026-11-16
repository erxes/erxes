import { loggedEmails } from '~/modules/email/email';
import { rule } from './contacts.fixture';
import { useTwoOrgs } from './support';

/** The customers whose code starts with `group-`: each test has its own audience. */
export const audienceOf = (group: string) => rule('subject.code', 'starts_with', `${group}-`);

export const emailsTo = (address: string) => loggedEmails.filter((email) => email.to === address);

/** The address in a copy's text after `label: `. */
export const linkIn = (text: string, label: string) => {
  const link = new RegExp(`${label}: (\\S+)`).exec(text)?.[1];

  if (!link) throw new Error(`no ${label} link in ${text}`);

  return new URL(link);
};

/** Acme and Globex (`useTwoOrgs`), and a way to add Acme customers in a group (`audienceOf`). */
export const useBroadcasts = () => {
  const t = useTwoOrgs();

  const customersIn = async (
    group: string,
    people: { firstName?: string; primaryEmail?: string; primaryPhone?: string }[],
  ) =>
    Promise.all(
      people.map((person, index) =>
        t.owner().customers.create({ ...person, code: `${group}-${index}` }),
      ),
    );

  /** A broadcast to the group by email, ready to send. */
  const emailTo = (group: string, content: { subject?: string; body?: string } = {}) =>
    t.owner().broadcasts.create({
      name: group,
      channel: 'email',
      filter: audienceOf(group),
      subject: content.subject ?? 'Hi',
      body: content.body ?? 'Hi',
    });

  return { ...t, customersIn, emailTo };
};
