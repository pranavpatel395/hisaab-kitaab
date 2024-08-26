const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt')
const fs = require('fs');
const { registerValidator, RegisterUser } = require('./model/register.js');
// const {loginUserSchema, loginValidator} = require('./model/login.js')
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

  const userDir = path.join(__dirname, 'hisaab', req.session.user.username);
  
  // Ensure the user's directory exists
  if (!fs.existsSync(userDir)) {
      return res.render('index', { files: [], user: req.session.user });
  }

  fs.readdir(userDir, function (err, files) {
      if (err) return res.status(500).send(err);

      const parsedFiles = files.map(file => {
          const dateMatch = file.match(/\((\d{1,2}-\d{1,2}-\d{4})\)/);
          const createdDate = dateMatch ? dateMatch[1] : 'Unknown Date';
          const title = file.replace(/ \(\d{1,2}-\d{1,2}-\d{4}\)\.txt$/, '');

          return {
              name: file,
              title: title,
              createdDate: createdDate
          };
      });

      res.render('index', { files: parsedFiles, user: req.session.user });
  });
});




// app.get('/index',function(req, res){
//   res.render('index')
// })

// Register route
app.post('/register', async function (req, res) {
  let { username, name, email, password, confirmPassword } = req.body;

  // Step 1: Validate request data using Joi
  const { error } = registerValidator({ username, name, email, password, confirmPassword });
  if (error) {
    return res.status(400).send(error.message); // Return early if there's a validation error
  }

  try {
    // Step 2: Check if the username or email already exists
    const existingUser = await RegisterUser.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).send('Username is already taken.');
      }
      if (existingUser.email === email) {
        return res.status(400).send('Email is already registered.');
      }
    }

    // Step 3: Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Step 4: Create user
    const createUser = await RegisterUser.create({
      username,
      name,
      email,
      password: hashedPassword, // Save the hashed password
    });

    res.send(createUser); // Send a successful response
  } catch (err) {
    return res.status(500).send('Error creating user: ' + err.message); // Handle any error during user creation
  }
});






app.get('/users', async function (req, res) {
  let readUsers = await RegisterUser.find();
  res.send(readUsers);
});

app.post("/login", async function (req, res) {
  let { email, password } = req.body;
  
  try {
    const user = await RegisterUser.findOne({ email });

    if (!user) {
      return res.status(400).send('Invalid email or password.');  // Return early if user not found
    }

    // Compare the hashed password with the incoming password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).send('Invalid email or password.');  // Return early if password is invalid
    }

    req.session.user = user;

    res.redirect('/');  // Send a single response after successful login
  } catch (err) {
    return res.status(500).send('Error logging in: ' + err.message);  // Handle any error during login
  }
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
// Route: Edit Hisaab
app.get('/edit/:filename', isAuthenticated, function (req, res) {
  const userDir = path.join(__dirname, 'hisaab', req.session.user.username);
  const filePath = path.join(userDir, req.params.filename);
  
  // Ensure the file exists before attempting to read it
  if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found.');
  }

  fs.readFile(filePath, 'utf-8', function (err, filedata) {
      if (err) return res.status(500).send(err);
      res.render('edit', { filedata, filename: req.params.filename });
  });
});


  // Route: Update Hisaab
// Route: Update Hisaab
app.post('/update/:filename', isAuthenticated, function (req, res) {
  const userDir = path.join(__dirname, 'hisaab', req.session.user.username);
  const filePath = path.join(userDir, req.params.filename);

  // Write the updated content back to the original file
  fs.writeFile(filePath, req.body.content, function (err) {
      if (err) return res.status(500).send('Error updating the file: ' + err.message);

      // Redirect back to the main page or a success page after editing
      res.redirect('/');
  });
});


  // Route: View Specific Hisaab
  app.get('/hisaab/:filename', isAuthenticated, function (req, res) {
    const userDir = path.join(__dirname, 'hisaab', req.session.user.username);
    const filePath = path.join(userDir, req.params.filename);
    
    fs.readFile(filePath, 'utf-8', function (err, filedata) {
        if (err) return res.status(500).send(err);
        res.render('hisaab', { filedata, filename: req.params.filename });
    });
});

  // Route: Delete Hisaab
  app.get('/delet/:filename', isAuthenticated, function (req, res) {
    const userDir = path.join(__dirname, 'hisaab', req.session.user.username);
    const filePath = path.join(userDir, req.params.filename);
    
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

    const userDir = path.join(__dirname, 'hisaab', req.session.user.username);

    // Ensure the user's directory exists
    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir);
    }

    const filePath = path.join(userDir, `${req.body.title} (${date}).txt`);

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
