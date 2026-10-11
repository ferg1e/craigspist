import {Builder, By} from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import fs from 'fs/promises'
import {resolve} from 'path'
import {parseArgs} from 'util'
import {randInt} from './rand-int.js'
import {strContainsArray} from './str-contains-array.js'
import {wordsGood} from './words-good.js'
import {wordsBad} from './words-bad.js'

const cliArgs = parseArgs({
    options: {
        cities: {
            type: 'string',
            short: 'c',
            default: 'cities.js'
        },
        category: {
            type: 'string',
            short: 'C',
            default: 'acc'
        },
    }
})

let urlCities = undefined

if(cliArgs.values.cities.endsWith('.js')) {
    const path = `./${cliArgs.values.cities}`
    const module = await import(path)
    urlCities = module.urlCities
}
else {
    urlCities = cliArgs.values.cities.split(',')
}

const minSleep = 5000
const maxSleep = 12000
//const categories = ['sof', 'web', 'cpg']
let category = cliArgs.values.category

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

        //
        let nearbyElemY = 1444555666

        try {
            const nearbyElem = await driver.findElement(By.className('nearby-separator'))
            const rect = await nearbyElem.getRect()
            nearbyElemY = rect.y
        }
        catch(e) {
            //
        }

        //
        const lis = await driver.findElements(By.className('result-info'))

        for(let i = 0; i < lis.length; ++i) {
            const tsElem = await lis[i].findElement(By.className('posting-title'))
            const rect = await tsElem.getRect()
            const aTitle = await tsElem.getText()
            const aUrl = await tsElem.getAttribute('href')

            //
            if(rect.y > nearbyElemY) {
                break
            }

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

            for(const s of spans) {
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

//
const outDirPath = resolve(import.meta.dirname, '../out')
const outFilename = `${category}${Date.now()}.html`
const outFilePath = resolve(outDirPath, outFilename)

await fs.mkdir(outDirPath, {recursive: true})
await fs.writeFile(outFilePath, outHtml)
