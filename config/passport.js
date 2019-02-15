const JwtStrategy = require('passport-jwt').Strategy,
ExtractJwt = require('passport-jwt').ExtractJwt

const mongoose = require('mongoose')
const User = mongoose.model("User")
const secret = require('../config/config').secret

let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = secret

module.exports = passport => {
    passport.use(new JwtStrategy(opts, (jwt_payload, done)=>{
        User.findById(jwt_payload.id)
        .then( user =>{
            if (user) {
                return done(null, user)
            }
            return done(null, false)
        })
        .catch( err => res.json({ msg:'获取用户信息失败!',code:20001 }) ) 
    }))
}