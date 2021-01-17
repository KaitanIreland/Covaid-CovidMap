function getNews() {
    const searchFrom = document.querySelector('.search');
    const input = document.querySelector('.input');
    const newsList = document.querySelector('.news-list');
    var flag = 0;

    searchFrom.addEventListener('submit', newsFetch)

    async function newsFetch(e) {
        // checks if search field is empty
        if (input.value == '' && flag == 0) {
            alert('Please enter search!')
            return
        }

        if (flag == 0) {            
            newsList.innerHTML = ''

            e.preventDefault()
            
            const response = await fetch('/news');
            const apiKey = await response.json();

            let topic = input.value;

            // search for testing centers in this location, pin them to map
            addTestingCenters(topic);

            let url = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${topic}&fq=covid&sort=newest&api-key=${apiKey}` // api query

            // iterates through JSON returned by api and creates list elements for page
            fetch(url).then((res)=>{
                return res.json()
            }).then((data)=>{
                data.response.docs.forEach(article =>{
                    let li = document.createElement('li');
                    let a = document.createElement('a');
                    a.setAttribute('href', article.web_url); // attaches url/link to list element
                    a.setAttribute('target', '_blank');
                    a.textContent = article.headline.main; // sets list element name/title
                    li.appendChild(a);
                    newsList.appendChild(li); // final element created
                })
            }).catch((error)=>{
                console.log(error)
            })
            flag = 1;
        }

        // add heading above the news list
        var heading = document.createElement("H3");
        var headingText = document.createTextNode("News");
        heading.appendChild(headingText);
        newsList.insertBefore(heading, newsList.childNodes[0]);
    }
}

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 34.0522, lng: -118.2437 },
    zoom: 10
  });
  //setMarkers(map)
  
  // set markers for testing centers in default map location
  addTestingCenters("");
  
}

// add some hard-coded test markers to map
/*
var testingSites = [
    ['CVS', 34.187508, -118.369777],
    ['Mend Urgent Care', 34.15911, -118.449056],
    ['Exer Urgent Care', 34.045652, -118.43208],
    ['Harbor-UCLA', 33.828807, -118.298656],
    ['LAC+USC Medical Center', 34.057533, -118.207559]
];

function setMarkers(map) {
    var infoWindow = new google.maps.InfoWindow();
    var MarkerClickHandler = function() {
        infoWindow.close();
        map.setZoom(12);
        infoWindow = new google.maps.InfoWindow({position: this.getPosition()});
        infoWindow.setContent(this.title);
        infoWindow.open(map);
        map.setCenter(this.getPosition());
    };
    for (var i = 0; i < testingSites.length; i++) {
        // set marker for each testing site
        var testingSite = testingSites[i];
        const marker = new google.maps.Marker({
            position: {lat: testingSite[1], lng: testingSite[2]},
            map: map,
            title: testingSite[0]
        });
        google.maps.event.addListener(marker, 'click', MarkerClickHandler);
    };
}
*/


var markers = [];
function setTestingCenterMarker(testingCenter) {
    const marker = new google.maps.Marker({
        position: testingCenter.geometry.location,
        map: map,
        title: testingCenter.name
    });
    var infoWindow = new google.maps.InfoWindow();
    var MarkerClickHandler = function() {
        infoWindow.close();
        map.setZoom(12);
        infoWindow = new google.maps.InfoWindow({position: this.getPosition()});
        infoWindow.setContent(this.title);
        infoWindow.open(map);
        map.setCenter(this.getPosition());
    };
    google.maps.event.addListener(marker, 'click', MarkerClickHandler);

    markers.push(marker);
}

// use Places API to search for COVID-19 testing centers in a particular region
function addTestingCenters(location) {
    location = String(location)
    const input = location.concat(' covid testing');

    var request = {
        query: input,
        fields: ["name", "geometry"]
    };

    // clear out old markers
    if(markers.length > 0) {
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
    }
    markers = []

    service = new google.maps.places.PlacesService(map);
    
    service.textSearch(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                setTestingCenterMarker(results[i]);
            }
             map.setCenter(results[0].geometry.location);
        }
    });
}
