const express = require('express');
const app = expresss();
const bodyParser = require('body-parser');
const session = require('express-session');

//parse request bodies 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//configure sexxion 
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge : 24 * 60 * 60* 1000}
}));

//sample user database
const users = [
    {id: 1, username: 'user1', password: 'password1'}
];

//login route
app.post('/login', (req, res)=>{
    const {username, password} = req.body;

    //find user
    const user = users.find(u => u.username === username && u.password === password);

    if (!user){
        return res.status(401).json({ message: 'invalid credentials'});

    }

    //stoer user information in session (excluding password)
req.session.user = {
    id: user.id,
    username: user.username
};

res.json({ message : 'Login successful', user: req.se});

});

//protected route 
app.get('/profile', (req, res)=>{
    //check if user is looged in
    if (!req.session.user){
        return res.status(401).json({message: 'unauthorized'});

    }
    res.json({message: 'Profile accessed', user: req.session.user});

});
//logout route 
app.post('/logout', (req, res) =>{
    // destroy session 
    req.session.destroy((err)=>{
        if (err) {
            retrun res.status(500).json({ message: 'Logout failed'});

        }
        res.json({ message: 'logout sucessful'});
    });
});

//start server
app.listen(8080, ()=>{
    console.log(`server is running in http://localhost:${8080}`);
});