echo "Building UI"
cd ui
yarn install && yarn build
echo "Done building UI"

echo "Building Dashboard"
cd ../dashboard
yarn install && yarn build
echo "Done building Dashboard"

echo "Building Widgets"
cd ../widgets 
yarn install && yarn build
echo "Done building Widgets"