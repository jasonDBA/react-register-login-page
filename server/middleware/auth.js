const { User } = require('../models/User');

let auth = (req, res, next) => {
    // See if the token in server and the token in client are matech up (i.e. the authentication process)
    // 1. Bring a token stored in the client's cookie
    let token = req.cookies.x_auth;

    // 2. Decode the token and find the user id
    User.findByToken(token, (err, user) => {
        if(err) throw err;
        // 3. If the user does not exist, auth is failed.
        if(!user)
            return res.json({ isAuth: false, error: true });
        
        // 4. If the user exists (i.e. the token authentication), auth is okay.
        req.token = token;
        req.user = user;
        next();
    })    
}

module.exports = { auth };