---
id: tasks
title: Tasks management
---

The task management section helps team members with the planning process of day, week, and month.


### With Task Management, you can do…

Task management is useful for team members to enter, monitor and track tasks to be performed.

- **Unlimited boards and pipelines** Manage your to-do list by allowing you to filter most of the views by: Companies, Customers, Priority, Team Members, Labels, and Due Dates.
- **Synergy with our other plugins** The Time Management plugin works perfectly with the sales pipeline, ticket, and Contact plugins. With this option you can create tasks for you and your clients to manage the overall delivery of their projects.
 
- **Keep up to date in your calendar** Improve your productivity and prevent procrastination by receiving notifications for the due dates that you set.



### Setting up task management

The Task Management plugin is available at <a href="https://erxes.io/marketplace">**erxes marketplace**</a> for all users when you <a href="https://erxes.io/experience-management">**get started**</a> with erxes. It comes with Cards plugin for free as it’s one of the core plugins erxes provides.


⚙️ Self-hosted client, please go to <a href="https://docs.erxes.io/docs/plugins/plugin-installation">**the plugin installation documentation**</a>
to intsal the card plugin after installing the erxes XOS.

‍💻  SaaS clients, when you sign-up to erxes Task Management plugin will be there already, so just go along with this guideline to get started with this plugin.  



### Creating your tasks

The Task Management can be found on the left hand side of the screen when you enter erxes. By selecting the pin you will be able to place the sign on the plugins bar visible.


The task management menu allows you to organize, customize and monitor the way your team members’ tasks are viewed and collected on erxes in the following ways.

Save multiple pipelines on a single Board.
Pipelines can be customized to your organization’s needs. Each pipeline can be dedicated to a team within your organization.

:::info

If your organization does not have many team members, creating a single pipeline would be beneficial. As you can organize different deals/tasks in the Label or Properties section of the pipeline, it may be more convenient for a small team to work on one board. This saves time as it reduces time spent navigating around multiple screens as everything is sorted and funneled into one page.

:::

After setting up this section, you can learn more about how to use this menu effectively in the Task Management menu.

 
**Step one.** Creating your board and pipeline

There are 2 ways to create your board 

Using onboarding kit /    2. Using the settings option.  

---


When you’re creating your pipeline, you have to keep in mind that all businesses are different and require different stages to reach the final stage of each project. Before creating your Task Management stages, please read the blog post that will hopefully help you to set up your Task pipeline effectively. 


**Step two.** Add properties on your task pipeline
 
To customize your Task Management cards, you can create additional fields that fit your unique needs from each card. To add new properties in your Task pipeline card, you’ll need to go to the Property plugin here. 


**Step three.** Add campaign on your task pipeline

Using Auto Campaigns, you can automate some of your tasks like automatic emails to be sent when you drag a card to a different stage as they progress along your Task pipelines.

 

In this case, let's say a tour agency wants to send sunflower for the tour package and some personalized content as an email to the lead associated with this deal card above. You can set up auto emails for each stage, but we'll create segments for the Sunflower Sent stage for this one. Let's create a parent segment with two subsegments for these different group types:

**1. Create Custom Card Properties** (Optional)
Here we are updating the custom card property on the right and then moving the card to the next stage. If you have any differentiating properties, please create those in advance by going to Settings -> Properties - > Deal/Task/Ticker Properties. Also, notice that the card already has a contact associated with it and make sure their email verification status is valid.

**2. Create Card Segments**
Please go to Settings -> Segments -> and choose from the segment type on the left to create these segments.
Parent segment
The parent segment, which is optional, will have the base filters that will be used on all subsegments:

:::caution
  
You can set whether the stage is active or archived. To highlight a certain task, configuring age as a duration is an important action.
  
:::

Subsegment
Once you set up your 'base' parent segment, you can create subsegments where you point the stage name: 
  

:::caution
  
To assign “subsegments”, create and save the segments first.
  
:::

**3. Create an Auto Campaign Email**
Once you create your segments, please select one stage segment in the Campaign target selection slide:
Segment

The number of customers found in the segment will likely be 0 when you're creating the Campaign. Not to worry, that means that nobody moved a card exactly 15 minutes ago to this stage.
Schedule
On the next slide, please set the schedule as every minute:

:::caution
  
Make sure you choose the right time filter for the parent segment. If you don't set that timeframe, but your Campaign schedule is set as every minute, you might end up spamming your contacts every minute.
Note that if you're not using erxes SaaS with your own AWS SES account, these auto emails will be sent to contacts with only valid email verification statuses on the erxes database. Please refer to this guide on how to verify your email addresses. If you connect your own AWS SES account, the restriction can be updated.
  
:::
  
  
🥳 Congratulations, you have successfully set up your Task Management Pipeline. Now, let’s start using it. 


### Everyday with Task Management

Let you guys go through the main actions on Task Management below:
 
---


For the Managers, erxes provides the numbers view options to precisely look into the projects. 


Board: 
Calendar:
Activity:
List:
Chart:
Gantt:




 
Filter and view archives among cards
  
1. You can filter your card by clicking on the Show menu. Explanation of available names
Filter by created members
Filter by priority
Filter by labels
Filter by team members
Choose companies
Choose customers
Date range
Assigned to me
Due tomorrow: Tasks to be completed tomorrow
Due next week: Tasks due next week
  
2. When viewing archived cards, select Archived items.

 
 
Now that you’re already know how to use Task Management, please go the following blog posts to learn about different use cases of Task Management plugin and master it.
  

✌️ Enjoy your journey with Task Management plugin!  
