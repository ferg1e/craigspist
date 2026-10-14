# Craigspist

Craigspist is a craigslist scraper. It works for all jobs categories and all gigs categories. It works for all cities. You can scrape one category at a time and multiple cities at a time.

## Requirements

- Node/NPM
- Chrome and ChromeDriver. These should install automatically if you don't already have them. If you run into an error with these then run `./selenium-manager --browser chrome --debug`. Selenium manager is in `node_modules/selenium-webdriver/bin`.

## Install & Run

- `git clone https://github.com/ferg1e/craigspist.git scraper`
- `cd scraper`
- `npm install`
- `node src/index.js -c losangeles -C gov`
- Now all the Los Angeles jobs from the government category will be in `out/gov1792012446526.html` (the timestamp in the filename will be different)