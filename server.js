const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(__dirname));
app.use(express.json());

// Load initial data
let data = {
    crops: [],
    users: [],
    marketData: []
};

// Load existing data if available
if (fs.existsSync(path.join(__dirname, 'data.json'))) {
    const savedData = fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8');
    data = JSON.parse(savedData);
}

// Save data to file
function saveData() {
    fs.writeFileSync(
        path.join(__dirname, 'data.json'),
        JSON.stringify(data, null, 2)
    );
}

// API Routes

// Get all crops
app.get('/api/crops', (req, res) => {
    res.json(data.crops);
});

// Add new crop
app.post('/api/crops', (req, res) => {
    const newCrop = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    
    data.crops.push(newCrop);
    saveData();
    
    res.json({
        success: true,
        message: 'Crop data saved to cloud',
        data: newCrop
    });
});

// Get market prices
app.get('/api/market-prices/:region', (req, res) => {
    const region = req.params.region;
    const mockPrices = {
        Southwest: [
            { crop: "Maize", price: 250, change: "+5%", buyers: 15 },
            { crop: "Cassava", price: 180, change: "-2%", buyers: 8 }
        ],
        Littoral: [
            { crop: "Maize", price: 270, change: "+7%", buyers: 18 }
        ]
    };
    
    res.json(mockPrices[region] || []);
});

// User registration
app.post('/api/register', (req, res) => {
    const user = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    
    data.users.push(user);
    saveData();
    
    res.json({
        success: true,
        message: 'User registered successfully',
        user: { id: user.id, type: user.type, name: user.name }
    });
});

// User login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Simple mock authentication
    const user = data.users.find(u => 
        (u.phone === username || u.email === username) && 
        u.password === password
    );
    
    if (user) {
        res.json({
            success: true,
            message: 'Login successful',
            user: { id: user.id, type: user.type, name: user.name }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }
});

// Get weather data
app.get('/api/weather/:region', (req, res) => {
    const weatherData = {
        Southwest: { temp: 28, rain: 30, advice: "Good day for harvesting" },
        Littoral: { temp: 31, rain: 60, advice: "High chance of rain tomorrow" },
        Center: { temp: 26, rain: 20, advice: "Ideal for planting" }
    };
    
    res.json(weatherData[req.params.region] || weatherData.Southwest);
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`AgriConnect server running at http://localhost:${PORT}`);
    console.log(`Cloud API available at http://localhost:${PORT}/api/crops`);
});