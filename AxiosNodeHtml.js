// AxiosNodeHtml.js -> Node.js HTML client

// requires: npm install express axios body-parser

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();


// Base URL for the API
const baseUrl = 'https://api.example.com';
// const baseUrl = 'http://localhost:3000';

// Set up the template engine
app.set("views", path.join(__dirname, "/public/views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files
app.use(express.static('public'));

app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${baseUrl}/books`);
        res.render('index', { books: response.data });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

app.get('/books/:id', async (req, res) => {
    try {
        const response = await axios.get(`${baseUrl}/books/${req.params.id}`);
        res.render('book', { book: response.data });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

app.get('/create', (req, res) => {
    res.render('create');
});

app.post('/create', async (req, res) => {
    try {
        const data = { title: req.body.title, author: req.body.author };
        await axios.post(`${baseUrl}/books`, data);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

app.get('/edit/:id', async (req, res) => {
    try {
        const response = await axios.get(`${baseUrl}/books/${req.params.id}`);
        res.render('edit', { book: response.data });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

app.post('/edit/:id', async (req, res) => {
    try {
        const data = { title: req.body.title, author: req.body.author };
        await axios.put(`${baseUrl}/books/${req.params.id}`, data);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

app.post('/delete/:id', async (req, res) => {
    try {
        await axios.delete(`${baseUrl}/books/${req.params.id}`);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

app.listen(5500, () => {
    console.log('Server is running on port http://localhost:5500');
});
