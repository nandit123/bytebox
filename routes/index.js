var express = require('express');
var router = express.Router();
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const os = require('os');
const uuid = require('uuid');
const { authenticate } = require('@google-cloud/local-auth');

const path = require('path');
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

const base64Img = require('base64-img');

/* GET users listing. */
router.get('/', function (req, res) {
    res.render('index', { name: "Byte me" });
});

router.post('/transfer/:id', function (req, res) {
    console.log('entered transfer function');
    // console.log('base64 value transferred: ', req.body.base64);
    // var base64Image = decodeURI(req.params.base64Image);
    // console.log('yo string: ', req.body.base64)
    var imageId = req.params.id;
    console.log('yoooooooooo')
    let base64String = decodeURI(req.body.base64).replace(/\s/g, '+');
    console.log('tony stark base64String: ', base64String)
    // Remove header
    let base64Image = base64String.split(';base64,').pop();
    var x = Math.floor((Math.random() * 10) + 1); // random number x
    var destImage = 'image' + x + '.png';
    fs.writeFile(destImage, base64Image, { encoding: 'base64' }, function (err) {
        console.log('File created');
    });
    res.send('sent');
});

router.get('/download', function (req, res) {
    // console.log('entering download')
    // async function runSample(fileId) {
    //     // Obtain user credentials to use for the request
    //     const auth = await authenticate({
    //         keyfilePath: path.join(__dirname, 'credentials.json'),
    //         scopes: [
    //             'https://www.googleapis.com/auth/drive',
    //             'https://www.googleapis.com/auth/drive.appdata',
    //             'https://www.googleapis.com/auth/drive.file',
    //             'https://www.googleapis.com/auth/drive.metadata',
    //             'https://www.googleapis.com/auth/drive.metadata.readonly',
    //             'https://www.googleapis.com/auth/drive.photos.readonly',
    //             'https://www.googleapis.com/auth/drive.readonly',
    //         ],
    //     });
    //     google.options({ auth });

    //     // For converting document formats, and for downloading template
    //     // documents, see the method drive.files.export():
    //     // https://developers.google.com/drive/api/v3/manage-downloads
    //     return drive.files
    //         .get({ fileId, alt: 'media' }, { responseType: 'stream' })
    //         .then(res => {
    //             return new Promise((resolve, reject) => {
    //                 const filePath = path.join(os.tmpdir(), uuid.v4());
    //                 console.log(`writing to ${filePath}`);
    //                 const dest = fs.createWriteStream(filePath);
    //                 let progress = 0;

    //                 res.data
    //                     .on('end', () => {
    //                         console.log('Done downloading file.');
    //                         resolve(filePath);
    //                     })
    //                     .on('error', err => {
    //                         console.error('Error downloading file.');
    //                         reject(err);
    //                     })
    //                     .on('data', d => {
    //                         progress += d.length;
    //                         if (process.stdout.isTTY) {
    //                             process.stdout.clearLine();
    //                             process.stdout.cursorTo(0);
    //                             process.stdout.write(`Downloaded ${progress} bytes`);
    //                         }
    //                     })
    //                     .pipe(dest);
    //             });
    //         });
    // }

    // const fileId = '1qvkLVJjVYXloRY6TrEbTyKjGwScxyIdr';
    // runSample(fileId).catch(console.error);
});

// router.get('/list', function (req, res) {
//     // Load client secrets from a local file.
//     fs.readFile('credentials.json', (err, content) => {
//         if (err) return console.log('Error loading client secret file:', err);
//         // Authorize a client with credentials, then call the Google Drive API.
//         authorize(JSON.parse(content), listFiles);
//     });

//     /**
//      * Create an OAuth2 client with the given credentials, and then execute the
//      * given callback function.
//      * @param {Object} credentials The authorization client credentials.
//      * @param {function} callback The callback to call with the authorized client.
//      */
//     function authorize(credentials, callback) {
//         const { client_secret, client_id, redirect_uris } = credentials.installed;
//         const oAuth2Client = new google.auth.OAuth2(
//             client_id, client_secret, redirect_uris[0]);

//         // Check if we have previously stored a token.
//         fs.readFile(TOKEN_PATH, (err, token) => {
//             if (err) return getAccessToken(oAuth2Client, callback);
//             oAuth2Client.setCredentials(JSON.parse(token));
//             callback(oAuth2Client);
//         });
//     }

//     /**
//      * Get and store new token after prompting for user authorization, and then
//      * execute the given callback with the authorized OAuth2 client.
//      * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
//      * @param {getEventsCallback} callback The callback for the authorized client.
//      */
//     function getAccessToken(oAuth2Client, callback) {
//         const authUrl = oAuth2Client.generateAuthUrl({
//             access_type: 'offline',
//             scope: SCOPES,
//         });
//         console.log('Authorize this app by visiting this url:', authUrl);
//         const rl = readline.createInterface({
//             input: process.stdin,
//             output: process.stdout,
//         });
//         rl.question('Enter the code from that page here: ', (code) => {
//             rl.close();
//             oAuth2Client.getToken(code, (err, token) => {
//                 if (err) return console.error('Error retrieving access token', err);
//                 oAuth2Client.setCredentials(token);
//                 // Store the token to disk for later program executions
//                 fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//                     if (err) return console.error(err);
//                     console.log('Token stored to', TOKEN_PATH);
//                 });
//                 callback(oAuth2Client);
//             });
//         });
//     }

//     /**
//      * Lists the names and IDs of up to 10 files.
//      * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
//      */
//     function listFiles(auth) {
//         const drive = google.drive({ version: 'v3', auth });
//         drive.files.list({
//             pageSize: 10,
//             fields: 'nextPageToken, files(id, name)',
//         }, (err, res) => {
//             if (err) return console.log('The API returned an error: ' + err);
//             const files = res.data.files;
//             if (files.length) {
//                 console.log('Files:');
//                 files.map((file) => {
//                     console.log(`${file.name} (${file.id})`);
//                 });
//             } else {
//                 console.log('No files found.');
//             }
//         });
//     }
// })

module.exports = router;