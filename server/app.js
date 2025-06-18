const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const supabase = require('./supabase');
const path = require('path');

const app = express();

// Enable CORS for all routes
app.use(cors()); 

// Parse JSON bodies
app.use(express.json());

// begin listening on a port
const port = process.env.PORT || 3500;

app.listen(port, () => {
	console.log("Server running on port", port)
})

app.get("/server-test", (req, res) => {
    res.status(200).json("This text is coming from the backend server (app.js) ✅")
})

app.get("/db-test", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .limit(5);
        
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch data from database' });
    }
})

// Serve static files in production
if (process.env.NODE_ENV !== "dev") {
    // Serve static files from the 'dist' directory
    app.use(express.static(path.join(__dirname, "../client/dist")));

    // Handle all other routes by serving index.html
    app.use((req, res) => {
        res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });
}