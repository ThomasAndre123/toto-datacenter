require('dotenv').config()

const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const AcceptedUrl = require('./models/accepted_url');
const ResultData = require('./models/result_data');

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
    const data = await ResultData.findAll({
        limit: 100,
        order: [['id', 'DESC']],
        include: [AcceptedUrl],
    })

    // group by url
    const urlMap = {}
    for (let i = 0; i < data.length; i++) {
        const url = data[i].AcceptedUrl.name
        if (!urlMap[url]) {
            urlMap[url] = []
        }
        urlMap[url].push(data[i])
    }

    // response as json
    const result = []
    for (const url in urlMap) {
        const arr = urlMap[url]
        const obj = {
            url: url,
            count: arr.length,
            lastResult: arr[0].result,
            lastResultTime: arr[0].resultTime,
        }
        result.push(obj)
    }
    res.json(result)

})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})