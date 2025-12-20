// Connexion Token
mapboxgl.accessToken = 'pk.eyJ1IjoiZGFibzIyIiwiYSI6ImNremltNXR2aTMxaG0ydW8xYmcwOGU3YjUifQ.33TjJKovMQpZ1dkC0S9K3Q';

// Configuration de la carte
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/satellite-streets-v12',
center: [6.1753, 44.06335],// En degré décimal 
zoom: 12, // zoom
pitch: 50, // Inclinaison
bearing:31 // Rotation
});

// Ecouteur du menu Select des fonds de carte
document.getElementById('basemap-select').addEventListener('change', function(e) {
    var newStyle = e.target.value;

    var currentCamera = {
        center: map.getCenter(),
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing()
    };

    map.setStyle(newStyle);

    // Après le chargement du nouveau style, repositionner la caméra
    // puis réinitialiser les checkboxes / visibilités de couches
    map.once('style.load', function() {
        map.jumpTo(currentCamera);
        try {
            if (typeof resetCheckboxes === 'function') resetCheckboxes();
        } catch (err) {
            console.warn('resetCheckboxes failed after style change', err);
        }
    });
});

// *** 1. APPEL DES COUCHES *** //

map.on('style.load', () => {

    map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
    });

    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

    // Ajout Occupation du sol (RPG)
    map.addSource('RPG', {
        type: 'vector',
        url: 'mapbox://dabo22.b21llohm'
    });
           
    map.addLayer({
        'id': 'RPG',
        'type': 'fill',
        'source': 'RPG',
        'source-layer':'RPG_ASAs_4326-9y53t2',
        'layout': {'visibility': 'none'},
        'paint': {
            'fill-color': [
                'match',
                ['get', 'Classeur10'],
                'ARBORICULTURE', '#FF0000',
                'CÉRÉALES', '#FFFF00',
                'MARAICHAGE', '#0000FF',
                'OLÉAGINEUX', '#00FF00',
                'PAPAM', '#FF00FF',
                'PRAIRIES', '#00FFFF',
                '#808080'
            ],
            'fill-opacity': 0.7
        }
    });

    // Ajout du périmètre des ASA
    map.addSource('asa', {
        type : 'vector',
        url : 'mapbox://dabo22.c1xfg5g8'
    });

    map.addLayer({
        'id': 'asa',
        'type': 'fill',
        'source': 'asa',
        'source-layer':'perimetre_asa_4326-d6053d',
        'layout': {'visibility': 'none'},
        'paint': {
            'fill-color': [
                'match',
                ['get', 'nom'],
                'ASA du Canal de la Plaine de Gaubert', '#f94144',
                'ASA du canal de la Grande Iscle', '#f3722c',
                'ASA Canal du Nigas', '#90be6d',
                '#577590'
            ],
            'fill-opacity': 0.45,
            'fill-outline-color': '#333333'
        },
    });

    // Ajout itinéraires PDIPR
    map.addSource('itineraire', {
        type: 'vector',
        url: 'mapbox://dabo22.cd4kvjsz'
    }); 
      
    map.addLayer({
        'id': 'itineraire',
        'type': 'line',
        'source': 'itineraire',
        'source-layer':'pdipr-7c2ley',
        'layout': {'visibility': 'none', 'line-join': 'round','line-cap': 'round'},
        'paint': {'line-width': 2, 'line-color': 'red'}
    });

    // Ajout route bleue
    map.addSource('route-bleue', {
        type: 'vector',
        url: 'mapbox://dabo22.99iasv9y'
    }); 
      
    map.addLayer({
        'id': 'route-bleue',
        'type': 'line',
        'source': 'route-bleue',
        'source-layer':'sentier_touriste-76oftq',
        'layout': {'visibility': 'none', 'line-join': 'round','line-cap': 'round'},
        'paint': {'line-width': 2, 'line-color': 'yellow'}
    });

    // Ajout canaux Bléone
    map.addSource('bleone', {
        type: 'vector',
        url: 'mapbox://dabo22.83ztmm3k'
    });
      
    map.addLayer({
        'id': 'bleone',
        'type': 'line',
        'source': 'bleone',
        'source-layer':'canaux_4326-57pv00',
        'layout': {'visibility': 'none', 'line-join': 'round','line-cap': 'round'},
        'paint': {
            'line-width': 2,
            'line-color': [
                'match',
                ['get', 'lib_type'],
                'primaire', 'blue',
                'secondaire', '#577590',
                'souterrain', 'violet',
                'brown'
            ]
        }
    });

    // *** EQUIPEMENTS ***
    // Siphons
    map.addSource('eqpmt', {
        type: 'vector',
        url: 'mapbox://dabo22.1xnj4tl8'
    });

    map.addLayer({
        'id': 'siph',
        'type': 'circle',
        'source': 'eqpmt',
        'source-layer': 'Equip4326-66b30p',
        'filter' : ["all", ["==",'typ_nom','Siphon']],
        'layout': {'visibility': 'none'},
        paint: {
            'circle-radius': 6,
            'circle-opacity': 0.7,
            'circle-color': [
                'match',
                ['get', 'typ_equip'],
                'SIPH', '#FF0000',
                'REGL', '#FFFF00',
                'PART', '#0000FF',
                'POMP', '#00FF00',
                'MART', '#FF00FF',
                'DEGR', '#00FFFF',
                'AQUE', '#7A4E4E',
                '#808080'
            ]
        }
    });

    // Règles
