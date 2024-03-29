var express = require('express');
var app = express();

var bodyParser = require('body-parser')
// create application/json parser
var jsonParser = bodyParser.json()

var path = require('path');

app.use(express.static('public'));

// viewed at http://localhost:8080
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/music-ball.html', function (req, res) {
    res.sendFile(path.join(__dirname + '/music-ball.html'));
});

app.get('/music-ball-control.html', function (req, res) {
    res.sendFile(path.join(__dirname + '/music-ball-control.html'));
});

// create file upload endpoint
var multer = require('multer');

var upload = multer({ storage: storage, dest: "/public/audio/" });

app.post('/upload', upload.single('audio'), function (req, res, next) {
    res.json({ "filename": req.file.filename, "type": req.file.mimetype });
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/public/audio/');
    }
});

var fs = require('fs');

// req: filename & type; res: name of the selected marker
app.post('/update', jsonParser, function (req, res) {
    var db_filename = './public/data/db.json';
    var db = JSON.parse(fs.readFileSync(db_filename).toString());

    let selectedMarker = null;

    console.log(req.body);

    db.markers.forEach(function (marker) {
        if (!marker.in_use) {
            // only continue if no marker has been selected
            if (!selectedMarker) {
                // record filename
                marker.audio = '/audio/' + req.body.filename + '.' + req.body.type;
                marker.in_use = true;

                console.log('saving to db...');
                console.log(marker);
                selectedMarker = marker.name;
                console.log(selectedMarker);
            }
        }
    });

    fs.writeFileSync(db_filename, JSON.stringify(db));

    console.log('selected marker in POST: ' + selectedMarker);
    res.json({ "selectedMarker": selectedMarker });
});

/*
File filter is an optional function. Let’s say you only want users to upload videos and images, then you can filter out other types of the file using mimetype.

*/

app.listen(8080);