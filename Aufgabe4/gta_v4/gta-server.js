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
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());
// Setze ejs als View Engine
app.set('view engine', 'ejs');

var router = express.Router();
var standardRadius = 0.4;

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

app.use(express.static(__dirname + "/public"));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

class GeoTag {
    constructor(lat, lon, name, tags) {
        this.id;
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

var geoTagMod = (function () {
    let geotags = [];
    var id = 0;
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
        deleteGeoTag: function (id) {
            geotags = geotags.filter(t => t.id != id);
            /*            let pos;
                        for (i = 0; i < geotags.length; i++) {
                            if (geotags[i].name === p_name) {
                                pos = i;
                            }
                        }
                        geotags.splice(pos, 1);*/
        },


        getTags: function () {
            return geotags;
        },

        getTagById: function (id) {
            return geotags.filter(t => t.id === id)[0];
        },

        updateGeoTag: function (id, newTag) {
            var tag = geotags.filter(t => t.id === id)[0];
            if (tag) {
                geotags = geotags.filter(t => t.id != id)[0];
                newTag.id = id;
                geotags.push(newTag)
                return newTag;
            } else {
                throw new Error("Keine passendes GeoTag gefunden");
            }
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


//-----------------------------------------------------------------------------

/**
 * Return alle GeoTags
 */
app.get("/geotags", function (req, res) {
    //res.send("Test");
    res.json(geoTagMod.getTags());
});

/**
 * Return GeoTag nach ID
 */
app.get("/geotags/:id", function (req, res) {
    var ret = geoTagMod.getTagById(req.params.id);

    if (ret) {
        res.json(ret);
        res.status(200).send();
    } else {
        res.status(404).json({ERROR: "Es gibt kein Element mit dieser ID"});
    }
});

/**
 *  Erstelle neuen GeoTag
 */
app.post("/geotags", function (req, res) {
    try {
        res.status(201).json(geoTagMod.addGeoTag(
            req.body.latitude,
            req.body.longitude,
            req.body.name,
            req.body.tags));
    } catch (e) {
        res.status(400).json({error: e.message});
    }
});

/**
 *  Suche nach GeoTags
 */

//Search by Name
router.get("geotags/search/:query", function (req, res) {
    res.json(geoTagMod.searchGeoTagByName(req.params.query));
});

//Search by Coordinate
router.get("geotags/search/:lat/:long/:radius", function (req, res) {
    if (req.params.radius) {
        res.json(geoTagMod.searchGeoTagbyCoordinate(
            parseFloat(req.params.lat),
            parseFloat(req.params.long),
            parseFloat(req.params.radius)
        ));
    } else {
        res.json(geoTagMod.searchGeoTagbyCoordinate(
            parseFloat(req.params.lat),
            parseFloat(req.params.long),
            standardRadius
        ));
    }

});
/**
 * Lösche GeoTag
 */
router.delete("geotags/:id", function (req, res) {
    geoTagMod.deleteGeoTag(req.params.id);
    res.status(204).send();
});

/**
 * Ändere GeoTag
 */
router.put("geotags/:id", function (req, res) {
    try {
        var newTag = new GeoTag(
            req.body.name,
            req.body.latitude,
            req.body.longitude,
            red.body.hashtag
        );
        res.status(200).json(geoTagMod.updateGeoTag(req.params.id, newTag));
    } catch (e) {
        res.status(400).json({error: e.message});
    }

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
