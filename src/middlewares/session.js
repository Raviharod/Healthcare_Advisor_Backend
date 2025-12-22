const session = require("express-session");
const mongoDbStore = require("connect-mongodb-session")(session);

//store session in mongodb
const store = new mongoDbStore({
  uri:process.env.MONGO_URL,
  collection:"mySessions"
})

// Catch errors
store.on('error', function (error) {
  console.log(error);
});

const sessionMiddleware = session({
  secret:"mysecretkey",
  resave:false,
  saveUninitialized:false,
  store:store,
  cookie: {
    httpOnly: true,
    secure: false,        // true if you serve over HTTPS
    sameSite: 'lax',      // 'lax' is fine for localhost; use 'none' + secure:true for cross-site
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
})

module.exports = sessionMiddleware;