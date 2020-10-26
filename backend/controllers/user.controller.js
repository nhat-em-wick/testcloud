require("dotenv/config");
const userModel = require("../models/user.model");
const path = require("path");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const mailgun = require("mailgun-js");
const pagination = require("./pagination");

const mg = mailgun({
  apiKey: process.env.MAILGUN_APIKEY,
  domain: process.env.DOMAIN,
});
const tokenList = {};

module.exports.pageLogin = (req, res) => {
  res.render("user/login");
};

module.exports.pageRegister = (req, res) => {
  res.render("user/register");
};

module.exports.admin_user = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let perPage = 4;
    const users = await userModel.find({ isAdmin: "false" });
    res.render("admin/admin_user", pagination(page, perPage, users));
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports.getChangeInfo = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    return res.render("user/changeinfo", { user: user });
  } catch (e) {
    res.status(500).send(e);
  }
};



module.exports.register = async (req, res) => {
  // validation data
  const { name, email, password, conf_password } = req.body;
  // checking if user is already in the database
  const emailExist = await userModel.findOne({ email: req.body.email });
  if (emailExist) {
    req.flash("error", "Email exits");
    req.flash("name", name);
    req.flash("email", email);
    req.flash("password", password);
    req.flash("conf_password", conf_password);
    return res.redirect("/register");
  } else {
    try {
      // // hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      // create user
      const user = new userModel({
        name: name,
        email: email,
        password: hashedPassword,
      });
      const saveUSer = await user.save();
      res.redirect("/login");
    } catch (e) {
      res.status(500).send(e);
    }
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  // checking if email exist
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    req.flash("error", "Email is not found!");
    req.flash("email", email);
    return res.redirect("/login");
  }
  // password is correct
  const Pass = await bcrypt.compare(req.body.password, user.password);
  if (!Pass) {
    req.flash("email", email);
    req.flash("error", "Password is wrong!");
    return res.redirect("/login");
  } else {
    try {
      // create and assign a token
      const token = await jwt.sign(
        { _id: user._id },
        process.env.TOKEN_SECRET,
        {
          expiresIn: "45m",
        }
      );
      const refreshToken = await jwt.sign(
        { _id: user._id },
        process.env.REFRESH_TOKEN,
        {
          expiresIn: "3d",
        }
      );
      const response = {
        access_token: token,
        refresh_token: refreshToken,
      };
      tokenList[refreshToken] = response;
      res.cookie(
        "token",
        { access_token: token, refresh_token: refreshToken },
        {
          expires: new Date(Date.now() + 8 * 3600000),
        }
      );
      req.session.user = {
        name: user.name,
        isAdmin: user.isAdmin,
        id: user._id,
      };
      return res.redirect("/");
    } catch (e) {
     res.status(500).send(e)
    }
  }
};

//update user
module.exports.changeInfo = async (req, res) => {
  const { name, password, conf_password } = req.body;
    try {
      const user = await userModel.findById(req.user._id);
      // hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.name = name || user.name;
      user.password = hashedPassword || user.password;
      const updateUser = await user.save();
      res.redirect("/");
    } catch (e) {
      res.status(500).send(e)
    }
};

module.exports.deleteUser = async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    res.redirect("/admin/users");
  } catch (e) {
    res.status(500).send(e)
  }
};

module.exports.pageForgotPassword = (req, res) => {
  res.render("user/forgotpass");
};

module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    req.flash("error", "Email do not exists");
    req.flash("email", email);
    res.redirect("/forgotpassword");
  } else {
    const token = await jwt.sign(
      { _id: user._id },
      process.env.RESET_PASSWORD_KEY,
      {
        expiresIn: "10m",
      }
    );
    
    const data = {
      from: "admin@admin.mailgun.org",
      to: email,
      subject: "Account Reset Password",
      html: `<h2>Please click on given link to reset password</h2>
            <h5>please click <a href="http://localhost:3000/resetpassword/${token}">link</a> to reset</h5>`
    };
    mg.messages().send(data, function (error, body) {
      console.log(body);
    });
    try {
      let resetLink = await user.updateOne({ resetLink: token });
      req.flash("success", "Email has been sent");
      res.redirect("/forgotpassword");
    } catch (e) {
      res.status(500).send(e);
    }
  }
};

module.exports.pageResetPassword = (req, res) => {
  res.render("user/resetpass");
};

module.exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  const resetLink = req.params.id;
  if (resetLink) {
    try {
      const decoded = await jwt.verify(
        resetLink,
        process.env.RESET_PASSWORD_KEY
      );
      let user = await userModel.findOne({ resetLink: resetLink });
      if (!user) {
        req.flash("error", "User with this token does not exist");
        return res.redirect(`/resetpassword/${resetLink}`);
      } else {
        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        let changePass = await user.updateOne({ password: hashedPassword });
        req.flash("success", "Your password has been changed");
        res.redirect("/resetpassword");
      }
    } catch (e) {
      res.status(500).send(e)
    }
  } else {
    req.flash("error", "Invalid token");
    res.redirect(`/resetpassword/${resetLink}`);
  }
};

// module.exports.refreshToken = async (req, res) => {
//   const refreshToken = req.cookies.refresh_token;
//   if (refreshToken && refreshToken in tokenList) {
//     try {
//       const decoded = jwt.decode(refreshToken);
//       const token = jwt.sign({ _id: decoded._id }, process.env.TOKEN_SECRET, {
//         expiresIn: "30m",
//       });
//       // update the token in the list
//       tokenList[refreshToken].access_token = token;
//       const response = {
//         access_token: token,
//         refresh_token: refreshToken
//       };
//       res.cookie(
//         "token",
//         { access_token: token, refresh_token: refreshToken },
//         {
//           expires: new Date(Date.now() + 8 * 3600000),
//         }
//       );
//       res.redirect("/");
//     } catch (e) {
//      res.status(500).send(e)
//     }
//   } else {
//     req.flash("error", "Invalid refresh token");
//     res.redirect('/login')
//   }
// };

module.exports.checkOut = (req, res) => {
  res.render("user/checkout");
};

module.exports.searchUser = async (req, res) => {
  let q = req.query.q;
  try{
    let totalUsers = await userModel.find({ isAdmin: false });
    let matchedUsers = totalUsers.filter((user) => {
      return user.email.toLowerCase().indexOf(q.toLowerCase()) !== -1; // neu q nam trong title thi gia tri lon hon -1
    });
    let page = parseInt(req.query.page) || 1;
    let perPage = 8; // item in page
    if (matchedUsers.length < 1) {
      req.flash("error", `No results for: ${q}`);
      req.flash("q", q);
      res.redirect("/admin/users");
    } else {
      req.flash("q", q);
      res.render("admin/admin_user", pagination(page, perPage, matchedUsers));
    }
  }catch (e) {
    res.status(500).send(e);
  }
};

module.exports.logout = (req, res) => {
  delete req.session.user;
  res.clearCookie("token");
  res.redirect("/login");
};
