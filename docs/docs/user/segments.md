---
id: segments
title: Segments
---

<!--Content-->
Coordinate and manage your companies and customers in one go from company database. It enables you to filter companies and customers by websites, size, plan industry, session count  in an more realistic way.

---

## Setup segment
Segment is a customer data management and analytics solution that helps you make sense of customer and company data coming from multiple sources.

+ Please follow the steps for setup: Certain Features ->Segment > Add Segment

1. Click on top right corner of segment
2. Click New segment

<div>
  <img src="https://s3-us-west-2.amazonaws.com/erxes-docs/customer-support/customer-support-17.png" style="width:400px;height:280px;"/>
</div>

<aside class="notice">
  *Created Segments will be used in Customer, Company and Engage features
</aside>

---

## Create segment
Segment is a customer data management and analytics solution that helps you make sense of customer and company data coming from multiple sources.

+ Please follow the steps for setup: Certain Features ->Segment > Add Segment

<div>
  <img src="https://s3-us-west-2.amazonaws.com/erxes-docs/customer-support/customer-support-18.png" style="border:1px solid #eee;" />
</div>

1. Add condition for the Segment
2. Click Add Condition
3. Insert your condition “30 online customers”
4. Insert Name for the Segment
5. Insert Description for the Segment
6. Choose Sub Segment
7. Choose Color for the Segment
8. Click Save to create Segment
9. The numbers of customers equals to created segment

<aside class="notice">
  *Created Segments will be used in Customer, Company and Engage features
</aside>

---

## Create event

#### Copy script
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

#### Register events
```
 
    <button id="download-pdf">Download pdf</button>

    <script>
      document.querySelector('#download-pdf').addEventListener('click', function() {
        window.Erxes.sendEvent({ name: 'downloadPdf', attributes: { price: 100, view: '80%' } })
      })
    </script>

```

#### Create segments using registered events
<div>
  <img src="https://s3-us-west-2.amazonaws.com/erxes-docs/segments/events1.png" style="border:1px solid #eee;" />
</div>


#### Update customer properties
```
 
    <button id="button">Update plan attribute</button>

    <script>
      document.querySelector('#button').addEventListener('click', function() {
        window.Erxes.updateCustomerProperty('testing', 'testing');
      })
    </script>

```

#### Check registered attribute
<div>
  <img src="https://s3-us-west-2.amazonaws.com/erxes-docs/segments/events2.png" style="border:1px solid #eee;" />
</div>