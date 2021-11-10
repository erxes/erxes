---
id: timer
title: Timer
---

import { TimerComponent } from "./timer.js"

## Completed time tracking

<TimerComponent taskstatus="completed" startedAt="2021-10-23"></TimerComponent>

## Started time tracking

<TimerComponent taskstatus="started" startedAt="2021, 10, 23"></TimerComponent>

## Paused time tracking

<TimerComponent taskstatus="paused" startedAt="2021-10-20"></TimerComponent>

## Stopped time tracking

<TimerComponent taskstatus="stopped" startedAt="2021-10-20"></TimerComponent>

## API


<TimerComponent type="APItimer" table={[
  ['* taskId', 'string', '', 'your task id'],
  ['* status', 'started || paused || stopped || completed', '', 'task status'],
  ['* timeSpent', 'number', '', 'time spent in this project'],
  ['startDate', 'string', '', 'the start date of project']
]}></TimerComponent>