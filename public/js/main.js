// MENU SHOP
const showMenu = (toggleId, navId) => {
  const toggle = document.getElementById(toggleId);
  const nav = document.getElementById(navId);
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("show");
    });
  }
};
showMenu("nav-toggle", "nav-menu");
// REMOVE MENU
const navLink = document.querySelectorAll(".nav_link");
const navMenu = document.getElementById("nav-menu");
function linkAction() {
  navMenu.classList.remove("show");
}
navLink.forEach((n) => n.addEventListener("click", linkAction));

//CHANGE COLOR HEADER
window.onscroll = () => {
  const nav = document.getElementById("header");
  if (this.scrollY >= 200) nav.classList.add("scroll-header");
  else nav.classList.remove("scroll-header");
};
//SCROLL TOP
const toTop = document.querySelector(".to-top");

window.addEventListener("scroll", () => {
  if (window.pageYOffset < 100) {
    toTop.classList.add("active");
  } else {
    toTop.classList.remove("active");
  }
});

//GET PRODUCTS
async function getProducts() {
  try {
    const response = await axios.get('http://localhost:3000/listjson');
    renderProduct(response.data.products)
  } catch (error) {
    console.error(error);
  }
}
function renderProduct(products){
  let html = '';
  for (var list = 0; list < 6; list++) {
    if(products[list]){
      html += '<article class="book"><img src="/' + products[list].image +'" class="book_img"><span class="book_name">'
      +products[list].title+'</span></article>';
    }else{
      break;
    }
  }
  const listHTML = document.getElementById('productList');
  if(listHTML){
    listHTML.innerHTML = html;
  }
}
getProducts();

//CART
let addToCart = document.querySelectorAll(".add-to-cart");
let cartCounter = document.querySelector("#cartCount");
function updateCart(product) {
  axios.post("/addtocart", product).then(function (res) {
    cartCounter.innerText = res.data.totalQty;
  });
}
addToCart.forEach(function (btn) {
  btn.addEventListener("click", function (e) {
    var product = JSON.parse(btn.dataset.product);
    updateCart(product);
  });
});

//UPDATE STATUS
let statuses = document.querySelectorAll(".status-line");
let hiddenInput = document.querySelector("#hiddenInput");
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);

function updateStatus(order) {
	for(let i=0;i<statuses.length;i++){
		statuses[i].classList.remove('step-completed')
		statuses[i].classList.remove('current')
	}
  let stepComplete = true;
  for(let i=0;i<statuses.length;i++){
    let dataProp = statuses[i].dataset.status;
    if (stepComplete) {
      statuses[i].classList.add("step-completed");
		}
	
    if (dataProp === order.status) {
      stepComplete = false;
      if (statuses[i].nextElementSibling) {
        statuses[i].nextElementSibling.classList.add("current");
      }
    }
  };
}
updateStatus(order);

let socket = io();
if(order){
	socket.emit('join', `order_${order._id}`);
}

socket.on('orderUpdated', (data)=>{
	const updatedOrder = {...order};
	updatedOrder.status = data.status;
	updateStatus(updatedOrder)
	
})

