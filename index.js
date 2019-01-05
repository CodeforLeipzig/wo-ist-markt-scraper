const nunjucks = require('nunjucks')
const fs = require('fs')
var request = require("request");
const { scrape } = require('./scraper.js')

//const url = 'C:/Users/Joerg/Desktop/markt.html'

const url = 'https://www.leipzig.de/freizeit-kultur-und-tourismus/einkaufen-und-ausgehen/maerkte/wochenmaerkte/'

request({
  uri: url,
}, function(error, response, body) {
    scrape(body)
    nunjucks.configure({ autoescape: true });
    const template = fs.readFileSync('./city_template.njk', 'utf-8')
    const config = require('./config.json', 'utf-8')
    const locations = require('./locations.json', 'utf-8')
    const newMarkets = []
    config.markets.forEach(market => {
        const matchingLocs = locations.locations.filter(loc => loc.name == market.name)
        if (matchingLocs.length > 0)  {
            for (index in matchingLocs) {
                matchingLoc = matchingLocs[index];
                const newMarket = {}
                newMarket.location = matchingLoc.location
                newMarket.name = matchingLoc.title
                newMarket.coordinates = matchingLoc.coordinates
                newMarket.title = market.title
                newMarket.openingHours = market.openingHours
                newMarkets.push(newMarket)
            }
        } else {
            newMarkets.push(market)
        }
    })
    config.markets = newMarkets
    const rendered = nunjucks.renderString(template, config);
    fs.writeFileSync('./leipzig.json', rendered, 'utf-8')    
});


