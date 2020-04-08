---
id: segments
title: Segments
---

<!--Content-->
 A segment is smaller group of your contacts defined by rules or filters that you set. Coordinate and manage your companies and customers in one go from the company database. Erxes let you filter and segment an important group of data for targeted purposes such as by websites, size, plan industry, session count or some criteria in a more realistic way.


---

## Setup segment
The segment is a customer data management and analytics solution that helps you make sense of customer and company data coming from multiple sources. There are two main categories of segments. One is the properties segment which belongs to basic information of companies, customers and leads. The another one is the custom event segment. It will able to create actions yourself that are triggered by something your customer performs on your site or app. 

You can create a new segment by different ways from different paths. 
1. Go to Erxes Settings => Segments => select Customer/Company => New segment.

<div>
  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/segments/1.png">
</div>
<br>
<aside class="notice">
  In this customer field, it contains all customers in your database. The Leads and Customers in the contacts feature, they have passed the specified criteria. This means, if you create a segment on a certain feature, you also need to add more filter properties. More details will be shown create properties segments section.   
</aside>
<br>

2. You can directly create from Certain Features. Certain feature => Segment => New segment.

  + Click on top right corner of segment.
  + Click New segment.

<div>
  <img src="https://s3-us-west-2.amazonaws.com/erxes-docs/customer-support/customer-support-17.png" style="width:400px;height:280px;"/>
</div>

<aside class="notice">
  The created segments will be used in Customer, Company, Leads and Engage features. 
</aside>

---

## Create Properties Segments
The properties segment is a data management and analytics solution that helps you make sense of customer and company basic data coming from multiple sources. 

+ Please follow the steps for setup: Certain Features => FILTER BY SEGMENTS => New Segment.
- **Let's take an example, It is shown the number of new users created in March 2020.**

<div>
  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/segments/2.png" 
  style="border:1px solid #eee;" />
</div>

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


### Sub-segments of segment.
Sub-segment allows you to create a new filter on the parent segment. Once we have created the segment on the above example. If we need more filters on that segment, you can create a new segment. In the sub-segment section, you need to call the parent segment. The following example shows who had set their primary email from created users in March 2020.   

<div>
  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/segments/3.png">
</div>



---

## Create Event Segments
Events are actions that are triggered by something your customer performs on your site or app. Every time the event occurs, a new record is created in the analytics database. Refer to the following instruction to create event-based segments. 

#### Step 1: Copy the script
Copy the code below and paste it onto your website page body section. 

```
   <script>
    (function() {
    var script = document.createElement('script');
    script.src = "https://w.office.erxes.io/build/eventsWidget.bundle.js";
    script.async = true;
    var entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(script, entry);
  })();

  </script>

```

#### Step 2: Register events

You can arrange the event occurs (such as when a user clicks a button). The example shows when users click `GET STARTED` button, it will register event named `get-start` with attributes price 100 and view 80%. Later you can make segment for event name, therefore filter with your defined attributes. Copy the code below and paste it onto your website page body section. 


```
 
<div>
<button id="get-start">Pricing for Team</button>
</div>
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
<div>
  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/segments/5.png" >
</div>
<br>
In the above script, there are configured attributes such as price and view. You can add more filters on the attributes. 
<div>
  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/segments/4.png" >
</div>
<br>

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
<div>
  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/segments/6.png" >
</div>

#### Customer segment based on event triggers using properties segment(Tracked data section). 
<div>
  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/segments/7.png" >
</div>