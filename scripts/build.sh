echo "Building Dashboard"
cd ../dashboard && yarn install && npm run build
echo "Done building Dashboard"

echo "Building Widgets"
cd ../../widgets && yarn install && npm run build
echo "Done building Widgets"
