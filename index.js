const PORT = 3000;

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.get('/', function (req, res) {
    res.json("Hello, welcome to my website.");
});

app.get('/fests', async function (req, res) {
    try {
        const response = await axios.get('https://www.knowafest.com/explore/state/Tamil-Nadu');
        const html = response.data;
        const $ = cheerio.load(html);
        const eventDataPromises = $('table:contains(tr) tr:not(:first-child)').map(async (index, element) => {
            const tds = $(element).find('td');
            const eventUrl = $(element).attr('onclick');
            const modifiedEventurl = eventUrl.replace("window.open('..", '').replace("' );", '');
            const mainUrl='https://www.knowafest.com/explore'+modifiedEventurl;
            
            const response = await axios.get(mainUrl)
            .then(function(response){
                const html1 = response.data;
                const $1 = cheerio.load(html1);
                const registerLink = $1('a:contains("Register now")').attr('href');
                return registerLink;
                // console.log(registerLink);
            });
            
            // console.log(html1);
            
            return {
                startDate: $(tds[0]).text().trim(),
                festName: $(tds[1]).text().trim().replace(/ View More$/, ''),
                festType: $(tds[2]).text().trim(),
                collegeName: $(tds[3]).text().trim(),
                city: $(tds[4]).text().trim(),
                registerLink: response,
            };
        }).get();
        
        const eventData = await Promise.all(eventDataPromises);
        res.json({
            status: 'success',
            data: eventData
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
