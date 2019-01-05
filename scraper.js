const cheerio = require('cheerio')
const fs = require('fs')

exports.scrape = function (content) {
    //const $ = cheerio.load(fs.readFileSync(url))
    const $ = cheerio.load(content)
    const table = $('#tabborder_21351').find("div > table").first()

    const weekDayLit = { 'Montag': 'Mo', 'Dienstag': 'Tu', 'Mittwoch': 'We',
        'Donnerstag': 'Th', 'Freitag': 'Fr', 'Samstag': 'Sa', 'Sonntag': 'Su' }
    const weekDayMap = new Map(Object.entries(weekDayLit))    

    const config = []
    table.find('tr > td[class="td-0"]').each((index, td) => handleName(config, td))
    table.find('tr > td[class="td-1"]').each((index, td) => handleWeekDays(config, td, index, weekDayMap))
    table.find('tr > td[class="td-last td-2"]').each((index, td) => handleOpeningHours(config, td, index))
    
    const configObj = {
        markets: config
    }
    fs.writeFileSync('./config.json', JSON.stringify(configObj, null, 2), 'utf-8')
}

const handleName = function(config, td) {
    config.push({
        name: td.children[0].data.trim()
    })
}

const handleWeekDays = function(config, td, index, weekDayMap) {
    const weekDayStr = td.children[0].data.trim()
    const weekDays = weekDayStr ? weekDayStr.split(' und ') : [ 'Niemals' ]
    const market = config[index]
    market.openingHours = weekDays.map(wd => weekDayMap.get(wd)) 
}

const handleOpeningHours = function(config, td, index) {
    const market = config[index]
    const weekDays = market.openingHours
    const hourRangesStr = td.children[0].data.trim()
    const hourRangeStrs = hourRangesStr ? hourRangesStr.split(' und ') : [ 'Niemals' ]
    const hourRanges = hourRangeStrs.map(str => str.replace(' Uhr', '').split(' bis '))
    var openingHoursStr = ''
    for (index in weekDays) {
        if(index > 0) {
            openingHoursStr += '; '    
        }
        openingHoursStr += weekDays[index] + ' '
            + hourRanges[index >= hourRanges.length ? hourRanges.length - 1 : index].join('-')
    }
    market.openingHours = openingHoursStr
}
