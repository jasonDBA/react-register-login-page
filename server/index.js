const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const bodyParser = require('body-parser');  // BodyParser is needed when getting client info from the server.
const cookieParser = require('cookie-parser');
const config = require('./config/key');

// User Model
const { User } = require('./models/User');
// Middleware
const { auth } = require('./middleware/auth');

// Options in Body-parser - it analzes(parses) data in body and gives the results as req.body
// From application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
// From application/json
app.use(bodyParser.json());

// Use Cookie Parser
app.use(cookieParser());

// Use mongoose - which is an Object Modeling Tool that helps to use easily Mongo DB. (npm install mongoose --save)
const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {    // From a MongoDB Cluster
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false 
}).then(() => console.log('MongoDB Connected..'))
.catch(err => console.log(err))

app.get('/', (req, res) => res.send('Welcome to My React App for Youtube!'))

app.get('/api/hello', (req, res) => {
    res.send("Hello World!")
})

// Register Router
app.post('/api/users/register', (req, res) => {   // req: request, res: respond
    // When users sign up, put the clients' data into db
    const user = new User(req.body);
    user.save((err, userInfo) => {
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})

// Login Router
app.post('/api/users/login', (req, res) => {
    // Look for the requested login data in the db.
    // Then see if the password is matched up.
    User.findOne({ email: req.body.email }, (err, user) => {
        // if the user email is not correct, an error message pops up.
        if(!user){
            return res.json({
                loginSuccess: false,
                message: "The user does NOT exist."
            });
        }
        // if the user password is not correct, an error message pops up.
        // if it is, generate a token. - npm install jsonwebtoken --save
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) 
                return res.json({ 
                    loginSuccess: false, 
                    message: "The password is wrong!"
                });
            
            user.generateToken((err, user) => {
                if(err) {
                    return res.status(400).send(err);
                }
                
                // Store the generated token in Cookie, LocalStorage or Session (it depends. we will store it in Cookie)
                // npm install cookie-parser --save
                res.cookie("x_auth", user.token)
                .status(200)
                .json({loginSuccess: true, userId: user._id});
            })
        })
    })
})

// Auth Router
app.get('/api/users/auth', auth, (req, res) => {    // auth: middleware, which the process between the request and respond.
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,    // role 0: Admin, role 1: User
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

// Logout Router
app.get('/api/users/logout', auth, (req, res) => {
    // By removing the token in the server, the authentication fails and the user logs out.
    User.findOneAndUpdate(
        {_id: req.user._id},
        {token: ""},    // delete the token
        (err, user) => {
            if(err) return res.json({ success: false, err });
            return res.status(200).send({ success: true })
        }
    )
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))