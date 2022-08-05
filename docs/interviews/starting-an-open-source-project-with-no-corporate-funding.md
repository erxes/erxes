---
slug: starting-an-open-source-project-with-no-corporate-funding
title: Starting an Open Source Project with No Corporate Backing with Ben Gubler
author: MJ Amartaivan
author_title: Co-Founder and CEO at Erxes Inc
author_image_url: https://erxes.io/static/images/team/square/mend-orshikh.jpg
tags: [javascript, open source]
---

At Erxes, we’re obsessed with helping open source projects grow. We do this in a couple of different ways. First, we help open source projects grow through the use of our [own open source marketing platform](https://erxes.io/).

<!--truncate-->

Secondly, we work hard to educate open source project founders and contributors on a wide range of topics relating to marketing open source projects. From time to time, we interview leaders in the open source space for [our blog](https://erxes.io/blog/), about their experiences managing and scaling their projects.

Today, Erxes had the opportunity to chat with Ben Gubler, the founder of [Squirrelly](https://squirrelly.js.org/), about his experiences scaling his early stage open source project!

Let’s jump in and learn about Ben’s journey so far!

### The Interview

![Alt text](https://erxes.io/blog_wp/wp-content/uploads/2020/02/squirrelly-ben-gubler.png)

**Hello Ben and thank you for taking the time to chat with Erxes today about your project Squirrelly. This project is quite early stage still and in fact you’ve just recently launched the most recent version of Squirrelly. Can you get this interview started by telling us what pushed you to create an open source project?**

My journey with Squirrelly actually began when I was learning how to use Express.js, and reading lots of articles and tutorials online. One article that I read explained how to create a simple template engine for Express, using a simple regular expression replace. I followed the steps in the tutorial, then modified the code to add a few features.

It was then that I really realized I had created something real and functional, and I decided to publish my package on NPM. As a programmer, I wanted to share what I had created with others, and I figured that to go open-source was the best way.

**Obviously the decision to go open source didn’t take place in a silo. I’m sure you’ve drawn considerable inspiration from other open source projects. In your opinion, what are some of the open source projects who you plan to model your growth after? What is it about their [growth strategies](https://erxes.io/growthHacking) that you find most interesting?**

I’ve always been especially interested in open-source projects started or maintained by just one person. I’ve also focused on open-source template engine libraries, because that’s what I’m creating. Two of the open-source projects I really admire and would like to emulate are template engines: [doT.js](https://olado.github.io/doT/index.html) and [EJS](https://ejs.co/). The projects are both fairly simple and were started by a single person, without corporate backing. Due to good publicity and the fact that developers who used them enjoyed the experience, they’ve increased significantly in popularity.

**Let’s talk about your own growth for a moment. First, it seems like you’re still quite focused on product development. What steps are you taking to get others involved in development? How are you going about getting word out for contributors? What method has proven most successful for you so far?**.

Actually, one of the best ways to get contributors and publicity for my project was to make it really easy for first-time open-source contributors to contribute. During Hacktoberfest of 2018, I used a GitHub app called first-timers-bot and listed a lot of issues that only first-time contributors were allowed to create pull requests for. This not only gave people the opportunity to contribute to open source for the first time, it drove traffic to Squirrelly and built contributor interest.

**I see a big spike in development in mid 2018, but then it slowed down. What activities were you engaged in during that time to gain such a big spike in interest?**

During the summer of 2018, I was out of school and finally had some free time. Squirrelly was my big project, and I really wanted to focus on developing it further. Then, after a major rewrite, I started to run performance benchmarks. I figured out that Squirrelly was really, really fast, faster than the other template engines out there. That gave me motivation and some confidence, and drove me to optimize, develop, and publicize Squirrelly even more.

**What growth strategies do you plan to use to help Squirrelly gain more attention after your newest release?**

One strategy that’s brought me a lot of success in the past is writing publicity articles. I wrote an article for Hacker Noon that created a lot of interest in the last version of Squirrelly, and I’m planning to do the same this year. I’m also planning to post on Reddit and Hacker News, and write some tutorials using my product.

**What would you say are the three biggest growth roadblocks you face and how do you plan to overcome them?**

I would say the biggest roadblock to Squirrelly’s growth is creating interest even with the number of JavaScript template engines out there. I recently saw a [funny image](https://upload.wikimedia.org/wikipedia/commons/1/1b/Linux_Distribution_Timeline.svg) that showed the number of Linux distributions available and template engines are very similar. Since you can make a simple template engine simply, lots of people create hobby template engines and publish them to [NPM](https://www.npmjs.com/).

The second big roadblock is that technology is changing. People are switching from using template engines to using frameworks like [React](https://reactjs.org/) and [Vue](https://vuejs.org/). Though there are still a lot of use-cases for template engines (generating non-HTML content, for example) — I think template engine use is probably generally declining.

The last big roadblock is time. I could spend all day writing documentation and tutorials, but I’m a busy student with a lot of other commitments.

I think the solution to all of the problems above is wise publicity and driving contributions. If I focus on writing good articles about Squirrelly that showcase its strengths, people will be more likely to choose to use Squirrelly for future projects. Similarly, as I gain more contributors, community engagement will increase and the project will start to spread by word of mouth.

**Are you thinking about monetization at all? What are some different monetization models you’re exploring for Squirrelly?**

Monetization is something I’ve been thinking quite a lot about, and I’ve mainly been exploring three monetization models. The first is to put ads — in my case, through CodeFund — on the documentation website, and I’ve already done that. The problem is that ads require a certain amount of daily traffic to become lucrative, meaning my project would have to become quite popular for ads to fund it.

Another model is the paid support model — people could pay a one-time payment and get continued tech support for Squirrelly. The problem with this model is that I plan to give support ASAP anyway, and various time commitments make it impossible to ensure that I’m always on call.

The last method of monetization is probably the most popular, and it’s the user donation model. Projects use platforms like OpenCollective, Patreon, and Liberapay to allow those who use it to fund further development. I’ve been exploring this one quite a bit and it’s the one I think has the most potential to adequately fund my work. Unfortunately, most people and companies don’t donate, meaning you have to have a large user base in order to fund.

**In your opinion, which projects in the open source community have the most interesting or unique monetization models? What do you find interesting about the monetization models they use? Are there any takeaways here as it applies to Squirrelly?**

Another template engine library, [Handlebars](https://handlebarsjs.com/), sells swag like t-shirts and mugs. The great thing about selling merchandise is that it’s not only profitable but it builds community spirit around your project. I’d love to sell merchandise — maybe something like laptop stickers — sometime in the future.

**Lastly, if you could go back in time and start Squirrelly over again, what are three things you would do differently and why?**

Well, the first thing I would do differently is to pick my tooling better. When I first created the Squirrelly, I had the entire program in a single file. As I learned more as a programmer, I moved the program to Webpack, using Mocha for tests. Currently, Squirrelly is written in TypeScript, uses [Rollup](https://rollupjs.org/guide/en/) as a bundler, [Terser](https://www.npmjs.com/package/terser) for minifying, and Jest for tests and coverage.

The second thing I’d do is focus on writing good tests during development. I’ve caught multiple bugs just by running tests and looking at code coverage, and it’s saved me time in the long run and given me assurance.

The last thing I’d do is be more confident, take more risks, reach out to people for feedback. What’s the worst that could happen?

**Thank you greatly for taking the time to chat with [Erxes](https://erxes.io/) today Ben. We really appreciate it. Many of [our blog](https://erxes.io/blog/) readers are currently in the process of scaling their own open source projects, so insights like the ones you’ve provided above, can help them get from where they are to where they want to be. To our blog readers, if you’d like to learn more about Squirrelly, you can follow them on [GitHub](https://github.com/squirrellyjs/squirrelly) or visit their [website here](https://squirrelly.js.org/).**
