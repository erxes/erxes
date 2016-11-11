#!/bin/bash

cd main/
meteor --port 7010 --settings settings.json & pid=$!
PID_LIST+=" $pid";


cd ../publisher/
python -m SimpleHTTPServer 7030 & pid=$!
PID_LIST+=" $pid";


cd ../api/
python -m SimpleHTTPServer 7020 & pid=$!
PID_LIST+=" $pid";

gulp & pid=$!
PID_LIST+=" $pid";

trap "kill $PID_LIST" SIGINT

echo "Parallel processes have started";

wait $PID_LIST

echo
echo "All processes have completed";
