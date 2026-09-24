import {
  AUTOMATION_CORE_ACTIONS,
  TAutomationBuiltInTemplate,
  TAutomationBuiltInTemplateRequirement,
} from 'erxes-api-shared/core-modules';

const paragraphs = (...lines: string[]) =>
  lines.map((line) => `<p>${line}</p>`).join('');

/**
 * Every email step of a template needs the same two things, and one pick
 * settles both: the address a reply comes back to, and the name it is shown
 * under.
 */
const senderRequirement = (
  orders: number[],
): TAutomationBuiltInTemplateRequirement => ({
  key: 'sender',
  kind: 'core:emails.sender',
  label: 'Choose the address replies come back to',
  description:
    'A verified sender of this organization. Without one there is nowhere for an answer to these emails to go.',
  fills: orders.flatMap((order) => [
    { order, path: 'replyToEmail', from: 'value' },
    { order, path: 'sender', from: 'name' },
  ]),
});

const email = (
  order: number,
  {
    label,
    subject,
    body,
    next,
  }: { label: string; subject: string; body: string; next?: number },
) => ({
  order,
  type: AUTOMATION_CORE_ACTIONS.SEND_EMAIL,
  label,
  config: {
    // The organization's own default sender, so nothing has to be picked for
    // the address a message is sent from.
    type: 'default',
    fromEmailPlaceHolder: '',
    replyToEmail: '',
    // Not a choice anyone makes twice: a step runs once per customer, and the
    // address is the one that customer has.
    toEmailsPlaceHolders: '{{ trigger.primaryEmail }}',
    ccEmailsPlaceHolders: '',
    subject,
    // Stored as HTML on purpose: the content editor parses it into blocks when
    // the step is opened, so a template stays readable here and still arrives
    // editable there.
    content: body,
    html: body,
    sender: '',
  },
  ...(next ? { next } : {}),
});

const wait = (order: number, value: string, next: number) => ({
  order,
  type: AUTOMATION_CORE_ACTIONS.DELAY,
  label: `Wait ${value} days`,
  // `value` is a string in the step's own form; a number here would arrive as
  // something that field cannot edit.
  config: { value, type: 'day' },
  next,
});

/** Said once per template: the words are a starting point, not a finished one. */
const rewriteTheWording = (order: number) => [
  { order, label: 'Replace the wording with your own' },
];

/**
 * Flows that ship with core, built only from core's own actions.
 *
 * A plugin ships the templates that use its actions in its own
 * `meta/automations` instead — a template naming another plugin's action type
 * would make one plugin depend on another, and would also break the rule that
 * keeps it invisible when its plugin is not installed.
 *
 * All of these run against a customer, so they are offered both on the
 * automations canvas and on a broadcast campaign.
 */
export const CORE_AUTOMATION_WORKFLOW_TEMPLATES: TAutomationBuiltInTemplate[] =
  [
    {
      id: 'core.welcome-series',
      name: 'Welcome series',
      description:
        'Greets someone the day they arrive, then comes back a few days later with the one thing they should do first.',
      flow: [
        email(1, {
          label: 'Welcome email',
          subject: 'Welcome aboard',
          body: paragraphs(
            'Hi {{ trigger.firstName }},',
            'Thanks for joining us — we are glad you are here.',
            'Have a look around, and if anything is unclear just reply to this email.',
          ),
          next: 2,
        }),
        wait(2, '3', 3),
        email(3, {
          label: 'Getting started',
          subject: 'One thing worth doing first',
          body: paragraphs(
            'Hi {{ trigger.firstName }},',
            'Now that you have had a few days to settle in, there is one step that makes the rest easier.',
            'Reply if you would like a hand with it.',
          ),
        }),
      ],
      requirements: [senderRequirement([1, 3])],
      mustConfigure: rewriteTheWording(1),
    },
    {
      id: 'core.win-back',
      name: 'Win back a quiet customer',
      description:
        'Leaves a month of silence alone, then asks once whether it is still worth staying in touch.',
      flow: [
        wait(1, '30', 2),
        email(2, {
          label: 'Check-in email',
          subject: 'Still worth staying in touch?',
          body: paragraphs(
            'Hi {{ trigger.firstName }},',
            'We have not heard from you in a while, so rather than keep writing we thought we would ask.',
            'If this is still useful, reply and we will pick up where we left off. If not, no hard feelings.',
          ),
        }),
      ],
      requirements: [senderRequirement([2])],
      mustConfigure: rewriteTheWording(2),
    },
    {
      id: 'core.ask-for-feedback',
      name: 'Ask how it is going',
      description:
        'Waits a week — long enough to have an opinion, soon enough to still remember — and asks for it.',
      flow: [
        wait(1, '7', 2),
        email(2, {
          label: 'Feedback request',
          subject: 'How has it been so far?',
          body: paragraphs(
            'Hi {{ trigger.firstName }},',
            'You have been with us about a week now. How is it going?',
            'A one-line reply is plenty — we read every one.',
          ),
        }),
      ],
      requirements: [senderRequirement([2])],
      mustConfigure: rewriteTheWording(2),
    },
    {
      id: 'core.nurture-drip',
      name: 'Nurture over two weeks',
      description:
        'Three emails spread across two weeks, so someone who is not ready yet hears from you without being crowded.',
      flow: [
        email(1, {
          label: 'First email',
          subject: 'Something that might help',
          body: paragraphs(
            'Hi {{ trigger.firstName }},',
            'Here is the thing most people find useful when they are starting out.',
          ),
          next: 2,
        }),
        wait(2, '5', 3),
        email(3, {
          label: 'Second email',
          subject: 'A step further',
          body: paragraphs(
            'Hi {{ trigger.firstName }},',
            'Building on the last note — this is what usually comes next.',
          ),
          next: 4,
        }),
        wait(4, '9', 5),
        email(5, {
          label: 'Last email',
          subject: 'Worth a conversation?',
          body: paragraphs(
            'Hi {{ trigger.firstName }},',
            'This is the last of these unless you would like more.',
            'If any of it landed, reply and we can talk it through properly.',
          ),
        }),
      ],
      requirements: [senderRequirement([1, 3, 5])],
      mustConfigure: rewriteTheWording(1),
    },
    {
      id: 'core.wait-then-email',
      name: 'Wait, then follow up once',
      description:
        'A single follow-up a few days later, so it does not land on top of the message that came before it.',
      flow: [
        wait(1, '3', 2),
        email(2, {
          label: 'Follow-up email',
          subject: 'Following up',
          body: paragraphs(
            'Hi {{ trigger.firstName }},',
            'I wanted to come back to you about my last message — it is easy to miss one.',
            'If it is still useful, just reply and we will pick it up from there.',
          ),
        }),
      ],
      requirements: [senderRequirement([2])],
      mustConfigure: rewriteTheWording(2),
    },
  ];
