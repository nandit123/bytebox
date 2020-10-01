global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest; // required for space-client
var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');
const { SpaceClient } = require('@fleekhq/space-client');

// default port exposed by the daemon for client connection is 9998
const client = new SpaceClient({
    url: `http://0.0.0.0:9998`,
});


/* GET users listing. */
router.get('/', function (req, res) {
    res.render('index', { name: "Byte me" });
});

router.post('/transfer/:id', function (req, res) {
    console.log('entered transfer function');
    var imageId = req.params.id;
    let base64String = decodeURI(req.body.base64).replace(/\s/g, '+');
    let base64Image = base64String.split(';base64,').pop();

    var dir = './routes/local_temp';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        console.log('local_temp created');
    }
    var destImage = __dirname + '\\local_temp\\image_' + imageId + '.png';

    fs.writeFile(destImage, base64Image, { encoding: 'base64' }, function (err) {
        console.log('File created');
    });

    const stream = client.addItems({
        bucket: 'bucket5',
        targetPath: '/', // path in the bucket to be saved
        sourcePaths: [destImage] // adding image one by one as this transfer route is called for every image
    });

    stream.on('data', (data) => {
        console.log('data: ', data);
    });

    stream.on('error', (error) => {
        console.error('error: ', error);
    });

    stream.on('end', () => {
        fs.unlinkSync(destImage);
        console.log('end');
    });

    res.send('sent');
});


module.exports = router;