import {Builder, By} from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import fs from 'fs'
import {randInt} from './rand-int.js'
import {strContainsArray} from './str-contains-array.js'

const urlCities = ['losangeles']
const wordsBad = []
const wordsGood = []
const minSleep = 5000
const maxSleep = 12000
//const categories = ['sof', 'web', 'cpg']
let category = 'cpg'

urlCities.sort(() => Math.random() - 0.5)

////
const options = new chrome.Options()

options.excludeSwitches('enable-logging')
options.addArguments('--log-level=3')

let driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build()
await driver.manage().setTimeouts({implicit: 3000})

const items = []
const urls = []
let lastStart = 0

//
for(let k = 0; k < urlCities.length; ++k) {
    const city = urlCities[k]
    const pageUrl = `https://${city}.craigslist.org/search/${category}`
    let adCount = 0

    //
    try {

        //
        const now = Date.now()

        /*if(lastStart > 0) {
            console.log(`since: ${now - lastStart}`);
        }*/

        lastStart = now

        //
        await driver.get(pageUrl)

        const lis = await driver.findElements(By.className('result-info'))

        for(let i = 0; i < lis.length; ++i) {
            const tsElem = await lis[i].findElement(By.className('posting-title'))
            const aTitle = await tsElem.getText()
            const aUrl = await tsElem.getAttribute('href')

            //
            if(urls.indexOf(aUrl) === -1) {
                urls.push(aUrl)
            }
            else {
                continue
            }

            const metaElem = await lis[i].findElement(By.className('meta'))
            const spans = await metaElem.findElements(By.css('span'))
            let aTime = ""

            for(let j = 0; j < spans.length; ++j) {
                let s = spans[j]
                const titleAttrValue = await s.getAttribute('title')

                if(titleAttrValue != "") {
                    aTime = titleAttrValue
                    break
                }
            }

            //console.log(`data: ${aTitle}, ${aUrl}, ${aTime}`)

            //
            let d = new Date(aTime)

            items.push({
                title: aTitle,
                url: aUrl,
                time: aTime,
                timeMilli: d.getTime(),
                city: city
            });

            ++adCount
        }
    }
    catch(e) {
        //console.log(`big try error: ${e.message}`);
    }

    //
    console.log(`${city}: ${adCount}`)

    //
    const isLastCity = k == urlCities.length - 1

    if(!isLastCity) {
        await new Promise(r => setTimeout(r, randInt(minSleep, maxSleep)))
    }
}

//
await driver.quit()
items.sort((a,b) => b.timeMilli - a.timeMilli)

//
let outHtml = "<table>"
const outFilename = `./out/${category}` + Date.now() + '.html'

for(let i = 0; i < items.length; ++i) {
    const v = items[i]
    const isGood = strContainsArray(v.title, wordsGood)
    const isBad = strContainsArray(v.title, wordsBad)
    let xStyle = ''

    if(isBad) {
        xStyle = ' style="color:#dddddd;"'
    }
    else if(isGood) {
        xStyle = ' style="font-weight:bold;"'
    }

    outHtml += `<tr><td>${v.city}</td><td><a${xStyle} href="${v.url}" target="_blank">${v.title}</a></td><td>${v.time}</td></tr>`
}

outHtml += '</table>'

fs.writeFile(
    outFilename,
    outHtml,
    e => {},
);
