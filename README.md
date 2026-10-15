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

## Usage

When you run the scraper via `node src/index.js` a Chrome browser window will open, don't touch it. The CLI will print the number of ads for each city as they are scraped. There is a random 5-12 second sleep between scraping each city. Once all cities are scraped then links to all ads will be in an HTML file in the `out` directory. All the ads in the HTML file are in reverse chronological order based on CL post time.

The scraper supports two CLI args: `--cities` and `--category`.

`--cities` can either be a .js filename or a comma separated list of cities. If you use a .js file then it must export a `cities` array (see `src/cities.js` for an example) and it must be in the `src` directory. The default value for `--cities` if not specified is `cities.js` which uses `src/cities.js`. `src/cities.js` contains the largest 72 cities in the United States. You can use `-c` as a shortcut for `--cities`.

`--category` can be a single CL jobs or gigs category. The default is `acc` which is the accounting + finance category. You can use `-C` as a shortcut for `--category`.

Examples:

`node src/index.js --category web`

`node src/index.js -c sfbay,reno,slo`

`node src/index.js -c boston -C spa`
