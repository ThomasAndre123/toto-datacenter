require('dotenv').config()

const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const AcceptedUrl = require('./models/accepted_url');
const ResultData = require('./models/result_data');
const { Op } = require('sequelize');

app.use(express.urlencoded({
    extended: false,
    verify: (req, res, buff, encoding) => {
        req.rawBody = buff;
    },
    limit: '1mb',
}));

app.use(express.json({
    limit: '1mb',
}));


app.get('/', async (req, res) => {
    // render html table of last result
    const resultData = await ResultData.findAll({
        limit: 100,
        order: [['id', 'DESC']],
        include: [AcceptedUrl],
    });
    let buff = '';
    buff += `
    <style>
    table, th, td {
        border: 1px solid black;
    }
    th, td {
        padding: 5px;
    }
    </style>
    `;
    buff += '<table>';
    buff += '<tr>'; 
    buff += '<th>id</th>';
    buff += '<th>name</th>';
    buff += '<th>closeTime</th>';
    buff += '<th>resultTime</th>';
    buff += '<th>result</th>';
    buff += '<th>source</th>';            
    buff += '</tr>';    
    for (let i = 0; i < resultData.length; i++) {
        buff += '<tr>'; 
        buff += `<td>${resultData[i].id}</td>`;
        buff += `<td>${resultData[i].AcceptedUrl.name}</td>`;
        // convert close time to human readable
        const closeTime = new Date(resultData[i].closeTime);
        buff += `<td>${closeTime.toLocaleString()}</td>`;
        // convert result time to human readable
        const resultTime = new Date(resultData[i].resultTime);        
        buff += `<td>${resultTime.toLocaleString()}</td>`;
        buff += `<td>${resultData[i].result}</td>`;
        buff += `<td>${resultData[i].source}</td>`;
        buff += '</tr>';    
    }
    buff += '</table>';
    res.send(buff);
})

// helper function
function getDomainFromUrl(x) {
    return x.replace(/(^\w+:|^)\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/.*$/, '')
        .replace(/\?.*$/, '')
        .replace(/#.*$/, '')
}

app.post('/result', async (req, res) => {
    const { source, marketName, codeName, websiteUrl, closeTime, resultTime, result } = req.body
    // console.log(
    //     source, marketName, codeName, websiteUrl, closeTime, resultTime, result
    // )

    // check if url is accepted
    const url = getDomainFromUrl(websiteUrl)
    const acceptedUrl = await AcceptedUrl.findOne({
        where: { url: url }
    });
    if (!acceptedUrl) {
        res.json({ code:1, message: 'URL not accepted'})
        return
    }
    
    // save to db
    await ResultData.create({
        urlId: acceptedUrl.id,
        closeTime: closeTime,
        resultTime: resultTime,
        result: result,
        source: source,
    });

    res.json({ code:0, message: 'OK'})
})

app.get('/report', async (req, res) => {

    // exclude name = DEBUG if node env is production
    const where = {}
    if (process.env.NODE_ENV === 'production') {
        where.name = {
            [Op.not]: 'DEBUG'
        }
    }
    const acceptedUrls = await AcceptedUrl.findAll({
        limit: 100,
        order: [['id', 'DESC']],
        where: where,
        raw: true,
    })

    // loop each urls
    const RECORD_LIMIT = 20;
    const report = [];
    for (let i = 0; i < acceptedUrls.length; i++) {
        const acceptedUrl = acceptedUrls[i]
        const resultData = await ResultData.findAll({
            limit: RECORD_LIMIT,
            order: [['id', 'DESC']],
            where: { urlId: acceptedUrl.id, },
            raw: true,
        })
        let lastResult = null;
        let lastCloseTime = null;
        let lastResultCount = 0;
        if (resultData) {
            lastResult = resultData[0].result;
            lastCloseTime = resultData[0].closeTime;
            for (let j = 0; j < resultData.length; j++) {
                const deltaCloseTime = Math.abs(resultData[j].closeTime - lastCloseTime);
                // delta close time should not more than 1 hours
                if (resultData[j].result === lastResult && deltaCloseTime < 60 * 60 * 1000) {
                    lastResultCount += 1;
                }
            }
        }
        report.push({
            name: acceptedUrl.name,
            url: acceptedUrl.url,
            lastResult: lastResult,
            lastResultCount: lastResultCount,
            closeTime: resultData[0].closeTime,
            resultTime: resultData[0].resultTime,
        })
    }
    res.json(report)

})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})