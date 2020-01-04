if [ ! -d node_modules/puppeteer ] || [ ! -d node_modules/@userdashboard/dashboard ]; then
  npm install puppeteer @userdashboard/dashboard --no-save
fi
PARAMS=""
if [ ! -z "$1" ]; then
  PARAMS="$PARAMS -- --grep $1"
fi
NODE_ENV=testing \
FAST_START=true \
PAGE_SIZE=3 \
DASHBOARD_SERVER="http://localhost:8002" \
DOMAIN="localhost" \
PORT=8002 \
npm test $PARAMS