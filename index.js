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
    config.markets.forEach(market => {
        const matchingLoc = locations.locations.find(loc => loc.name == market.name)
        if (matchingLoc) {
            market.location = matchingLoc.location
            market.name = matchingLoc.title
            market.coordinates = matchingLoc.coordinates
        }
    })
    const rendered = nunjucks.renderString(template, config);
    fs.writeFileSync('./leipzig.json', rendered, 'utf-8')    
});


