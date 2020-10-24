const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  // gui token qua header
  if(!req.cookies.token){
     res.redirect('/login');
  }else{
    const token = req.cookies.token.access_token;
    const {exp} = jwt.decode(token);
    if (!token || Date.now() >= exp * 1000){
      delete req.session.user;
      res.redirect('/login');
    } else {
      try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
      } catch {
        res.redirect('/login');
      }
    }
  }
};
