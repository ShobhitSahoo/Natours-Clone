export const displayMap = (locations) => {

    mapboxgl.accessToken = 'pk.eyJ1Ijoic2hvYmhpdDI0IiwiYSI6ImNrb3A4c2E5bjAyY2sycHBkdDQ4ODhyMHkifQ.tH5gqW2eDw4fN0KjJMkhuQ';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/shobhit24/ckopb9huq8vwt18qvw4gxh271',
        // center: [-118.113491, 34.111745],
        // zoom: 5,
        // interactive: false
        // scrollZoom: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        //Create a marker
        const el = document.createElement('div');
        el.className = 'marker';

        //Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);

        // Add popup to map marker
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);

        //Extent map bounds to include current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 150,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}