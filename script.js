// Fungsi handle response dari Google
function handleCredentialResponse(response) {
    // Decode JWT token
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
    );

    const userData = JSON.parse(jsonPayload);

    // Simpan data user
    recordUserLogin(userData);

    // Tampilkan dashboard
    showDashboard(userData);
}

// Catat login user
function recordUserLogin(userData) {
    let visitors = parseInt(localStorage.getItem('visitorCount')) || 0;
    visitors++;
    localStorage.setItem('visitorCount', visitors);

    let recordedUsers = JSON.parse(localStorage.getItem('recordedUsers')) || [];
    
    const userRecord = {
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
        loginTime: new Date().toLocaleString('id-ID'),
        loginDate: new Date().toLocaleDateString('id-ID')
    };

    // Cek apakah user sudah terdaftar
    const userIndex = recordedUsers.findIndex(u => u.email === userData.email);
    
    if (userIndex !== -1) {
        // Update login time jika user sudah ada
        recordedUsers[userIndex].loginTime = userRecord.loginTime;
        recordedUsers[userIndex].loginDate = userRecord.loginDate;
    } else {
        // Tambah user baru
        recordedUsers.push(userRecord);
    }

    localStorage.setItem('recordedUsers', JSON.stringify(recordedUsers));
    updateVisitorCounter();
    displayRecordedUsers();
}

// Update counter pengunjung
function updateVisitorCounter() {
    const visitorCount = parseInt(localStorage.getItem('visitorCount')) || 0;
    document.getElementById('visitor-count').textContent = visitorCount;
}

// Tampilkan dashboard
function showDashboard(userData) {
    document.getElementById('user-name').textContent = userData.name;
    document.getElementById('user-email').textContent = userData.email;
    document.getElementById('user-avatar').src = userData.picture;
    
    // Simpan user saat ini
    sessionStorage.setItem('currentUser', JSON.stringify(userData));

    // Ganti section
    document.getElementById('login-section').classList.remove('active');
    document.getElementById('dashboard-section').classList.add('active');

    // Update statistik
    updateStatistics();
    displayRecordedUsers();
}

// Update statistik
function updateStatistics() {
    const recordedUsers = JSON.parse(localStorage.getItem('recordedUsers')) || [];
    const visitorCount = parseInt(localStorage.getItem('visitorCount')) || 0;
    
    // Total visitors
    document.getElementById('total-visitors').textContent = visitorCount;

    // Total users
    document.getElementById('total-users').textContent = recordedUsers.length;

    // Login hari ini
    const today = new Date().toLocaleDateString('id-ID');
    const todayLogins = recordedUsers.filter(u => u.loginDate === today).length;
    document.getElementById('today-logins').textContent = todayLogins;
}

// Tampilkan daftar user
function displayRecordedUsers() {
    const recordedUsers = JSON.parse(localStorage.getItem('recordedUsers')) || [];
    const usersList = document.getElementById('users-list');
    
    usersList.innerHTML = '';
    
    if (recordedUsers.length === 0) {
        usersList.innerHTML = '<p class="empty-state">Belum ada user yang login</p>';
        return;
    }

    // Urutkan berdasarkan login terakhir
    const sortedUsers = recordedUsers.sort((a, b) => {
        return new Date(b.loginTime) - new Date(a.loginTime);
    });

    sortedUsers.forEach((user, index) => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div class="user-item-info">
                <div class="user-item-name">${index + 1}. ${user.name}</div>
                <div class="user-item-email">${user.email}</div>
            </div>
            <div class="user-item-time">${user.loginTime}</div>
        `;
        usersList.appendChild(userItem);
    });
}

// Refresh data
function refreshData() {
    updateStatistics();
    displayRecordedUsers();
    alert('✅ Data diperbarui!');
}

// Logout
function handleLogout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        sessionStorage.removeItem('currentUser');
        document.getElementById('dashboard-section').classList.remove('active');
        document.getElementById('login-section').classList.add('active');
        location.reload();
    }
}

// Cek user sudah login saat page load
window.onload = function() {
    updateVisitorCounter();
    
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        showDashboard(userData);
    }
};