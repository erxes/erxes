---
id: timer
title: Timer
---

import { TimerComponent } from "./timer.js"

<p>Click any button to check actions.</p>

## Completed time tracking

<p>Completed timer will shown as below.</p>
<TimerComponent taskstatus="completed" />

## Started time tracking

<p>Started timer will shown as below. </p>
<TimerComponent taskstatus="started" />

## Paused time tracking

<p>Paused timer will shown as below.</p>
<TimerComponent taskstatus="paused" />

## Stopped time tracking

<p>Stopped timer will shown as below.</p>
<TimerComponent taskstatus="stopped" />

## API

<TimerComponent type="APItimer"  />