// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.querySelector('.close');
const saveCropBtn = document.getElementById('saveCropBtn');
const updateWeatherBtn = document.getElementById('updateWeatherBtn');
const refreshPricesBtn = document.getElementById('refreshPrices');
const marketRegionSelect = document.getElementById('marketRegion');
const loginForm = document.getElementById('loginForm');
const userTypes = document.querySelectorAll('.user-type');
const registerBtn = document.getElementById('registerBtn');

let selectedUserType = 'farmer';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadCropHistory();
    loadMarketPrices();
    
    // Add event listeners to user type selector
    userTypes.forEach(type => {
        type.addEventListener('click', function() {
            userTypes.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            selectedUserType = this.getAttribute('data-type');
        });
    });
});

// Login Modal Events
loginBtn.addEventListener('click', function() {
    loginModal.style.display = 'block';
});

closeModal.addEventListener('click', function() {
    loginModal.style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

// Login Form Submit
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Login successful! Welcome ' + data.user.name);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            loginModal.style.display = 'none';
            loginForm.reset();
            updateUIForLoggedInUser(data.user);
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        alert('Error during login: ' + error.message);
    }
});

// Register Button
registerBtn.addEventListener('click', function() {
    const phone = prompt('Enter your phone number:');
    if (!phone) return;
    
    const email = prompt('Enter your email:');
    if (!email) return;
    
    const name = prompt('Enter your full name:');
    if (!name) return;
    
    const password = prompt('Enter a password:');
    if (!password) return;
    
    registerUser(phone, email, name, password);
});

// Register User Function
async function registerUser(phone, email, name, password) {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: phone,
                email: email,
                name: name,
                password: password,
                type: selectedUserType
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Registration successful! You can now login with your phone/email.');
        } else {
            alert('Registration failed: ' + data.message);
        }
    } catch (error) {
        alert('Error during registration: ' + error.message);
    }
}

// Save Crop Data
saveCropBtn.addEventListener('click', async function() {
    const cropType = document.getElementById('cropType').value;
    const plantingDate = document.getElementById('plantingDate').value;
    const area = document.getElementById('area').value;
    
    if (!plantingDate || !area) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        const response = await fetch('/api/crops', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: cropType,
                plantingDate: plantingDate,
                area: parseFloat(area)
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Crop data saved successfully!');
            document.getElementById('cropType').value = 'maize';
            document.getElementById('plantingDate').value = '';
            document.getElementById('area').value = '';
            loadCropHistory();
        }
    } catch (error) {
        alert('Error saving crop data: ' + error.message);
    }
});

// Load Crop History
async function loadCropHistory() {
    try {
        const response = await fetch('/api/crops');
        const crops = await response.json();
        
        const cropHistory = document.getElementById('cropHistory');
        
        if (crops.length === 0) {
            cropHistory.innerHTML = '<p>No crops recorded yet. Add your first crop!</p>';
        } else {
            let html = '<ul style="list-style: none; padding: 0;">';
            crops.forEach(crop => {
                html += `<li style="padding: 8px; border-bottom: 1px solid #ddd;">
                    <strong>${crop.type.charAt(0).toUpperCase() + crop.type.slice(1)}</strong> - 
                    Planted: ${crop.plantingDate}, Area: ${crop.area} ha
                </li>`;
            });
            html += '</ul>';
            cropHistory.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading crop history:', error);
    }
}

// Load Market Prices
async function loadMarketPrices() {
    const region = (document.getElementById('marketRegion').value || 'southwest').toLowerCase();
    
    try {
        const response = await fetch(`/api/market-prices/${region}`);
        const prices = await response.json();
        
        const priceTable = document.getElementById('priceTable');
        
        if (prices.length === 0) {
            priceTable.innerHTML = '<tr><td colspan="4">No prices available</td></tr>';
        } else {
            let html = '';
            prices.forEach(price => {
                html += `<tr>
                    <td>${price.crop}</td>
                    <td>${price.price} CFA</td>
                    <td>${price.change}</td>
                    <td>${price.buyers}</td>
                </tr>`;
            });
            priceTable.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading market prices:', error);
    }
}

// Update Weather
updateWeatherBtn.addEventListener('click', async function() {
    const region = 'southwest';
    
    try {
        const response = await fetch(`/api/weather/${region}`);
        const weather = await response.json();
        
        document.getElementById('temp').textContent = weather.temp + '°C';
        document.getElementById('rain').textContent = weather.rain + '%';
        document.getElementById('advice').textContent = weather.advice;
        
        alert('Weather updated successfully!');
    } catch (error) {
        alert('Error updating weather: ' + error.message);
    }
});

// Refresh Prices
if (refreshPricesBtn) {
    refreshPricesBtn.addEventListener('click', loadMarketPrices);
}

// Market Region Change
if (marketRegionSelect) {
    marketRegionSelect.addEventListener('change', loadMarketPrices);
}

// Update UI for Logged In User
function updateUIForLoggedInUser(user) {
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.textContent = 'Logout (' + user.name + ')';
    loginBtn.onclick = function() {
        localStorage.removeItem('currentUser');
        loginBtn.textContent = 'Login';
        loginBtn.onclick = null;
        alert('Logged out successfully');
    };
}

// Check if user is already logged in
window.addEventListener('load', function() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        updateUIForLoggedInUser(user);
    }
});
