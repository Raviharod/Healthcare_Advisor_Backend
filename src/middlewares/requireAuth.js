

function requireAuth(req,res, next){
  if(req.session && req.session.user){
    return next()
  }
  console.log(req.session);
  return res.status(401).json({ message: "Unauthorized" });
}

module.exports = requireAuth;