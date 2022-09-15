---
id: segments
title: Segments
---

Build your own segments and target them with our Segments plugin. Set up any segment you can think of, and then use it to engage your community in ways that are meaningful to them. Our plugin works seamlessly with the Contacts and Engage plugins, allowing you to easily create a custom experience for each of your contacts based on their interests or attributes.


### With Segments, you can do...

- **Reduce Processes**
Automate repetitive tasks and reduce manual processes and errors

- **Create workflows**
Create consistent processes and stick to project workflows

- **Craft experience**
Increase performance speed and craft a better customer experience


### Setting up segments plugin


The Segment plugin is available at erxes <a href="https://erxes.io/marketplace/detail/62bbf5a84d8f5eff723faf64">marketplace</a> for all users when you <a href="https://erxes.io/experience-management">get started</a> with erxes. It comes with the Segment plugin for free as it’s one of the core plugins erxes provides.

⚙️ Self-hosted client, please go to <a href="https://docs.erxes.io/docs/plugins/plugin-installation">the plugin installation documentation</a> to install the Segment plugin after installing the erxes XOS.

‍💻  SaaS clients, when you sign-up for erxes the Segment plugin, will be there already, so just go along with this guideline to get started with this plugin.  


### Creating your segments

The Segment can be found on the left-hand side of the screen when you enter erxes. By selecting the pin, you will be able to place the sign on the plugin's bar visible.

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/1.segments.gif" width="90%" alt="where to find segments"></img>

**Step one.** Create your segments

When you trying to create segments that help you make your business process efficient, you need to make sure you have all the necessary data fields of your lead, customers, employees, and website visitors are available. So that you can create your desired segments. In order to do that, please use the Property plugin. 


**Step two.** Create a parent segment

First, you need to decide what type of contact you'll be working with. Currently, all new contacts are either labeled as Visitor and  Lead unless you manually update the state to Customer. 

