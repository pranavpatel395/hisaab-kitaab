const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const registerUser = require('./model/register.js')
const mongooseconfig = require('./config/mongoose.js')
const session  = require('express-session')
// const login = require('./model/login.js')

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true
}));

// Route: Home
// Route: Home
app.get('/', function (req, res) {
  if (!req.session.user) {
      return res.render('index', { files: [], user: null });
  }

  fs.readdir(path.join(__dirname, 'hisaab'), function (err, files) {
      if (err) return res.status(500).send(err);

      // Map through the files to extract the title (without the date) and the date
      const parsedFiles = files.map(file => {
          // Regex to extract the date from the filename
          const dateMatch = file.match(/\((\d{1,2}-\d{1,2}-\d{4})\)/);
          const createdDate = dateMatch ? dateMatch[1] : 'Unknown Date';

          // Remove the date and ".txt" extension from the filename to get the title
          const title = file.replace(/ \(\d{1,2}-\d{1,2}-\d{4}\)\.txt$/, '');

          return {
              name: file,           // The full filename (with date and extension)
              title: title,         // The cleaned title (without date and extension)
              createdDate: createdDate // The extracted date
          };
      });

      res.render('index', { files: parsedFiles, user: req.session.user });
  });
});



// app.get('/index',function(req, res){
//   res.render('index')
// })

app.post('/register', async function (req, res) {
  let { username, name, email, password, conformpassword } = req.body;
  let createUser = await registerUser.create({
    username,
    name,
    email,
    password,
    conformpassword
  })
  // res.send(createUser);
  res.render('login')
})

app.get('/users', async function (req, res) {
  let readUsers = await registerUser.find()
  res.send(readUsers)
})

app.post("/login", async function (req, res) {
  let { email, password } = req.body;
  const user = await registerUser.findOne({ email });

  if (!user || user.password !== password) {
    return res.status(400).send('Invalid email or password.');
  }

  req.session.user = user;
  

    res.redirect('/' );
  });
// });


// app.get('/profile',function(req,res){
//   res.render('profile')
// })

app.get('/register',function(req,res){
  res.render('register')
})

  app.get('/login', function (req, res) {
    res.render('login')
  })

  app.get('/logout', function (req, res) {
    req.session.destroy(function(err) {
      if (err) {
        return res.status(500).send('Failed to log out.');
      }
      res.redirect('/');
    });
  });
  

  function isAuthenticated(req, res, next) {
    if (req.session.user) {
      return next();
    }
    return res.status(401).send('You need to log in to access this page.');
  }

  // Route: Create New Hisaab
  app.get('/create',isAuthenticated, function (req, res) {
    res.render('create');
  });

  // Route: Edit Hisaab
  app.get('/edit/:filename',isAuthenticated, function (req, res) {
    const filePath = path.join(__dirname, 'hisaab', req.params.filename);
    fs.readFile(filePath, 'utf-8', function (err, filedata) {
      if (err) return res.status(500).send(err);
      res.render('edit', { filedata, filename: req.params.filename });
    });
  });

  // Route: Update Hisaab
  app.post('/update/:filename', function (req, res) {
    const filePath = path.join(__dirname, 'hisaab', req.params.filename);
    fs.writeFile(filePath, req.body.content, function (err) {
      if (err) return res.status(500).send(err);
      res.redirect('/');
    });
  });

  // Route: View Specific Hisaab
  app.get('/hisaab/:filename', function (req, res) {
    const filePath = path.join(__dirname, 'hisaab', req.params.filename);
    fs.readFile(filePath, 'utf-8', function (err, filedata) {
      if (err) return res.status(500).send(err);
      res.render('hisaab', { filedata, filename: req.params.filename });
    });
  });

  // Route: Delete Hisaab
  app.get('/delet/:filename', function (req, res) {
    const filePath = path.join(__dirname, 'hisaab', req.params.filename);
    fs.unlink(filePath, function (err) {
      if (err) return res.status(500).send(err);
      res.redirect('/');
    });
  });

  // Route: Create New Hisaab (Post)
  app.post('/createhisaab', isAuthenticated, function (req, res) {
    if (!req.session.user) {
        return res.status(401).send('You need to log in first.');
    }

    const currentDate = new Date();
    const date = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

    // Use the date as part of the filename
    const filePath = path.join(__dirname, 'hisaab', `${req.body.title} (${date}).txt`);

    fs.writeFile(filePath, req.body.contant, function (err) {
        if (err) return res.status(500).send(err);
        res.redirect('/');
    });
});


  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
