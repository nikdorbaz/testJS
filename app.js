'use strict';

class App {

  _appEl = document.getElementById('app');
  _cartEl = document.getElementById('cart');
  _badgeEl = document.getElementById('badge');
  _xhr = false;
  viewedProducts = [];
  products = [];
  cart = [];

  constructor(user) {
    let me = this;

    if (localStorage.length) {
      me.render();
    } else {
      me.setStorage('user', user.username);
      me.getProducts();

      let productsRespone = setInterval(function () {
        if (me._xhr) {
          me.renderProducts();
          clearInterval(productsRespone);
        }
      }, 200);
    }

    me._cartEl.addEventListener('click', me.renderCart);
  }

  render() {
    let me = this,
      page = window.location.search;

    me.products = me.getStorage('products');
    me.cart = me.getStorage('cart');
    me.viewedProducts = me.getStorage('viewed');

    (me.cart.length) ? me.renderMiniCart() : '';
    (me.viewedProducts.length) ? me.renderViewed() : '';
    (page) ? me.renderProduct() : me.renderProducts();

  }

  getProducts() {
    let me = this,
      request = new XMLHttpRequest();

    request.open('GET', 'https://private-cc9db-shop75.apiary-mock.com/products');

    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        let res = JSON.parse(this.response);

        for (let key in res[0]) {
          me[key] = res[0][key];
          me.setStorage(key, me[key]);
        }

        me._xhr = true;
      }

    };

    request.send();
  }

  renderProducts(page) {
    let me = this,
      itemsPerPage = 6,
      totalPage = me.products.length / itemsPerPage;

    me._appEl.innerHTML = '';
    page = (page) ? page : 1;
    me.renderControls();

    for (let i = itemsPerPage * (page - 1); i < itemsPerPage * page; i++) {
      let product = me.products[i],
        productTemplate = `
                    <div class="product">
                        <img src="${product.image}" onclick="app.goToProduct(${product.id})">
                        <div class="product-price">Price: ${product.price}</div>
                        <div class="product-title" onclick="app.goToProduct(${product.id})">${product.title}</div>
                        <div class="product-desc">${product.description}</div>
                        <button onclick="app.addToCart(${product.id})">Buy</div>
                    </div>
                `;

      me._appEl.innerHTML += productTemplate;
    }
    for (let i = 1; i <= totalPage; i++) {
      let paginationTemplate = (i == page) ?
        `<span class="pagination active" onclick="app.renderProducts(${i})"> ${i} </span>` :
        `<span class="pagination" onclick="app.renderProducts(${i})"> ${i} </span>`;

      me._appEl.innerHTML += paginationTemplate;
    }
  }

  goToProduct(prodId) {
    let location = window.location.href;

    if (location.indexOf('?') >= 0) {
      location = location.substr(0, location.indexOf('?'));
    }

    this.setStorage('page', { id: prodId });
    window.location.href = location + `?product=${prodId}`;
  }

  renderControls() {
    let me = this,
      sorts = ['default', 'title', 'price'],
      sort = '<select onchange="app.sortProducts(this.value)">';

    for (let i = 0; i < sorts.length; i++) {
      sort += (me.getStorage('sort') == sorts[i]) ?
        `<option value="${sorts[i]}" selected>${sorts[i]}</option>` :
        `<option value="${sorts[i]}">${sorts[i]}</option>`;

      sort += (i === sorts.length) ? `</select>` : '';
    }

    let controlsMarkup = `
      <div class="controls">
        <div class="sort">
          <label>Sort: </label>
          ${sort}
        </div>
      </div>
    `;

    me._appEl.innerHTML += controlsMarkup;
  }

  renderProduct() {
    let me = this,
      prodId = me.getStorage('page').id;

    if (me.viewedProducts.indexOf(prodId) < 0) {
      me.viewedProducts.push(prodId)
      me.setStorage('viewed', me.viewedProducts);
    }

    me.products.forEach(function (el) {

      if (el.id != prodId) { return }

      let productTemplate = `
        <div class="product-page">
          <img src="${el.image}" alt="${el.title}">
          <div class="product-info">
            <h2>${el.title}</h2>
            <div class="product-desc">${el.description}</div>
            <div class="product-price">Price ${el.price}</div>
            <button onclick="app.addToCart(${el.id})">Buy</button>
          </div>
        </div>
      `;

      me._appEl.innerHTML += productTemplate;

    });

  }

  renderViewed() {
    let me = this,
      viewed = document.getElementById('viewed');

    viewed.innerHTML = '';
    me.viewedProducts.forEach(function (el) {
      let product = me.getProduct(el);
      viewed.innerHTML += `
        <div class="product">
          <img src="${product.image}">
          <div>${product.title}</div>
        </div>
      `;
    });
  }

  getProduct(prodId) {
    let product = this.products.filter(function (el, i) {
      if (el.id === prodId) {
        return el;
      }
      return;
    });

    return product[0];
  }

  addToCart(prodId) {
    let cartIndex = false,
      cartItem = {
        'id': prodId,
        'count': 1
      };

    if (!this.cart.length) {

      this.cart.push(cartItem);

    } else {

      this.cart.forEach(function (el, i) {
        if (el.id == prodId) {
          cartIndex = i;
          return;
        }
      });

      if (cartIndex !== false) {
        cartItem = this.cart[cartIndex];
        cartItem.count++;
        this.cart[cartIndex] = cartItem;
      } else {
        this.cart.push(cartItem);
      }
    }


    this.setStorage('cart', this.cart);
    this.renderMiniCart();
  }

  removeFromCart(prodId) {
    let me = this;

    me.cart.forEach(function (el, i) {

      if (el.id === prodId) {
        me.cart.splice(i, 1);
      }

    });

    me.setStorage('cart', me.cart);
    me.renderMiniCart();
  }

  renderCart() {
    let me = app,
      el = this,
      cartWrapper = document.getElementById('cart-popup');

    if (!cartWrapper) {
      cartWrapper = document.createElement('div');
      cartWrapper.setAttribute('id', 'cart-popup');
      el.append(cartWrapper);
    }

    cartWrapper.innerHTML = '';

    if (!me.cart.length) {
      cartWrapper.remove();
    }

    me.cart.forEach(function (el) {
      let product = me.getProduct(el.id);

      let cartProductTemplate = `
        <div class="cart-product">
          <img src="${product.image}" alt="${product.title}">
          <div class="title">${product.title}</div>
          <button onclick="app.removeFromCart(${product.id})">&#65794;</button>
        </div>
      `;

      cartWrapper.innerHTML += cartProductTemplate;
    });
  }

  renderMiniCart() {
    let countProducts = 0;

    this.cart.forEach(function (el) {
      countProducts += el.count;
    });

    this._badgeEl.innerHTML = countProducts;
  }

  sortProducts(type) {
    this.products.sort(function (a, b) {
      if (a[type] < b[type]) {
        return -1;
      }
      if (a[type] > b[type]) {
        return 1;
      }
      return 0;
    });

    this.setStorage('sort', type);
    this.renderProducts();
  }

  setStorage(name, item) {
    localStorage.setItem(name, JSON.stringify(item));
  }

  getStorage(name) {
    if (localStorage.getItem(name)) {
      return JSON.parse(localStorage.getItem(name));
    } else {
      return [];
    }
  }

  removeStorage(name) {
    localStorage.removeItem(name);
  }
}