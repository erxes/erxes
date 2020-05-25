---
id: segments
title: Segments
---

A segment is smaller group of your contacts defined by rules or filters that you set. Coordinate and manage your companies and customers in one go from the company database. Erxes let you filter and segment an important group of data for targeted purposes such as by websites, size, plan industry, session count or some criteria in a more realistic way.

---

## Setup segment

The segment is a customer data management and analytics solution that helps you make sense of customer and company data coming from multiple sources. There are two main categories of segments. One is the properties segment which belongs to basic information of companies, customers and leads. The another one is the custom event segment. It will able to create actions yourself that are triggered by something your customer performs on your site or app.

You can create a new segment by different ways from different paths.

1. Go to Erxes Settings => Segments => select Customer/Company => New segment.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/segments/1.png)

<aside class="notice">
  In this customer field, it contains all customers in your database. The Leads and Customers in the contacts feature, they have passed the specified criteria. This means, if you create a segment on a certain feature, you also need to add more filter properties. More details will be shown create properties segments section.
</aside>

2. You can directly create from Certain Features. Certain feature => Segment => New segment.

- Click on top right corner of segment.
- Click New segment.

![](https://s3-us-west-2.amazonaws.com/erxes-docs/customer-support/customer-support-17.png)

<aside class="notice">
  The created segments will be used in Customer, Company, Leads and Engage features.
</aside>

## Create Properties Segments

The properties segment is a data management and analytics solution that helps you make sense of customer and company basic data coming from multiple sources.

- Please follow the steps for setup: Certain Features => FILTER BY SEGMENTS => New Segment.

* **Let's take an example, It is shown the number of new users created in March 2020.**

![](https://erxes-docs.s3-us-west-2.amazonaws.com/segments/2.png)

1. Insert Name for the Segment.
2. Choose Sub Segment.
3. Insert Description for the Segment.
4. Choose Color for the Segment.
5. Choose Segment type. (If you create Properties Segments, select the Add Properties.
6. Choose Segment type. (If you create Event Segments, select the Add Events.
7. Select the Filter property.
8. Select operator.
9. Insert value.
10. Show count and Save the Segment.
11. The numbers of results.

<aside class="notice">
  You need to make sure that insert the correct format on values field (number 9). For instance, DATE value has to "YYYY-MM-DD".
</aside>

### Sub-segments of segment

Sub-segment allows you to create a new filter on the parent segment. Once we have created the segment on the above example. If we need more filters on that segment, you can create a new segment. In the sub-segment section, you need to call the parent segment. The following example shows who had set their primary email from created users in March 2020.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/segments/3.png)

### Study case of segment

Learn the following case studies for how to set segments using some SELECT OPERATORs on date fields.

- date relative less than
- date relative greater than
- will occur before on following n-th minute
- will occur after on following n-th minute
- will occur before on following n-th day
- will occur after on following n-th day

---

#### Date relative less than

This operator let you filter on date fields that the all-action or all-state had been being occurred until your specified date.
Take an example, let's create a segment that inactive users **for the last 3 weeks**. In this case, use "date relative less than" operator to show all inactive users who did not seen at on exactly twenty-one days from the current time.

`"date relative less than now-21d/d "`- filters the specified data from the past until 21 days ago from the current time.

```
Last seen at "date relative less than" "now-21d/d"

```

![](https://erxes-docs.s3-us-west-2.amazonaws.com/segments/date+less+than.png)

- In the value field, you can insert minutes also such `date related less than now-30m/m`. It will show you the all actions that had been being happened 30 minutes ago.

- For some special case, you can create an action that `date related less than now+24h/h`, which means you can filter all data **from** the past **until** tomorrow.

#### Date relative greater than

This operator let you filter on date fields that the all-action or all-state will have been being occurred from your specified date.
Take an example, let's create a segment that all users registered in the last 24 hours. In this case, use "date relative greater than" operator to show all users who created at last 24 hours from the current time.

`"date relative greater than now-24h/h "`- filters the specified data between 24 hours ago from the current time and future time.

```
Created at "date relative greater than" "now-24h/h"
```

![](https://erxes-docs.s3-us-west-2.amazonaws.com/segments/date+greater+than.png)

- In the value field, you can insert minutes also such `date related greater than now-30m/m`. It will show you the all actions that start from 30 minutes ago to future.

- For some special case, you can create an action that `date related greater than now+1d/d`, which means you can filter all data from tomorrow to future.

#### Will occur before on following n-th minute/ n-th day

This operator let you filter on date fields that the action or the state will occur on the exact n-th minute or n-th day. Take an example, let's create a segment that all users date will expire on eleven days later from current time. In this case, use "will occur before on following n-th day" operator to show the users whose date will expire on eleven days later from the current time. This means the segment will show you the number of users whose specified action will occur before on the following 11th day.

`"expire date" - "will occur before on following n-th day" - "11"`- filters the specified data which date will just expire 11 days later from the current moment.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/segments/will+occur+before.png)

- **The difference between "will occur before on following n-th minute" and "will occur before on following n-th day" is the system will check n-th minute and n-th day respectively.**

#### Will occur after on following n-th minute/n-th day

This operator let you filter on date fields that the action or the state occurred on the exact n-th minute or n-th day. Take an example, let's create a segment that all users date expired and which have elapsed on just 2nd day. In this case, use "will occur after on following n-th day" operator to show the users whose date expired at two days ago from the current time. This means, the action has already ended and 2 days have elapsed.

`"expire date" - "will occur after on following n-th day" - "2"`- filters the specified data which elapsed on just second date.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/segments/will+occur+after.png)

- **The difference between "will occur after on following n-th minute" and "will occur after on following n-th day" is the system will check n-th minute and n-th day respectively.**

## Create Event Segments

Events are actions that are triggered by something your customer performs on your site or app. Every time the event occurs, a new record is created in the analytics database. Refer to the following instruction to create event-based segments.

#### Step 1: Copy the script

Copy the code below and paste it onto your website page body section.

```
   <script>
    (function() {
    var script = document.createElement('script');
    script.src = "http://localhost:3200/build/eventsWidget.bundle.js";
    script.async = true;
    var entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(script, entry);
  })();

  </script>

```

#### Step 2: Register events

You can arrange the event occurs (such as when a user clicks a button). The example shows when users click `GET STARTED` button, it will register event named `get-start` with attributes price 100 and view 80%. Later you can make segment for event name, therefore filter with your defined attributes. Copy the code below and paste it onto your website page body section.

```


<button id="get-start">Pricing for Team</button>

<script>
  if(document.addEventListener){
    document.querySelector('#get-start).addEventListener('click', function() {
      window.Erxes.sendEvent({ name: 'get-start', attributes: { price: 100, view: '80%' } })
    })
  }

</script>

```

#### Step 3: Create segments using registered events

While your configured event is triggered, the event will be recorded on your database, then you can create the event segments.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/segments/5.png)

In the above script, there are configured attributes such as price and view. You can add more filters on the attributes.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/segments/4.png)

---

### Segment customer properties according to tracked data.

Erxes allows you to create customer properties segment based on event triggers. For example, when user clicked button for **Update plan attribute**, this user will be registered Tracked data section with `pricing-team111` attributes. Later you can create properties segment directly.

```

    <button id="button">Update plan attribute</button>

    <script>
      document.querySelector('#button').addEventListener('click', function() {
        window.Erxes.updateCustomerProperty('pricing-team111', 'successfully');
      })
    </script>

```

#### Check user's registered attribute

![](https://erxes-docs.s3-us-west-2.amazonaws.com/segments/6.png)

#### Customer segment based on event triggers using properties segment(Tracked data section).

![](https://erxes-docs.s3-us-west-2.amazonaws.com/segments/7.png)