|                                         Use Case                                        |                        Segment  Title                      |                                                                                                     Property                                                                                                    |                                            Operator                                           |                                                                                                         Rule                                                                                                         |
|:---------------------------------------------------------------------------------------:|:----------------------------------------------------------:|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:---------------------------------------------------------------------------------------------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
|      Any type of emails that  require a sequence  (onboarding/cold outreach/etc. emails |      Give it a specific title  that is easily identifiable |        If you wish to segment        by default contact state:<br />           1. Click on Add Properties <br />        2. Select State                                                                         |     Choose one of the operators:          <br />        - equal <br />      - is not equal to |                    Choose one of the                          states:                         <br />                     - Visitor <br />                   - Lead <br />                          - Customer        |
|                                                                                         |                                                            |       If you wish to segment by          your custom property:<br />           1. Click on Add Properties <br />         2. Select one of your              custom properties                                   |     Choose one of the operators:         <br />        - equal <br />      - is not equal to  |                                                                                           Type in the Custom  Property title                                                                                         |
|                                                                                         |                                                            |     Adding on to the above properties,     if you wish to engage Leads who haven't  reached out/replied to you with your email <br />          1. Click on Add Properties <br />         2. Select Integration  |                                         Choose does not equal                                 | Choose your email integration  from the dropdown list (This means, once someone replies to your email,  they will no longer be in this parent segment and will no  longer receive future emails from this sequence.) |

Creating a parent segment is useful if you wish to add another requirement (property) in this whole sequence instead of adding it individually to all subsegments. For example, you can add the "email validation = equals = valid" rule to the parent segment.


**Step 2**. Create subsegments

1. Click on "New Segment"
2. Choose the parent segment
3. Create a subsegment with these parameters:

|              Use Case             |                              Segment Title                              |      Property      |                    Operator                    |         Rule        |
|:---------------------------------:|:-----------------------------------------------------------------------:|:------------------:|:----------------------------------------------:|:-------------------:|
|  Welcome / Onboarding drip emails | Onboarding - Day X (email sends on the X-th day after contact creation) |  Select Created at |  Select will occur after on following n-th day |  Type in "now-Xd/d" |

Repeat the above step for Day 2, Day 3, etc. emails.


:::info

**Start a process with any Triggers**
- Specify the exact criteria that trigger an Automation with Segments
- Group trigger criteria with the advanced and/or conditions
- Create more than one trigger in one automation
**Automate Actions in a few simple clicks**
- Create workflow sequences with unlimited actions
- Set actions that branch or occur right away, or later when automation is triggered
- Personalize items and messages with Attributes

:::

**LET’S GET STARTED**


**How to create new segmentS**

1. Settings
2. Segment
3. New segment
4. Greeting customer segment 

Click on the Settings window in the upper right corner of the screen and select "Segment"

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/2.segments.jpeg" width="90%" alt="search segments"></img>

In the window that appears, click on the New segment button.

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/3.segments.jpeg" width="90%" alt="Click on the New segment button"></img>

In the Segment name field, select the appropriate data and click the Apply filter button.

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/4.segments.jpeg" width="90%" alt="click the Apply filter button"></img>

In the window that appears, click on the Save button to save.

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/5.segments.jpeg" width="90%" alt=" click on the Save button to save."></img>

Check out the GIF

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/6.segments.gif" width="90%" alt="creating a segment"></img>


**How to edit segments?**

---


**How to segment and filters contacts in the Pipeline?**

If you wish to filter contacts associated in a deal/ticket/task card, you can create a segment for it.

1. Go to Settings -> Segments
2. Click on "Sales Pipeline" from the segment type in the left column
3. Select the Board
4. Select a Pipeline from that Board
5. Choose "Contact" from the property type
6. Choose the contact property you'd like to use and set the value
7. Click "Apply Filter"
8. Click "Save" once you have the segment name and filters applied.

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/15.segments.jpeg" width="90%" alt="create segment for a deal/ticket/task card"></img>

Now you've created a unique filter for your Pipeline that segments contacts associated in deal cards by their tag:

---

**How to manage your tasks like a pro with Card Properties and Segments?**

In this article, we'll cover card property and segmentation practices for better task management.

You can segment your Task Cards and customize your pipeline filters. You can do this with custom properties or, for example, identify the deals that need attention by segmenting with the date when you last modified or changed the stage of the card.

1. Overall Structure of Tasks

In erxes, Sales Pipeline, Tasks, and Tickets have the same Kanban view as the default. But the intention behind these features is different. For example, it is recommended to use the Sales Pipeline for any sales-related activities as you can add products and services to these Deal Cards, and it has the sales conversion view. Task feature is designed to help you track your internal day-to-day activities across the entire organization. The Ticket feature works with the upcoming Client Portal feature, where your end-customers can create tickets themselves.

In Your Task Management has the following structure:

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/17.segments.png" width="90%" alt="Task management structure"></img>

1.1 Boards, Pipelines, Stages

You can structure your Boards as your Departments, Brands, or anything that is the overarching theme of your entire workflow. Next up, your Pipelines could be arranged by fiscal year, project, location names, etc. As for Stages, you can name these stages according to your business characteristics.

For example, a digital marketing and web design company task structure could look like this:

**Board:** Product Management

Pipeline #1: Web Design

- Planning
- Designing
- Design Approved
- Developing
- Client Feedback  
- Testing  
- Approved  
- Maintenance

Pipeline #2: General

- Backlog
- To-Do
- Doing
- Waiting on Someone
- Deferred
- Done

1.2 Card Details

Once you have your Boards and Pipelines set up, now it is time to move on to the Cards. You can start managing your cards and 'groom' your pipelines with card details:

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/18.segments.png" width="90%" alt="card details"></img>
Here are some examples of Labels:

- Generic: working on it, stuck, waiting on someone, done
- Collaborative: drafting, reviewing, approval required
- Task type for a Content team: blog post, video, social media
- Task type for a Product Development team: bug, enhancement, new feature, infrastructure, etc.

2. Task Management

Aside from the essential task management functionalities, such as assigning team members and due dates, leaving notes, etc., you can create your custom properties and filters for your cards. This way, you can fully customize and implement a task management practice that works for you. Once you have your task card properties set, you can mix different default and custom properties to:

- Organize your tasks
- Identify certain tasks (items that need to be reviewed or archived)
- Prioritize initiatives

2.1 Organize Tasks with Custom Properties

To create Task Segments, please go to Settings -> Segments and click on Tasks.

You can create Custom Properties for your task cards such as:

- Number input type of property to measure Effort, Impact, etc.
- Dropdown type of property to track a commonly used attribute such as Phase, Branch Location, Objective, etc.
- 'Yes/No' single choice properties to identify Importance, Urgency, Difficulty, etc.

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/19.segments.jpeg" width="90%" alt="create Custom Properties"></img>

Here is how it will look like in the Card detail:

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/20.segments.jpeg" width="90%" alt="how it will look like in the Card detail"></img>

2.2 Identify Tasks with Segments

With Card Segments, you are essentially creating more in-depth filters for your pipelines. The default filters are:

- By team members (created or assigned)
- By priority
- By labels
- By customers/companies
- By due dates

But with Cards Segments, you can use any of these default properties to create your own filters:

- By date created, stage changed, modified (any changes in the card detail), due.
- By card name and description (i.e., filtering cards that contain a certain word)
- By team member who created and/or modified
- By team member who is assigned or is following the card updates
- Here is an example of how your Task Segments could look like with the default properties:

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/21.segments.jpeg" width="90%" alt="create own filters"></img>

Let's take a closer look at the Segments related to dates. Here is the set up of the Segment which filters Content related tasks that were moved between stages within the last 15 days:

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/22.segments.jpeg" width="90%" alt="the Segment which filters Content related tasks"></img>

Before choosing the filters, we recommend choosing the Board and the Pipeline you wish to segment. Please note that your segment will not show up in that pipeline if you don't choose them.

- Status refers to the state of the card, whether it's active or archived. If you wish to filter only active cards, you should include this filter.
- The Label can be used if you wish to filter cards with a certain label in that pipeline. Once you choose the pipeline above, it will give you a dropdown of available labels in that specific pipeline.
- The Stage changed date refers to the date when the card was moved between stages.
1. In this case, we are using the 'date relative greater than' operator.
2. In the value field, you can either type in
- a set date, such as 2021-09-30
- a relative date, such as 'now-15d/d'. 'Now' refers to the present date and time. '15d/d' refers to 15 days. In this case, this filter will segment any tasks whose stage was changed on any day 15 days from today in the past, i.e., within the last 15 days.

Let's take another example with dates. Here we have the filters used for segmenting older cards:

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/23.segments.jpeg" width="90%" alt="filters used for segmenting older cards"></img>

Here we are using the 'Created at' default property with the 'date relative less than' operator. In the value section, we wrote 'now-90d/d.' With this filter, you will see the total number of archived or active cards created more than 3 months ago. For segments with a relative date filter, it helps to visualize the dates on a linear scale.

If the relative date segments are confusing for you, you can always use set dates. In the case above, you could always write '2020-12-31' in the value field to filter cards created last year.

2.3 Prioritize Tasks with Segments

You can read about the importance of maintaining your to-do list and prioritization methods here. You can use the default Priority property to filter your cards:

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/24.segments.jpeg" width="90%" alt="prioritize tasks with segments"></img>

But if you wish to customize your priority cards, you can use Card Segments. Once you decide which prioritization method you would like to use, you can easily create simple segments with your custom properties. Here, I have two methods created as Segments:

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/25.segments.png" width="90%" alt="customize your priority cards"></img>

To prioritize cards with the abovementioned custom properties, you can set up individual segments like this. In this case, it is the Eisenhower Matrix:

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/26.segments.jpeg" width="90%" alt="eisenhower matrix"></img>

Here is the finished prioritization filter:

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/segments/27.segments.gif" width="90%" alt="finished prioritization filter"></img>


**Everyday with segments**
