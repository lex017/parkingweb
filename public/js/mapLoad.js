
        // Firebase Configuration
        const firebaseConfig = {
            apiKey: "AIzaSyD9h0g0YOKvq7_6HpD9ftGyH0bXfxXNLIk",
            authDomain: "parkingapp-47d6d.firebaseapp.com",
            projectId: "parkingapp-47d6d",
            storageBucket: "parkingapp-47d6d.appspot.com",
            messagingSenderId: "77735745622",
            appId: "1:77735745622:web:37682bcfabdcfd2f47c3f7",
            measurementId: "G-FH3WFGN2Q5"
        };

        // Initialize Firebase
        const app = firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore(app);

        let map;

        // Initialize the Google Map
        function initMap() {
            const location = { lat: 17.9757, lng: 102.6331 }; // Vientiane, Laos

            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 13,
                center: location,
            });

            loadMarkers();
        }

        // Load markers from Firebase Firestore
        function loadMarkers() {
            db.collection("parking_locations").get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.location && data.location.latitude && data.location.longitude) {
                        const position = new google.maps.LatLng(data.location.latitude, data.location.longitude);
                        const marker = new google.maps.Marker({
                            position: position,
                            map: map,
                            title: data.address || "Parking Location", // Title or address
                        });
                    }
                });
            });
        }
    