map.addLayer({
    'id': 'regl',
    'type': 'circle',
    'source': 'eqpmt',
    'source-layer': 'Equip4326-66b30p',
	'filter' : ["all", ["==",'typ_nom','Règle']],
    'layout': {
        'visibility': 'none'
    },
    paint: {
        'circle-radius': 6,
        'circle-opacity': 0.7,
        'circle-color': [
            'match',
            ['get', 'typ_equip'],
            'SIPH', '#FF0000',
            'REGL', '#FFFF00',
            'PART', '#0000FF',
            'POMP', '#00FF00',
            'MART', '#FF00FF',
            'DEGR', '#00FFFF',
            'AQUE', '#7A4E4E',
            '#808080'
        ]
    }
});

// Partiteurs
map.addLayer({
    'id': 'part',
    'type': 'circle',
    'source': 'eqpmt',
    'source-layer': 'Equip4326-66b30p',
	'filter' : ["all", ["==",'typ_nom','Partiteur']],
    'layout': {
        'visibility': 'none'
    },
    paint: {
        'circle-radius': 6,
        'circle-opacity': 0.7,
        'circle-color': [
            'match',
            ['get', 'typ_equip'],
            'SIPH', '#FF0000',
            'REGL', '#FFFF00',
            'PART', '#0000FF',
            'POMP', '#00FF00',
            'MART', '#FF00FF',
            'DEGR', '#00FFFF',
            'AQUE', '#7A4E4E',
            '#808080'
        ]
    }
});

// Pompes
map.addLayer({
    'id': 'pomp',
    'type': 'circle',
    'source': 'eqpmt',
    'source-layer': 'Equip4326-66b30p',
	'filter' : ["all", ["==",'typ_nom','Pompe']],
    'layout': {
        'visibility': 'none'
    },
    paint: {
        'circle-radius': 6,
        'circle-opacity': 0.7,
        'circle-color': [
            'match',
            ['get', 'typ_equip'],
            'SIPH', '#FF0000',
            'REGL', '#FFFF00',
            'PART', '#0000FF',
            'POMP', '#00FF00',
            'MART', '#FF00FF',
            'DEGR', '#00FFFF',
            'AQUE', '#7A4E4E',
            '#808080'
        ]
    }
})

// Martelières
map.addLayer({
    'id': 'mart',
    'type': 'circle',
    'source': 'eqpmt',
    'source-layer': 'Equip4326-66b30p',
	'filter' : ["all", ["==",'typ_nom','Martelière']],
    'layout': {
        'visibility': 'none'
    },
    paint: {
        'circle-radius': 6,
        'circle-opacity': 0.7,
        'circle-color': [
            'match',
            ['get', 'typ_equip'],
            'SIPH', '#FF0000',
            'REGL', '#FFFF00',
            'PART', '#0000FF',
            'POMP', '#00FF00',
            'MART', '#FF00FF',
            'DEGR', '#00FFFF',
            'AQUE', '#7A4E4E',
            '#808080'
        ]
    }
})

// Degrillage
map.addLayer({
    'id': 'deg',
    'type': 'circle',
    'source': 'eqpmt',
    'source-layer': 'Equip4326-66b30p',
	'filter' : ["all", ["==",'typ_nom','Degrillage']],
    'layout': {
        'visibility': 'none'
    },
    paint: {
        'circle-radius': 6,
        'circle-opacity': 0.7,
        'circle-color': [
            'match',
            ['get', 'typ_equip'],
            'SIPH', '#FF0000',
            'REGL', '#FFFF00',
            'PART', '#0000FF',
            'POMP', '#00FF00',
            'MART', '#FF00FF',
            'DEGR', '#00FFFF',
            'AQUE', '#7A4E4E',
            '#808080'
        ]
    }
})

