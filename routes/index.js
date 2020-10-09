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

// var streamObj = {};
router.post('/transfer/:id/:bucketName', function (req, res) {
    var imageId = req.params.id;
    console.log('entered transfer function: ', imageId);
    let base64String = decodeURI(req.body.base64).replace(/\s/g, '+');
    let base64Image = base64String.split(';base64,').pop();
    var dir = './routes/local_temp';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        console.log('local_temp created');
    }
    var destImage;
    if (imageId.includes('.')) {
        destImage = __dirname + '\\local_temp\\' + imageId; // dropbox
    } else {
        destImage = __dirname + '\\local_temp\\' + imageId + '.png'; // google drive
    }
    fs.writeFile(destImage, base64Image, { encoding: 'base64' }, function (err) {
        // streamObj[imageId] = client.addItems({
        const stream = client.addItems({
            bucket: req.params.bucketName,
            targetPath: '/', // path in the bucket to be saved
            sourcePaths: [destImage] // adding image one by one as this transfer route is called for every image
        });

        stream.on('data', (data) => {
            console.log('data: ', imageId);
        });

        stream.on('error', (error) => {
            console.error('error: ', error);
        });

        stream.on('end', () => {
            fs.unlinkSync(destImage);
            console.log('end:', imageId);
            res.send('sent');
        });
    });
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

router.get('/listBucketDirectories/:bucket', function (req, res) {
    var list = [];
    client
        .listDirectories({ bucket: req.params.bucket })
        .then((result) => {
            const entries = result.getEntriesList();

            entries.forEach((entry) => {
                // console.log(entry.getPath());
                console.log(entry.getName());
                // console.log(entry.getIsdir());
                // console.log(entry.getCreated());
                // console.log(entry.getUpdated());
                // console.log(entry.getIpfshash());
                // console.log(entry.getSizeinbytes());
                // console.log(entry.getFileextension());
                // console.log(entry.getIslocallyavailable());
                // console.log(entry.getBackupcount());
                // console.log(entry.getMembersList());
                list.push('<b>File: </b>' + entry.getName() + ' | <b>ipfs hash: </b>' + entry.getIpfshash());
            });
            res.send(list);
        })
        .catch((err) => {
            console.error(err);
        });

})

router.get('/openFile/:bucket/:index', function (req, res) {
    var bucket = req.params.bucket;
    var index = req.params.index;

    console.log('bucket is: ', bucket, ' and index: ', index)
    const asyncFunc = async () => {
        try {
            console.log('inside async bucket is: ', bucket, ' and index: ', index)
            const dirRes = await client.listDirectories({
                bucket,
            });

            const entriesList = dirRes.getEntriesList();

            const openFileRes = await client.openFile({
                bucket,
                path: entriesList[index].getPath(),
            });

            const location = openFileRes.getLocation();
            console.log('wowo')
            fs.copyFile(location, __dirname + '\\local_temp\\' + 'imageOpened.png', (err) => {
                if (err) {
                    console.log("Error Found:", err);
                }
                else {
                    console.log('copy done')
                    var openedImage = __dirname + '\\local_temp\\' + 'imageOpened.png';
                    console.log('opened image', openedImage)
                }
            });
            res.send(location); // "/path/to/the/copied/file"
        } catch (e) {
            console.log('file open error')
        }
    };

    asyncFunc();
})

module.exports = router;