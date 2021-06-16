const jwt = require('jwt-simple');
const Admin = require('../models/admin.models');
const key = require('../config/key');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, key.secret);
}

exports.signin = function(req, res, next) {
  // User has already had their email and password auth'd
  // We just need to give them a token
  res.send({ token: tokenForUser(req.user) });
}

exports.signup = function(req, res, next) {
  const{ 
    email,
    password,
    username,
    phone,
  } = req.body

  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide email and password'});
  }

  // See if a user with the given email exists
  Admin.findOne({ email: email }, async (err, existingAdmin) => {
    
    if (err) { return next(err); }

    // If a user with email does exist, return an error
    if (existingAdmin) {
      return res.status(422).send({ error: 'Email is in use' });
    }
    // If a user with email does NOT exist, create and save user record
    const admin = new Admin({
      email: email,
      password: password,
      username: username,
      phone: phone,
    });

    try{
    const newAdmin = await admin.save()
      res.status(200).json({ token: tokenForUser(newAdmin) });
    }
    catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
}
