const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
// views folder
app.set("views", "views");
app.set("view engine", "ejs")
// static folder

//Set up middleware
app.use(express.urlencoded({ extended:true}));
app.use(express.static('public'));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

//Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;

db.once('open', () => {
    console.log('Connected to MongoDB');
});
//Define user schema
const adminSchema = new mongoose.Schema({
    username: String,
    password: String
});

const Admin = mongoose.model('Admin', adminSchema);

// Define routes
app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username, password }).exec();

        if (!admin) {
            res.status(401).send('Invalid username or password');
            return;
        }

        req.session.admin = admin;
        res.redirect('/secret');
    } catch (err) {
        console.error(err); // Log the error to the console for debugging
        res.status(500).send('Internal server error'); // Return an error response
    }
});

app.get('/secret', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/');
    } else {
        res.render('secret');
    }
});

//Start Server
app.listen(2000, () => {
    console.log('Server started on port 2000');
});