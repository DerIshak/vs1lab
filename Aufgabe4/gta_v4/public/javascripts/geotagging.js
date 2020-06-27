/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
console.log("The script is going to start...");

// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...

// Hier wird die verwendete API für Geolocations gewählt
// Die folgende Deklaration ist ein 'Mockup', das immer funktioniert und eine fixe Position liefert.
GEOLOCATIONAPI = {
    getCurrentPosition: function (onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1540282332239
        });
    }
};

// Die echte API ist diese.
// Falls es damit Probleme gibt, kommentieren Sie die Zeile aus.
GEOLOCATIONAPI = navigator.geolocation;

/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator(geoLocationApi) {

    // Private Member

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter übergeben.
     */
    var tryLocate = function (onsuccess, onerror) {
        if (geoLocationApi) {
            geoLocationApi.getCurrentPosition(onsuccess, function (error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };

    // Auslesen Breitengrad aus der Position
    var getLatitude = function (position) {
        return position.coords.latitude;
    };

    // Auslesen Längengrad aus Position
    var getLongitude = function (position) {
        return position.coords.longitude;
    };

    // Hier Google Maps API Key eintragen
    var apiKey = "veAdrt5GM23qTweHVJukc5WXRGvHvlAA";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function (lat, lon, tags, zoom) {
        zoom = typeof zoom !== 'undefined' ? zoom : 10;

        if (apiKey === "YOUR_API_KEY_HERE") {
            console.log("No API key provided.");
            return "images/mapview.jpg";
        }

        var tagList = "&pois=You," + lat + "," + lon;
        if (tags !== undefined) tags.forEach(function (tag) {
            tagList += "|" + tag.name + "," + tag.latitude + "," + tag.longitude;
        });

        var urlString = "https://www.mapquestapi.com/staticmap/v4/getmap?key=" +
            apiKey + "&size=600,400&zoom=" + zoom + "&center=" + lat + "," + lon + "&" + tagList;

        console.log("Generated Maps Url: " + urlString);
        return urlString;
    };



    return { // Start öffentlicher Teil des Moduls ...
        // Public Member
        readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",
        erfolg: function (position) {

            document.getElementById("latitude").value = getLatitude(position);
            document.getElementById("longitude").value = getLongitude(position);
            document.getElementById("latitude-dis").value = getLatitude(position);
            document.getElementById("longitude-dis").value = getLongitude(position);

            document.getElementById("result-img").src = getLocationMapSrc(document.getElementById("latitude-dis").value, document.getElementById("longitude-dis").value);

        },
        fehler: function (msg) {
            alert(msg);
        },
        updateLocation: function () {
            if (document.getElementById("latitude").value === "" && document.getElementById("longitude").value === "") {
                console.log("locating...");
                tryLocate(this.erfolg, this.fehler);
            } else {
                document.getElementById("result-img").src =
                    getLocationMapSrc(document.getElementById("latitude").value,
                        document.getElementById("longitude").value,
                        JSON.parse(document.getElementById("result-img").dataset.tags));
            }

        }




    }; // ... Ende öffentlicher Teil
})(GEOLOCATIONAPI);

/**
 * $(function(){...}) wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */

class GeoTag {
    constructor(lat, lon, name, tags) {
        this.latitude = lat;
        this.longitude = lon;
        this.name = name;
        this.tags = tags;
    }
}

/*function listGenerator(value){
    console.log(value);
    var listElement = document.createElement("li");
    var inhalt = JSON.parse(value);
    var listInhalt = document.createTextNode(inhalt.name + " ( " + inhalt.latitude + " , " + inhalt.longitude + ") " + inhalt.tags);
    listElement.appendChild(listInhalt);
    document.getElementById("results").appendChild("listElement");
}*/


function updateSite(resText){
    var antwort = JSON.parse(resText);
    document.getElementById("results").innerHTML = "";
    for(var i = 0;i<antwort.length;i++){
        var ulElement = document.getElementById("results");
        var listElement = document.createElement("li");
        var strInhalt = antwort[i].name + " ( " + antwort[i].latitude + " , " + antwort[i].longitude + ") " + antwort[i].tags;


        if (antwort[i].tags === undefined) strInhalt = antwort[i].name + " ( " + antwort[i].latitude + " , " + antwort[i].longitude + ") ";

        var listInhalt = document.createTextNode(strInhalt);

        listElement.appendChild(listInhalt);
        ulElement.appendChild(listElement);
    }


    document.getElementById("result-img").setAttribute("data-tags",resText);
    gtaLocator.updateLocation();
}

$(document).ready(function () {
    gtaLocator.updateLocation();
    //console.log(document.getElementById("result-img").dataset.tags);
    document.getElementById("tagsubmit").addEventListener("click",function (event) {
        event.preventDefault();
        var ajax = new XMLHttpRequest();
        var gtag = new GeoTag(document.getElementById("latitude").value,document.getElementById("longitude").value,
            document.getElementById("name").value,document.getElementById("hashtag").value);
        ajax.onreadystatechange = function() {
            if(ajax.readyState === 4){
                updateSite(ajax.responseText);
            }
        }
        ajax.open("POST","/tagging",true);
        ajax.setRequestHeader("Content-Type", "application/json");
        //console.log(JSON.stringify(gtag));
        ajax.send(JSON.stringify(gtag));
    } );

    document.getElementById("filtersubmit").addEventListener("click", function (event) {
        event.preventDefault();
        var ajax = new XMLHttpRequest();

        ajax.open("GET","/discovery?searchterm=" + document.getElementById("searchterm").value,true);
        ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        ajax.send();
    } );
});