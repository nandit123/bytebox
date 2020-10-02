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

router.post('/transfer/:id/:bucketName', function (req, res) {
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
        bucket: req.params.bucketName,
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

router.post('/createFolder/:name', function (req, res) {
    client
        .createBucket({ slug: req.params.name })
        .then((res) => {
            const bucket = res.getBucket();

            console.log(bucket.getKey());
            console.log(bucket.getName());
            console.log(bucket.getPath());
            console.log(bucket.getCreatedat());
            console.log(bucket.getUpdatedat());
        })
        .catch((err) => {
            console.error(err);
        });
    res.send('bucket created')
});

router.get('/listBuckets', function (req, res) {
    var bucketList = [];
    client
        .listBuckets()
        .then((result) => {
            const buckets = result.getBucketsList();

            buckets.forEach((bucket) => {
                console.log('key:', bucket.getKey());
                console.log('name:', bucket.getName());
                bucketList.push(bucket.getName());
                console.log('path:', bucket.getPath());
                console.log('createdAt:', bucket.getCreatedat());
                console.log('updatedAt:', bucket.getUpdatedat());
            });
            console.log(bucketList);
            res.send(bucketList);
        })
        .catch((err) => {
            console.error(err);
        });
})


module.exports = router;