const regName = /^([A-z](\ )?){3,}\S$/;
const regEmail = /^[A-z0-9]{5,32}\@[a-z]{2,}\.[a-z]{2,5}(\.[a-z]{2,5})?$/;
const regPass = /^(?=.*[A-z])(?=.*[0-9])([A-z0-9\!\@\#\$\&\*]){8,32}$/;
const regAddress = /^(?=.*[A-z])(?=.*[0-9])?([A-z0-9\ \.\,\-]){8,}$/gm;
const regPhone = /^0[1-9]{9}$/;
const regSearch = /^[A-z0-9 ]*[^!@#$^<>{}&,.; ]$/;
const regTitle = /^[A-z0-9 ]*$/;
const regPrice = /^[0-9]*$/;

module.exports.checkLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.flash('email', email);
    req.flash('error', 'All fields are required')
    return res.redirect('/login');
  }
  if (regEmail.test(email)) {
    if (regPass.test(password)) {
      return next();
    } else {
      req.flash('email', email);
      req.flash('error',"Invalid password")
      return res.redirect('/login');
    }
  } else {
    req.flash('email', email);
    req.flash('error',"Invalid email")
    return res.redirect('/login');
  }
};

module.exports.checkRegister = (req, res, next) => {
  const { name, email, password, conf_password } = req.body;
  if (!name || !email || !password || !conf_password) {
    req.flash('error', '');
    req.flash('name', name)
    req.flash('email', email)
    return res.redirect('/register');
  }
  if (password !== conf_password) {
    req.flash('error', 'password do not match');
    req.flash('name', name)
    req.flash('email', email)
    return res.redirect('/register');
  }
  if (regName.test(name)) {
    if (regEmail.test(email)) {
      if (regPass.test(password) && regPass.test(conf_password)) {
        return next();
      } else {
        req.flash('error', 'Password contains at least 8 characters consisting of a number and a lowercase letter.');
        req.flash('name', name)
        req.flash('email', email)
        req.flash('password', password)
        req.flash('conf_password', conf_password)
        return res.redirect('/register');
      }
    } else {
      req.flash('error', 'Invalid email');
      req.flash('name', name)
    req.flash('email', email)
    req.flash('password', password)
    req.flash('conf_password', conf_password)
      return res.redirect('/register');
    }
  } else {
    req.flash('error', 'Invalid name');
    req.flash('name', name)
    req.flash('email', email)
    req.flash('password', password)
    req.flash('conf_password', conf_password)
    return res.redirect('/register');
  }
};
module.exports.search = (req, res, next) => {
  let q = req.query.q;
  if(q=='') return res.redirect('/products');
  if (regSearch.test(q)){
    return next();
  }else{
    req.flash('error',"Invalid keyword");
    req.flash('q',q)
    return res.redirect('/products');
  }
};
module.exports.checkChangeInfo = (req, res, next) => {
  const { name, password, conf_password } = req.body;
  const id = req.user._id;
  if (!name || !password || !conf_password) {
    req.flash('error',"All fields are required")
    req.flash('name', name);
    return res.redirect('/my/edit');
  }
  if (password !== conf_password) {
    req.flash('error',"Password do not match")
    req.flash('name', name)
    return res.redirect('/my/edit');
  }
  if (regName.test(name)) {
    if (regPass.test(password) && regPass.test(conf_password)) {
      return next();
    } else {
      req.flash('error',"Password contains at least 8 characters consisting of a number and a lowercase letter.")
      req.flash('name', name)
      return res.redirect('/my/edit');
    }
  } else {
    req.flash('error',"Invalid name")
      req.flash('name', name)
      return res.redirect('/my/edit');
  }
};


module.exports.checkNewPass = (req, res, next)=>{
  const {newpass} = req.body;
  const id = req.params.id;
  if(!newpass){
    req.flash('error', "All fields are required");
    return res.redirect(`/resetpassword/${id}`)
  }
  if(regPass.test(newpass)){
    return next();
  }
  req.flash('error',"Password contains at least 8 characters consisting of a number and a lowercase letter.")
  return res.redirect(`/resetpassword/${id}`)
}

module.exports.checkOrder = (req, res, next) => {
  const { address, phone } = req.body;
  if (!address || !phone) {
    req.flash('error',"All fields are required")
    return res.redirect('/checkout')
  }
  if (regPhone.test(phone)) {
    if (regAddress.test(address)) {
      return next();
    } else {
      req.flash('error', "Invalid address")
      req.flash('phone',phone);
      req.flash('address', address)
      return res.redirect('/checkout');
    }
  } else {
    req.flash('phone',phone);
    req.flash('address', address)
    req.flash('error', "Invalid phone");
    return res.redirect('/checkout');
  }
};

module.exports.checkProduct = (req, res, next) => {
  const {title, price, totalQty} = req.body;
  if(!title || !price || !totalQty || !req.file){
    req.flash('title', title);
    req.flash('price', price);
    req.flash('totalQty', totalQty);
    req.flash('error', "All fields are required");
    return res.redirect('back');
  }
  if(regTitle.test(title)){
    if(regPrice.test(price) && regPrice.test(totalQty)){
      return next();
    }
    else{
    req.flash('title', title);
    req.flash('price', price);
    req.flash('totalQty', totalQty);
    req.flash('error', "Invalid price or Total Quantity");
     return res.redirect('back');
    }
  }else{
    req.flash('title', title);
    req.flash('price', price);
    req.flash('totalQty', totalQty);
    req.flash('error', "Invalid Title");
     return res.redirect('back');
  }

}