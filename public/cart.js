const API_URL = 'http://localhost:3000';

Vue.component('search', {
    data() {
        return {
            searchQuery: '',
        };
    },
    template: `
        <div class="search">
           <input v-model="searchQuery" class=" nav-left__input" type="text" placeholder="Search for Item...">
               <button class=" nav-left__search button" type="button" @click.prevent="handleSearchClick">
                  <i class="fas fa-search"></i>
             </button>
        </div>
    `,
    methods: {
        handleSearchClick() {
            this.$emit('onsearch');
        }
    }
});

Vue.component('product-item', {
    props: ['item'],
    template: `
    <div :id="item.id" class="product-box__item">
        <a href="#" class="product-box__product">
            <img :src="item.image" alt="Product" class="product-box__img">
        </a>
        <div class="product-box__overlay d-flex">
            <button type="button" class="product-box__add-cart" @click.prevent="handleBuyClick(item)">
                Add to Cart
            </button>
        </div>
        <div class="product-box__description">
            <p class="product-box__text">{{item.name}}</p>
            <p class="product-box__price">{{item.price}}</p>
        </div>
    </div>        
  `,
    methods: {
        handleBuyClick(item) {
            this.$emit('onBuy', item);
        }
    }
});


Vue.component('products', {
    props: ['query'],
    methods: {
        handleBuyClick(item) {
            this.$emit('onbuy', item);
        },
    },
    data() {
        return {
            items: [],
        };
    },
    computed: {
        filteredItems() {
            if (this.query) {
                const regexp = new RegExp(this.query, 'i');
                return this.items.filter((item) => regexp.test(item.name));
            } else {
                return this.items;
            }
        }
    },
    mounted() {
        fetch(`${API_URL}/products`)
            .then(response => response.json())
            .then((items) => {
                this.items = items;
            });
    },
    template: `
    <div class="product-box d-flex space-btw">
      <product-item v-for="entry in filteredItems" :item="entry"  @onBuy="handleBuyClick"></product-item>
    </div>
  `,
});

Vue.component('cart-item', {
    props: ['item'],
    template: `
      <li class="box-cart__item d-flex align-i-с">
        <img :src="item.image" width="72" height="85" alt="product_photo">
          <div class="box-cart__wrap">
                <p class="box-cart__title">
                    {{item.name}}
                </p>
             <div class="box-cart__stars">
                 <a href="#" class="box-cart__star">
                     <i class="fa fa-star" aria-hidden="true"></i>
                 </a>
                 <a href="#" class="box-cart__star">
                    <i class="fa fa-star" aria-hidden="true"></i>
                 </a>
                 <a href="#" class="box-cart__star">
                    <i class="fa fa-star" aria-hidden="true"></i>
                 </a>
                 <a href="#" class="box-cart__star">
                   <i class="fa fa-star" aria-hidden="true"></i>
                 </a>
                 <a href="#" class="box-cart__star">
                     <i class="fa fa-star" aria-hidden="true"></i>
                 </a>
              </div>
                <p class="box-cart__price">{{item.quantity}} x {{item.price}}</p>
           </div>
         <button type="button" class="box-cart__icon" @click.prevent="handleDeleteClick(item)">
             <i class="fas fa-times-circle"></i>
         </button>
      </li>     
  `,
    methods: {
        handleDeleteClick(item) {
            this.$emit('onDelete', item);
        }
    }
});

Vue.component('cart', {
    props: ['query'],
    methods: {
        handleDeleteClick(item) {
            this.$emit('ondelete', item);
        },
    },
    data() {
        return {
            cart: [],
        };
    },
    computed: {
        filteredItems() {
            if (this.query) {
                const regexp = new RegExp(this.query, 'i');
                return this.cart.filter((item) => regexp.test(item.name));
            } else {
                return this.cart;
            }
        },
        total() {
            return this.cart.reduce((acc, item) => acc + item.quantity * item.price, 0);
        }
    },
    mounted() {
        fetch(`${API_URL}/cart`)
            .then(response => response.json())
            .then((items) => {
                this.cart = items;
            });
    },
    template: `
    <div class="drop-box-cart">
        <ul class="box-cart">
          <cart-item v-for="entry in filteredItems" :item="entry" @onDelete="handleDeleteClick"></cart-item>
        </ul>
        <div class="box-cart__total d-flex space-btw">
            <p class="box-cart__text">TOTAL</p>
            <p class="box-cart__text">{{total}}</p>
        </div>
        <a href="#" class="box-cart__btn button">
           Checkout
        </a>
        <a href="#" class="box-cart__btn button">
            Go to cart
        </a>   
    </div>
  `,
});

const app = new Vue({
    el: "#app",
    data: {
        items: [],
        cart: [],
        filterValue: '',
        menuItems: [],
        searchQuery: '',
        isVisibleCart: false,
    },
    mounted() {
        fetch(`${API_URL}/menu`)
            .then(response => response.json())
            .then((links) => {
                this.menuItems = links;
            });
    },
    methods: {
        handleSearchClick() {
            this.filterValue = this.searchQuery;
        },
        handleBuyClick(item) {
            const cartItem = this.cart.find((entry) => entry.id === item.id);
            if (cartItem) {
                // товар в корзине уже есть, нужно увеличить количество
                fetch(`${API_URL}/cart/${item.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({quantity: cartItem.quantity + 1}),
                })
                    .then((response) => response.json())
                    .then((item) => {
                        const itemIdx = this.cart.findIndex((entry) => entry.id === item.id);
                        Vue.set(this.cart, itemIdx, item);
                    });
            } else {
                // товара в корзине еще нет, нужно добавить
                fetch(`${API_URL}/cart`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({...item, quantity: 1})
                })
                    .then((response) => response.json())
                    .then((item) => {
                        this.cart.push(item);
                    });
            }
        },
        handleDeleteClick(item) {
            if (item.quantity > 1) {
                fetch(`${API_URL}/cart/${item.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({quantity: item.quantity - 1}),
                })
                    .then((response) => response.json())
                    .then((item) => {
                        const itemIdx = this.cart.findIndex((entry) => entry.id === item.id);
                        Vue.set(this.cart, itemIdx, item);
                    });
            } else {
                fetch(`${API_URL}/cart/${item.id}`, {
                    method: 'DELETE',
                })
                    .then(() => {
                        this.cart = this.cart.filter((cartItem) => cartItem.id !== item.id);
                    });
            }
        }
    }
});