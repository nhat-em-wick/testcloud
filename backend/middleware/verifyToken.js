const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  // gui token qua header
  if(!req.cookies.token){
     res.redirect('/login');
  }else{
    const token = req.cookies.token.access_token;
    if (!token){
      res.redirect('/login');
    } else {
      try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
      } catch {
        delete req.session.user;
        res.redirect('/login');
      }
    }
  }
};
