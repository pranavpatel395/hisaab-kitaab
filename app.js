const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Route: Home
app.get('/', function(req, res) {
  fs.readdir(path.join(__dirname, 'hisaab'), function(err, files) {
    if (err) return res.status(500).send(err);
    res.render('index', { files: files });
  });
});

// Route: Create New Hisaab
app.get('/create', function(req, res) {
  res.render('create');
});

// Route: Edit Hisaab
app.get('/edit/:filename', function(req, res) {
  const filePath = path.join(__dirname, 'hisaab', req.params.filename);
  fs.readFile(filePath, 'utf-8', function(err, filedata) {
    if (err) return res.status(500).send(err);
    res.render('edit', { filedata, filename: req.params.filename });
  });
});

// Route: Update Hisaab
app.post('/update/:filename', function(req, res) {
  const filePath = path.join(__dirname, 'hisaab', req.params.filename);
  fs.writeFile(filePath, req.body.content, function(err) {
    if (err) return res.status(500).send(err);
    res.redirect('/');
  });
});

// Route: View Specific Hisaab
app.get('/hisaab/:filename', function(req, res) {
  const filePath = path.join(__dirname, 'hisaab', req.params.filename);
  fs.readFile(filePath, 'utf-8', function(err, filedata) {
    if (err) return res.status(500).send(err);
    res.render('hisaab', { filedata, filename: req.params.filename });
  });
});

// Route: Delete Hisaab
app.get('/delet/:filename', function(req, res) {
  const filePath = path.join(__dirname, 'hisaab', req.params.filename);
  fs.unlink(filePath, function(err) {
    if (err) return res.status(500).send(err);
    res.redirect('/');
  });
});

// Route: Create New Hisaab (Post)
app.post('/createhisaab', function(req, res) {
  const currentDate = new Date();
  const date = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
  const filePath = path.join(__dirname, 'hisaab', `${req.body.title} (${date})`);
  
  fs.writeFile(filePath, req.body.contant, function(err) {
    if (err) return res.status(500).send(err);
    res.redirect('/');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
