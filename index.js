const PORT = 3000;

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.get('/', function (req, res) {
    res.json("Hello, welcome to my website.");
});

app.get('/news', function (req, res) {
    axios.get('https://www.knowafest.com/explore/state/Tamil-Nadu')
        .then(function (response) {
            const html = response.data;
            const $ = cheerio.load(html);

            // Extracting table data
            const eventData = $('table:contains(tr) tr:not(:first-child)').map((index, element) => {
                const tds = $(element).find('td');
                return {
                    startDate: $(tds[0]).text().trim(),
                    festName: $(tds[1]).text().trim(),
                    FestType: $(tds[2]).text().trim(),
                    CollegeName: $(tds[3]).text().trim(),
                    city: $(tds[4]).text().trim()
                };
            }).get();

            // Sending the extracted data as response
            res.json({
                status: 'success',
                data: eventData
            });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
