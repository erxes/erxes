#!/bin/bash

python -m SimpleHTTPServer 7020 & pid=$!
PID_LIST+=" $pid";

gulp & pid=$!
PID_LIST+=" $pid";
