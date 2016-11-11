#!/bin/bash

echo ""
read -p "Do you wish to install required nodejs libraries? (y/n) " RESP

if [ "$RESP" = "y" ]; then
  echo -e "INSTALLING main/package.json"
  cd main && meteor npm install
  echo -e "INSTALLING main/package.json                                         DONE"

  echo -e "INSTALLING api/package.json"
  cd ../api && npm install
  cd ../
  echo -e "INSTALLING api/package.json                                          DONE"
else
  echo -e "INSTALLING required nodejs libraries ...                             SKIP"
fi


#
# api/settings.json create
#
echo ""
read -p "Do you wish to create api/settings.json? (y/n) " RESP

if [ "$RESP" = "y" ]; then
    echo "{
  \"CDN_HOST\": \"http://localhost:7020/static\",
  \"API_URL\": \"ws://localhost:7010/websocket\"
}"> ./api/settings.json

    echo -e "CREATING api/settings.json ...                                     DONE"
else
    echo -e "CREATING api/settings.json ...                                     SKIP"
fi


#
# main/settings.json create
#
echo ""
read -p "Do you wish to create main/settings.json? (y/n) " RESP

if [ "$RESP" = "y" ]; then
    echo "{
  \"public\": {
    \"CDN_HOST\": \"http://localhost:7020/static\"
  }
}"> ./main/settings.json

    echo -e "CREATING main/settings.json ...                                    DONE"
else
    echo -e "CREATING main/settings.json ...                                    SKIP"
fi
