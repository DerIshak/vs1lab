/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

// TODO: CODE ERGÄNZEN
app.use(express.static(__dirname + "/public"));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

// TODO: CODE ERGÄNZEN
class GeoTag {
    constructor(lat, lon, name, tags) {
        this.latitude = lat;
        this.longitude = lon;
        this.name = name;
        this.tags = tags;
    }
}

/** DONE
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags. ok
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate. ok
 * - Funktion zur Suche von Geo Tags nach Suchbegriff. ok
 * - Funktion zum hinzufügen eines Geo Tags. ok
 * - Funktion zum Löschen eines Geo Tags. ok
 */

// TODO: CODE ERGÄNZEN
var geoTagMod = (function () {
    let geotags = [];
    return {
        searchGeoTagbyCoordinate: function (p_lat, p_lon, p_radius) {
            let geotagresult = [];
            for (i = 0; i < geotags.length; i++) {
                let x = Math.sqrt(Math.pow((geotags[i].latitude - p_lat), 2) + Math.pow((geotags[i].longitude - p_lon), 2));
                if (x <= p_radius) {
                    geotagresult.push(geotags[i]);
                }
            }
            return geotagresult;
        },
        searchGeoTagByName: function (p_name) {
            let geotagresult = [];
            for (i = 0; i < geotags.length; i++) {
                if (geotags[i].name.indexOf(p_name) >= 0) {
                    geotagresult.push(geotags[i]);
                }
            }
            return geotagresult;
        },
        addGeoTag: function (p_lat, p_lon, p_name, p_tags) {
            let newgeotag = new GeoTag(p_lat, p_lon, p_name, p_tags);
            geotags.push(newgeotag);
        },
        deleteGeoTag: function (p_name) {
            let pos;
            for (i = 0; i < geotags.length; i++) {
                if (geotags[i].name === p_name) {
                    pos = i;
                }
            }
            geotags.splice(pos, 1);
        }
    }
})();



/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function (req, res) {
    res.render('gta', {
        r_longitude: undefined,
        r_latitude: undefined,
        taglist: []
    });
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */


app.post('/tagging', function (req, res) {
    console.log(req.body);
    geoTagMod.addGeoTag(req.body.latitude, req.body.longitude, req.body.name, req.body.hashtag);
    res.send(geoTagMod.searchGeoTagbyCoordinate(req.body.latitude, req.body.longitude, 0.4));
});


/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

app.get('/discovery', function (req, res) {
    res.send(geoTagMod.searchGeoTagByName(req.query.searchterm));
});


/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
