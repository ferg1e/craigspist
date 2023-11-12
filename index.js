
//
const {Builder, By, Key, until} = require('selenium-webdriver');
var fs = require('fs');

//
const minSleep = 6000;
const maxSleep = 15000;
const categories = ['sof', 'web', 'cpg'];
let category = 'cpg';
//const urlCities = ['slo', 'miami', 'elpaso'];
const urlCities = [
    'losangeles',
    'newyork',
    'sandiego',
    'sfbay',
    'slo',
    'orangecounty',
    'boston',
    'houston',
    'washingtondc',
    'austin',
    'seattle',
    'denver',
    'lasvegas',
    'sanantonio',
    'philadelphia',
    'phoenix',
    'santabarbara',
    'inlandempire',
    'sacramento',
    'ventura',
    'portland',
    'chicago',
    'indianapolis',
    'fresno',
    'dallas',
    'miami',
    'orlando',
    'jacksonville',
    'memphis',
    'newjersey',
    'charlotte',
    'columbus',
    'elpaso',
    'nashville',
    'oklahomacity',
    'detroit',
    'saltlakecity',
];

const wordsBad = [
    '$75 to $150 Daily',
    'Earn $200',
    'Telecommute Earn $20',
    'focus group',
    'research study',
    'mentorship',
    'opioids',
    'alcohol',
    'Make Money From Home Today',
    'SPERM DONOR',
    'taskverse',
    'Social Media Marketer needed',
    'REMOTE WORK FROM HOME $97 to $375 Part-time Daily',
    'MAKE MONEY SENDING EMAILS',
    'sales rep',
    'Driver Needed',
    'Graphic Designer Needed',
    'PAID Tech Study',
    'REMOTE WORK FROM HOME $100 to $400 Part-time Daily',
    'Amazon gift card',
    'No experience required',
    'Vacation Planner',
];

const wordsGood = [
    'javascript',
    'react',
    'developer',
    'programmer',
    'programer',
    'angular',
    'haskell',
    'lisp',
    'sql',
    'python',
    'ruby',
    'php',
    'node',
    'flutter',
    'app',
    'clone',
    'website design',
    'Technical Co-Founder', 'Technical CoFounder', 'Technical Co Founder',
    'e-commerce website', 'ecommerce website',
    'Website Builder',
    'html',
    'css',
    'system',
    'engine',
];

//
const clCategory = process.argv[2];

if(clCategory != null) {
    category = clCategory;
}

//
const isValidCategory = categories.includes(category);

if(!isValidCategory) {
    const joinedCats = categories.join(', ');
    console.log(`category must be one of: ${joinedCats}. Default is cpg.`);
    process.exit();
}

//
urlCities.sort(() => Math.random() - 0.5);

//
(async () => {
    let driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().setTimeouts({implicit: 3000});

    const items = [];
    let lastStart = 0;

    //
    for(let k = 0; k < urlCities.length; ++k) {
        const city = urlCities[k];
        const pageUrl = `https://${city}.craigslist.org/search/${category}`;
        let adCount = 0;

        //
        try {

            //
            const now = Date.now();

            if(lastStart > 0) {
                console.log(`since: ${now - lastStart}`);
            }

            lastStart = now;

            //
            await driver.get(pageUrl);
    
            //await driver.manage().setTimeouts({implicit: 3000});
    
            const lis = await driver.findElements(By.className('result-info'));
    
            for(let i = 0; i < lis.length; ++i) {
                const tsElem = await lis[i].findElement(By.className('posting-title'));
                //const tsElem = await lis[i].findElement(By.className('titlestring'));
                const aTitle = await tsElem.getText();
                const aUrl = await tsElem.getAttribute('href');
    
                const metaElem = await lis[i].findElement(By.className('meta'));
                const spans = await metaElem.findElements(By.css('span'));
                let aTime = "";
    
                for(let j = 0; j < spans.length; ++j) {
                    let s = spans[j];
                    const titleAttrValue = await s.getAttribute('title');
    
                    if(titleAttrValue != "") {
                        aTime = titleAttrValue;
                        break;
                    }
                }
    
                //
                const isCurrCity = aUrl.startsWith(`https://${city}.`);

                if(isCurrCity) {
                    let d = new Date(aTime);
        
                    items.push({
                        title: aTitle,
                        url: aUrl,
                        time: aTime,
                        timeMilli: d.getTime(),
                        city: city
                    });

                    ++adCount;
                }
            }
        }
        catch(e) {
            //console.log(`big try error: ${e.message}`);
        }

        //
        console.log(`${city}: ${adCount}`);

        //
        const isLastCity = k == urlCities.length - 1;

        if(!isLastCity) {
            await new Promise(r => setTimeout(r, randInt(minSleep, maxSleep)));
        }
    }

    //
    await driver.quit();
    items.sort((a,b) => b.timeMilli - a.timeMilli);

    //
    let outHtml = "<table>";
    const outFilename = `./out/${category}` + Date.now() + '.html';

    for(let i = 0; i < items.length; ++i) {
        const v = items[i];
        const isGood = strContainsArray(v.title, wordsGood)
        const isBad = strContainsArray(v.title, wordsBad)
        let textColor = '#333333'

        if(isGood) {
            textColor = '#00bb00'
        }
        else if(isBad) {
            textColor = '#dddddd'
        }

        outHtml += `<tr><td>${v.city}</td><td><a href="${v.url}">${v.title}</a></td><td>${v.time}</td></tr>`;
    }

    outHtml += '</table>';

    fs.writeFile(
        outFilename,
        outHtml,
        e => {},
    );
})();

//
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

//
function strContainsArray(str, a) {
    for(let i = 0; i < a.length; ++i) {
        const needle = a[i].toLowerCase()
        const isIn = str.toLowerCase().includes(needle)

        if(isIn) {
            return true
        }
    }

    return false
}
