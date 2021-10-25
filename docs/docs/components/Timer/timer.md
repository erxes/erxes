---
id: timer
title: Timer
---

import { TimerComponent } from "./timer.js"

## Completed time tracking

<TimerComponent id="timerTask" taskstatus="completed" time="1000" startedAt="2021-10-23"></TimerComponent>

## Started time tracking

<TimerComponent id="timerTask" taskstatus="started" time="1000" startedAt="2021, 10, 23"></TimerComponent>

## Paused time tracking

<TimerComponent id="timerTask" taskstatus="paused" time="1000" startedAt="2021-10-20"></TimerComponent>

## Stopped time tracking

<TimerComponent id="timerTask" taskstatus="stopped" time="1000" startedAt="2021-10-20"></TimerComponent>

## API


<TimerComponent type="APItimer" table={[
  ['taskId', 'string', '', 'your task id'],
  ['status', 'started || paused || stopped || completed', '', 'task status'],
  ['timeSpent', 'number', '', 'time spent in this project'],
  ['startDate', 'string', '', 'the start date of project']
]}></TimerComponent>