// Aqueducs
map.addLayer({
    'id': 'aq',
    'type': 'circle',
    'source': 'eqpmt',
    'source-layer': 'Equip4326-66b30p',
	'filter' : ["all", ["==",'typ_nom','Aqueduc']],
    'layout': {
        'visibility': 'none'
    },
    paint: {
        'circle-radius': 6,
        'circle-opacity': 0.7,
        'circle-color': [
            'match',
            ['get', 'typ_equip'],
            'SIPH', '#FF0000',
            'REGL', '#FFFF00',
            'PART', '#0000FF',
            'POMP', '#00FF00',
            'MART', '#FF00FF',
            'DEGR', '#00FFFF',
            'AQUE', '#7A4E4E',
            '#808080'
        ]
    }
})

    map.addLayer({
        "id": "hydrologie",
        "type": "line",
        "source": "mapbox-streets-v8",
        "source-layer": "waterway",
        'layout': {'visibility': 'none'},
        "paint": {"line-color": "blue","line-width": 4}
    }); // appel de couche car la source est la même que pour les routes

    // Batiments 3D
    map.addLayer({
        'id': 'Batiments_3D',
        'source': 'mapbox-streets-v8', // Correspond à OSM
        'source-layer': 'building',
        'layout': {'visibility': 'none'},
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#555555',
            'fill-extrusion-height': {'type': 'identity','property': 'height'},
            'fill-extrusion-base': {'type': 'identity','property': 'min_height'},
            'fill-extrusion-opacity': 0.8
        }
    });

    // Bâtiments 2D
    map.addLayer({
        "id": "batiments",
        "type": "fill",
        "source": "mapbox-streets-v8",
        "source-layer": "building",
        'layout': {'visibility': 'none'},
        "paint": {"fill-color": "#FEFEFE","fill-opacity": 0.8}
    });

    // Routes
    map.addLayer({
        "id": "Routes",
        "type": "line",
        "source": "mapbox-streets-v8",
        "layout": {'visibility': 'none'},
        "source-layer": "road",
        "filter": ["all",  ["in", "track", "street"]],
        "paint": {"line-color": "#FF7F50", "line-width": 1}
    }); // Voir doc Mapbox pour les options de filtre

    // Fonction switchlayer
    switchlayer = function (lname) {
        if (document.getElementById(lname + "CB").checked) {
            map.setLayoutProperty(lname, 'visibility', 'visible');
        } else {
            map.setLayoutProperty(lname, 'visibility', 'none');
        }
    };

}); // Fin map.on('style.load')

// Geocoder
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    language: 'fr-FR',
    mapboxgl: mapboxgl
});
map.addControl(geocoder, 'bottom-right');

// Boutons navigation
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');

// Echelle cartographique
map.addControl(new mapboxgl.ScaleControl({
    maxWidth: 200,
    unit: 'metric'
}));


// Survol bleone
var bleoneHoverPopup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });
map.on('mouseenter', 'bleone', function() {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'bleone', function() {
    map.getCanvas().style.cursor = '';
    bleoneHoverPopup.remove();
});
map.on('mousemove', 'bleone', function(e) {
    var feature = e.features && e.features[0];
    if (!feature) { bleoneHoverPopup.remove(); return; }
    var name = feature.properties && feature.properties.lib_type ? feature.properties.lib_type : 'ASA';
    bleoneHoverPopup.setLngLat(e.lngLat)
        .setHTML('<strong>' + name + '</strong>')
        .addTo(map);
});

// Survol ASA
var asaHoverPopup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });
map.on('mouseenter', 'asa', function() {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'asa', function() {
    map.getCanvas().style.cursor = '';
    asaHoverPopup.remove();
});
map.on('mousemove', 'asa', function(e) {
    var feature = e.features && e.features[0];
    if (!feature) { asaHoverPopup.remove(); return; }
    var name = feature.properties && feature.properties.nom ? feature.properties.nom : 'ASA';
    asaHoverPopup.setLngLat(e.lngLat)
        .setHTML('<strong>' + name + '</strong>')
        .addTo(map);
});

// Survol RPG
var RPGHoverPopup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });
map.on('mouseenter', 'RPG', function() {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'RPG', function() {
    map.getCanvas().style.cursor = '';
    RPGHoverPopup.remove();
});
map.on('mousemove', 'RPG', function(e) {
    var feature = e.features && e.features[0];
    if (!feature) { RPGHoverPopup.remove(); return; }
    var name = feature.properties && feature.properties.Classeur10 ? feature.properties.Classeur10 : 'type';
    RPGHoverPopup.setLngLat(e.lngLat)
        .setHTML('<strong>' + name + '</strong>')
        .addTo(map);
});

// Réinitialisation des checkboxes
function resetCheckboxes() {
    var cbs = document.querySelectorAll('.map-overlay-inner input[type="checkbox"]');
    cbs.forEach(function(cb) {
        try { cb.checked = false; } catch (e) { }
    });

    if (typeof map !== 'undefined' && map && typeof map.getLayer === 'function') {
        cbs.forEach(function(cb) {
            var layer = cb.value;
            try {
                if (map.getLayer(layer)) map.setLayoutProperty(layer, 'visibility', 'none');
            } catch (e) { }
        });
    }
}

window.addEventListener('load', function() {
    resetCheckboxes();
    resetBasemapSelect();
    setTimeout(resetCheckboxes, 600);
});

// Réinitialiser le select du fond de plan au chargement de la page
function resetBasemapSelect() {
    var basemapSelect = document.getElementById('basemap-select');
    if (basemapSelect) {
        // Définir la valeur par défaut sur "Satellite"
        basemapSelect.value = 'mapbox://styles/mapbox/satellite-v9';
        // Forcer le changement de style via l'écouteur d'événement
        var event = new Event('change', { bubbles: true });
        basemapSelect.dispatchEvent(event);
    }
}

