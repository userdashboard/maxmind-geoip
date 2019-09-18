if [ ! -d node_modules/puppeteer ] || [ ! -d node_modules/@userdashboard/dashboard ]; then
  npm install puppeteer @userdashboard/dashboard --no-save
fi
NODE_ENV=testing \
FAST_START=true \
PAGE_SIZE=3 \
DASHBOARD_SERVER="http://localhost:8002" \
PORT=8002 \
npm test