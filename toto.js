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


app.get('/', (req, res) => {
  res.send('Hello World!')
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

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})