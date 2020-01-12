import React, { Component } from 'react';
import {storeProducts, detailProduct} from './data';

const ProductContext = React.createContext();

class ProductProvider extends Component {
    state = {
        products: [],
        detailProduct: detailProduct,
        cart: [],
        modelOpen: false,
        modelProduct: detailProduct,
        cartSubTotal: 0,
        cartTax: 0,
        cartTotal: 0
    };
    componentDidMount() {
        this.setProducts();
    }
    setProducts = () => {
        let tempProducts = [];
        storeProducts.forEach((item) => {
            const singleItem = {...item};
            tempProducts = [...tempProducts, singleItem];
        });
        this.setState(() => {
            return {
                products: tempProducts
            };
        })
    };
    getItem = (id) => {
        const product = this.state.products.find((item) => item.id === id);
        return product;
    }
    handleDetail = (id) => {
        const product = this.getItem(id);
        this.setState(() => {
            return {
                detailProduct: product
            }
        });
    };
    addToCart = (id) => {
        const tempProducts = [...this.state.products];
        const index = tempProducts.indexOf(this.getItem(id));
        const product = tempProducts[index];
        product.inCart = true;
        product.count = 1;
        const price = product.price;
        product.total = price;
        this.setState(() => {
            return { products: tempProducts, cart: [...this.state.cart, product]};
        }, () => {
            {/* callback function which is called right after the setState first function,
            where the state is set. This callback function will call the addTotal function. So
            it makes sure that the subtotal, tax and total gets the proper value calculated with the
            current latest item prices in the cart */}
            this.addTotals();
        });
    };
    openModel = id => {
        const product = this.getItem(id);
        this.setState(() => {
            return {
                modelOpen: true,
                modelProduct: product
            }
        });
    };
    closeModel = () => {
        this.setState(() => {
            return {
                modelOpen: false
            }
        });
    };
    increment = id => {
        let tempCart = [...this.state.cart];
        const selectedProduct = tempCart.find(item => item.id === id);
        const index = tempCart.indexOf(selectedProduct);
        const product = tempCart[index];
        product.count = product.count + 1;
        product.total = product.price * product.count;
        this.setState(() => {
            return {
                cart: [...tempCart]
            }
        }, () => {
            this.addTotals();
        })
    };
    decrement = id => {
        let tempCart = [...this.state.cart];
        const selectedProduct = tempCart.find(item => item.id === id);
        const index = tempCart.indexOf(selectedProduct);
        const product = tempCart[index];
        product.count = product.count - 1;
        if(product.count === 0){
            this.removeItem(id);
        }else{
            product.total = product.price * product.count;
            this.setState(() => {
                return {
                    cart: [...tempCart]
                }
            }, () => {
                this.addTotals();
            });
        }
    };
    removeItem = id => {
        let tempProducts = [...this.state.products];
        let tempCart = [...this.state.cart];
        tempCart = tempCart.filter(item => item.id !== id);
        const index = tempProducts.indexOf(this.getItem(id));
        let removedProduct = tempProducts[index];
        removedProduct.inCart = false;
        removedProduct.count = 0;
        removedProduct.total = 0;
        this.setState(() => {
            return {
                cart: [...tempCart],
                products: [...tempProducts]
            }
        }, () => {
            this.addTotals();
        })
    };
    clearCart = () => {
        this.setState(() => {
            return {
                cart: []
            }
        }, () => {
            this.setProducts();
            this.addTotals();
        })
    };
    addTotals = () => {
        let subTotal = this.state.cart.reduce((acc, cur) => {
            return acc + cur.total;
        }, 0);
        const tempTax = subTotal * 0.1;
        const tax = parseFloat(tempTax.toFixed(2));
        const total = subTotal + tax;
        this.setState(() => {
            return {
                cartSubTotal: subTotal,
                cartTax: tax,
                cartTotal: total
            }
        })
    };
    /*** Testing to see if state products changes the actual stored products
     *  - it does by default, as the reference of the stored product
     * is assigned to the state products.
     * - So in this case the actual data gets affected ***/
    /**tester = () => {
        console.log(`state product ${this.state.products[0].inCart}`);
        console.log(`stored product ${storeProducts[0].inCart}`);
        let tempProducts = [...this.state.products];
        tempProducts[0].inCart = false;
        this.setState(() => {
            return{
                products: tempProducts
            }
        }, () => {
            console.log(`state product ${this.state.products[0].inCart}`);
            console.log(`stored product ${storeProducts[0].inCart}`);
        });
    };
    **/
    render() {
        return (
            <ProductContext.Provider value={{
                ...this.state,
                handleDetail: this.handleDetail,
                addToCart: this.addToCart,
                openModel: this.openModel,
                closeModel: this.closeModel,
                increment: this.increment,
                decrement: this.decrement,
                removeItem: this.removeItem,
                clearCart: this.clearCart
            }}>
                {/*<button onClick={this.tester}>Test</button>*/}
                {this.props.children}
            </ProductContext.Provider>
        )
    }
}

const ProductConsumer = ProductContext.Consumer;

export {ProductProvider, ProductConsumer};