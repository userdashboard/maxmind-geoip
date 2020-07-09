# Documentation

This is the documentation website for Dashboard and its official modules.

You can browse it online at [userdashboard.github.io](https://userdashboard.github.io).

To view the generated files switch to the `master` branch.

To regenerate the documentation site commit a change to the `release` branch.

The documentation is generated with `bash generate.sh`.  It clones Dashboard, its modules and the example projects and runs their test suites, saving API responses and screenshots.  Screenshots are created within Chrome web browser at multiple device resolutions using Puppeteer.  The `*-template.html` pages and their acompanying NodeJS scripts render the HTML content from the generated data and screenshots.

To generate the documentation locally run any of these commands:

    $ bash generate.sh
    $ bash generate.sh dashboard
    $ bash generate.sh organizations
    $ bash generate.sh maxmind-geoip
    $ bash generate.sh stripe-connect
    $ bash generate.sh stripe-subscriptions
    $ bash generate.sh example-web-app
    $ bash generate.sh example-subscription-web-app

The documentation will generate using any Dashboard storage engine or the file system which is slower.
    
    $ STORAGE="@userdashboard/storage-redis" \
      REDIS_URL="redis://locahost:6379" \
      bash generate.sh

The Stripe modules and the example subscription web app require environment variables.

# Support and contributions

If you have encountered a problem post an issue on the appropriate [Github repository](https://github.com/userdashboard).  

If you would like to contribute check [Github Issues](https://github.com/userdashboard/dashboard) for ways you can help. 

For help using or contributing to this software join the freenode IRC `#userdashboard` chatroom - [Web IRC client](https://kiwiirc.com/nextclient/).

## License

This software is licensed under the MIT license, a copy is enclosed in the `LICENSE` file.  Included icon assets and the CSS library `pure-min` is licensed separately, refer to the `icons/licenses` folder and `src/www/public/pure-min.css` file for their licensing information.

Copyright (c) 2017 - 2020 Ben Lowry

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.