// logic.js - TAXI PI Core Logic

let currentUser = null;
let currentLanguage = 'en';
const rates = {
  motor: 1900,
  car: 3000,
  courier: 1700
};

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    document.getElementById('role-selection').style.display = 'block';
    document.getElementById('user-menu').style.display = 'block';
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('user-info').innerText = user.email;
    loadUserData(user.uid);
  } else {
    currentUser = null;
    document.getElementById('auth-section').innerHTML = renderAuthForms();
  }
});

function renderAuthForms() {
  return `
    <h5 class="text-center">Welcome To TAXI PI<br>By Pioneers From Pioneers</h5>
    <input type="email" id="loginEmail" placeholder="Email" class="form-control mb-2">
    <input type="password" id="loginPassword" placeholder="Password" class="form-control mb-2">
    <button class="btn btn-light btn-block" onclick="login()">Login</button>
    <hr>
    <input type="email" id="regEmail" placeholder="New Email" class="form-control mb-2">
    <input type="password" id="regPassword" placeholder="New Password" class="form-control mb-2">
    <button class="btn btn-light btn-block" onclick="register()">Register</button>
    <hr>
    <input type="email" id="resetEmail" placeholder="Email to reset" class="form-control mb-2">
    <button class="btn btn-outline-light btn-sm btn-block" onclick="forgotPassword()">Forgot Password</button>
  `;
}

function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  firebase.auth().signInWithEmailAndPassword(email, password).catch(alert);
}

function register() {
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(alert);
}

function forgotPassword() {
  const email = document.getElementById('resetEmail').value;
  firebase.auth().sendPasswordResetEmail(email).then(() => alert('Check your email')).catch(alert);
}

function logout() {
  firebase.auth().signOut();
  location.reload();
}

function showRoleForm() {
  const role = document.getElementById('userRole').value;
  const driverFields = document.getElementById('driver-fields');
  document.getElementById('verificationForm').style.display = 'block';
  driverFields.style.display = (role === 'car' || role === 'motor' || role === 'courier') ? 'block' : 'none';
  document.getElementById('calculate-fare').style.display = (role === 'passenger') ? 'block' : 'none';
  document.getElementById('deposit-section').style.display = (role !== 'passenger') ? 'block' : 'none';
}

function calculateFare() {
  const origin = document.getElementById('start').value;
  const destination = document.getElementById('end').value;
  const type = document.getElementById('vehicleType').value;

  const service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix({
    origins: [origin],
    destinations: [destination],
    travelMode: 'DRIVING'
  }, (response, status) => {
    if (status !== 'OK') return alert('Error: ' + status);
    const distanceMeters = response.rows[0].elements[0].distance.value;
    const distanceKM = distanceMeters / 1000;
    const fare = Math.ceil(distanceKM * rates[type]);
    document.getElementById('fare-result').innerText = `Distance: ${distanceKM.toFixed(2)} km\nFare: Rp ${fare.toLocaleString()}`;

    if (currentUser && type !== 'passenger') {
      deductBalance(currentUser.uid, fare);
    }
  });
}

function deductBalance(uid, fare) {
  const dbRef = firebase.database().ref('users/' + uid);
  dbRef.once('value').then(snapshot => {
    const user = snapshot.val();
    if (!user) return;
    let balance = parseInt(user.balance || 0);
    const fee = Math.ceil(fare * 0.06);
    const newBalance = balance - fee;
    if (newBalance < 0) {
      alert('Saldo tidak cukup untuk potongan biaya (6%).');
    } else {
      dbRef.update({ balance: newBalance });
      alert(`Potongan 6%: Rp ${fee}. Sisa saldo: Rp ${newBalance}`);
      document.getElementById('saldo-display').innerText = 'Rp ' + newBalance.toLocaleString();
    }
  });
}

function loadUserData(uid) {
  const dbRef = firebase.database().ref('users/' + uid);
  dbRef.once('value').then(snapshot => {
    const user = snapshot.val();
    if (user && user.balance != null) {
      const balanceText = 'Rp ' + parseInt(user.balance).toLocaleString();
      document.getElementById('saldo-display').innerText = balanceText;
    }
    if (user && user.role) {
      document.getElementById('role-display').innerText = user.role.toUpperCase();
    }
  });
}

function setLanguage(lang) {
  currentLanguage = lang;
  const labelMap = {
    en: {
      login: 'Login', register: 'Register', forgot: 'Forgot Password', start: 'Starting Point', end: 'Destination'
    },
    id: {
      login: 'Masuk', register: 'Daftar', forgot: 'Lupa Kata Sandi', start: 'Titik Awal', end: 'Tujuan'
    }
  };
  const labels = labelMap[lang];
  document.querySelector("label[for='inputStart']").innerText = labels.start;
  document.querySelector("label[for='inputDest']").innerText = labels.end;
  document.getElementById('calc').innerText = (lang === 'id' ? 'Hitung Tarif' : 'Calculate Price');
  // Add more UI updates as needed
}

function contactSupport() {
  alert('Hubungi admin@taxipi.network atau WhatsApp +62xxx');
}

// ✅ Upload and save user info to Firebase
const form = document.getElementById('verificationForm');
if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const role = document.getElementById('userRole').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    const uploads = {
      idCard: document.getElementById('idCard').files[0],
      sim: document.getElementById('sim')?.files?.[0],
      vehicleDoc: document.getElementById('vehicleDoc')?.files?.[0],
    };

    const storage = firebase.storage();
    const uploadedURLs = {};

    for (let key in uploads) {
      if (uploads[key]) {
        const ref = storage.ref(`users/${currentUser.uid}/${key}`);
        await ref.put(uploads[key]);
        uploadedURLs[key] = await ref.getDownloadURL();
      }
    }

    const userData = {
      uid: currentUser.uid,
      name,
      email,
      phone,
      role,
      balance: 0,
      verified: true,
      docs: uploadedURLs
    };

    await firebase.database().ref('users/' + currentUser.uid).set(userData);
    alert('Verification submitted!');
  });
}
