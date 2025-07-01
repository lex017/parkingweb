// ----- Firebase Configuration -----
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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Function to fetch profile
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        const profileId = user.uid;

        db.collection("admin").doc(profileId).get()
            .then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    document.getElementById('adminID').innerText = data.name || "Admin Name";
                    
                    if (data.profileImage) {
                        document.getElementById('profileImg').src = data.profileImage;
                    }
                } else {
                    console.log("No profile found!");
                }
            })
            .catch(error => console.error("Error fetching profile:", error));
    } else {
        console.log("No user logged in");
    }
});

// Cloudinary Upload Widget
window.onload = function () {
    var myWidget = cloudinary.createUploadWidget({
        cloudName: 'doiq3nkso',
        uploadPreset: 'parking'
    }, (error, result) => {
        if (!error && result && result.event === "success") {
            console.log('Image uploaded:', result.info.secure_url);
            
            document.getElementById('profileImg').src = result.info.secure_url;
            const profileId = firebase.auth().currentUser?.uid;

            if (profileId) {
                db.collection("admin").doc(profileId).update({
                    profileImage: result.info.secure_url
                }).then(() => {
                    console.log("Profile image updated successfully!");
                }).catch(error => console.error("Error updating image:", error));
            }
        }
    });

    document.getElementById("uploadImageBtn").addEventListener("click", function () {
        myWidget.open();
    }, false);
};


// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.checkBookingsAndNotify = functions.pubsub.schedule("every 5 minutes").onRun(async (context) => {
  const now = admin.firestore.Timestamp.now();
  const snapshot = await admin.firestore().collection("bookings")
    .where("Status", "==", "pending")
    .get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const startTime = data.timestamp;
    const fcmToken = data.fcmToken; // ต้องเก็บ token ไว้ตอน login หรือสมัคร

    if (!fcmToken) continue;

    const diff = now.toDate() - startTime.toDate(); // ms
    const minutesPassed = Math.floor(diff / 60000);

    // แจ้งเตือนก่อนหมดเวลา 10 นาที
    if (minutesPassed >= 50 && data.warned !== true) {
      await sendNotification(fcmToken, "เหลือเวลา 10 นาที", "ตั๋วจองของคุณใกล้หมดเวลาแล้ว");
      await doc.ref.update({ warned: true });
    }

    // หมดเวลา
    if (minutesPassed >= 60 && data.Status !== "expired") {
      await sendNotification(fcmToken, "ตั๋วหมดเวลา", "ตั๋วจองของคุณหมดเวลาแล้ว");
      await doc.ref.update({ Status: "expired" });
    }
  }
});

async function sendNotification(token, title, body) {
  const payload = {
    notification: {
      title,
      body,
    },
    token,
  };

  try {
    await admin.messaging().send(payload);
    console.log("ส่งแจ้งเตือนเรียบร้อย ->", title);
  } catch (error) {
    console.error("ส่งแจ้งเตือนล้มเหลว:", error);
  }
}
