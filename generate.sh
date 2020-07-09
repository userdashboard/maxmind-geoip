#!/bin/sh
BASE_PATH=`pwd`
mkdir -p instance
if [ ! -d node_modules ]; then
  npm install
fi

for part in dashboard organizations maxmind-geoip stripe-subscriptions stripe-connect; do
  if [ ! -z "$1" ]; then
    if [ ! "$part" = "$1" ]; then
      continue
    fi
  fi
  # readme.md
  cd "$BASE_PATH"
  if [ ! -d instance/$part ]; then
    git clone https://github.com/userdashboard/$part.git instance/$part
    NODE_MODULES=""
    if [ ! -z "$STORAGE" ]; then      
      NODE_MODULES="$STORAGE"
    fi
    if [ "$part" = "dashboard" ]; then
      NODE_MODULES="$NODE_MODULES puppeteer@2.1.1"
    elif [ "$part" = "stripe-subscriptions" ] || [ "$part" = "stripe-connect" ]; then
      NODE_MODULES="$NODE_MODULES @userdashboard/dashboard puppeteer@2.1.1 ngrok"
    else
      NODE_MODULES="$NODE_MODULES @userdashboard/dashboard puppeteer@2.1.1"
    fi
    cd "instance/$part"
    npm install $NODE_MODULES --no-save
    cd ../..
  fi
  echo "documentation: $part"
  node documentation.js instance/$part/readme.md
  # api response objects
  cd "instance/$part"
  echo "generating api responses: $part"
  GENERATE_COUNTRY="US" \
  GENERATE_RESPONSE=true \
  RESPONSE_PATH="$BASE_PATH" \
  bash test.sh returns || exit 1
  # ui screenshots
  if [ ! "$part" = "maxmind-geoip" ]; then
    GENERATE_SCREENSHOTS=true \
    GENERATE_COUNTRY="US" \
    SCREENSHOT_PATH="$BASE_PATH/screenshots" \
    bash test.sh screenshots || exit 1 
  fi
  cd "$BASE_PATH";
  # ui routes
  echo "generating ui routes: $part"
  find instance/"$part"/src/www/ -type f -name '*.html' -print0 | sort -z |
  while IFS= read -r -d '' file; do
    if [[ $file == *"navbar"* ]] || [[ $file == *"src/www/home.html"* ]] || [[ $file == *"src/www/index.html"* ]]; then
      continue
    fi
    node ui-route.js $part $file || exit 1
  done;
  # api routes
  echo "generating api routes: $part"
  find instance/"$part"/src/www/api -type f -name '*.test.js' -print0 | sort -z |
  while IFS= read -r -d '' file; do
    if [[ $file == *"node_modules/"* ]]; then
      continue
    fi
    node api-route.js $file || exit 1
  done;
  # sitemap pages
  echo "generating sitemap: $part"
  node ui-sitemap.js $part || exit 1
  # UI index pages
  echo "generating UI indexes: $part"
  node ui-index.js $part || exit 1
  # api index page
  echo "generating api indexes: $part"
  node api-index.js $part || exit 1
done

# integrations
here=`pwd`
for project in example-web-app example-subscription-web-app; do 
  if [ ! -z "$1" ]; then
    if [ ! "$project" = "$1" ]; then
      continue
    fi
  fi
  cd $here
  echo "generating project ${project}"
  # readme.md
  if [ ! -d instance/$project ]; then
    git clone https://github.com/userdashboard/$project.git instance/$project
  fi
  if [ ! -d instance/$project/application-server/node_modules ]; then
    cd instance/$project/application-server
    npm install
    cd $here
  fi
  if [ ! -d instance/$project/dashboard-server/node_modules ]; then
    cd instance/$project/dashboard-server
    npm install @userdashboard/storage-redis
    cd $here  
  fi
  echo "generating documentation"
  node documentation.js instance/$project/readme.md  
  echo "generating sitemap: $project"
  node ui-sitemap.js $project
  echo "generating ui routes: $project"
  node ui-routes.js $project
  # ui screenshots
  echo "generating integration screenshots"
  if [ $project = "example-subscription-web-app" ]; then
    cd instance/$project/dashboard-server && 
       NGROK=true \
       GENERATE_SCREENSHOTS=true \
       GENERATE_COUNTRY="US" \
       SCREENSHOT_PATH="$BASE_PATH/screenshots/$project" \
       bash screenshots.sh || exit 1
  else 
    cd instance/$project/dashboard-server && 
       GENERATE_SCREENSHOTS=true \
       GENERATE_COUNTRY="US" \
       SCREENSHOT_PATH="$BASE_PATH/screenshots/$project" \
       bash screenshots.sh || exit 1
  fi
  cd $here
done

cd "$BASE_PATH";