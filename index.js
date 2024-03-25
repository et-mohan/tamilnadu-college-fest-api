const PORT = 3000;

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// Reusing axios instance
const axiosInstance = axios.create();

app.get('/', function (req, res) {
    res.json("Hello, welcome to my website.");
});

app.get('/fests', async function (req, res) {
    try {
        const response = await axiosInstance.get('https://www.knowafest.com/explore/state/Tamil-Nadu');
        const html = response.data;
        const $ = cheerio.load(html);
        const eventData = [];

        // Iterate synchronously using for...of loop
        for (const element of $('table:contains(tr) tr:not(:first-child)')) {
            const tds = $(element).find('td');
            const eventUrl = $(element).attr('onclick');
            const modifiedEventurl = eventUrl.replace("window.open('..", '').replace("' );", '');
            const mainUrl = 'https://www.knowafest.com/explore' + modifiedEventurl;

            try {
                const response = await axiosInstance.get(mainUrl);
                const html1 = response.data;
                const $1 = cheerio.load(html1);
                const registerLink = $1('a:contains("Register now")').attr('href');

                eventData.push({
                    startDate: $(tds[0]).text().trim(),
                    festName: $(tds[1]).text().trim().replace(/ View More$/, ''),
                    festType: $(tds[2]).text().trim(),
                    collegeName: $(tds[3]).text().trim(),
                    city: $(tds[4]).text().trim(),
                    registerLink: registerLink
                });
            } catch (err) {
                console.error(err);
                // Don't send response here, continue to the next iteration
            }
        }

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
