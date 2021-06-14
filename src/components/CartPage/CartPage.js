import React from 'react';
import './CartPage.css';
import {ProductAttributes} from "../ProductPage/ProductPage";
import {AppContext} from "../../globalState";
import {currencySymbols} from "../../util/currencySymbols";

class CartPage extends React.Component {
    static contextType = AppContext;
    render() {
        return (
            <div className="container" style={{padding: "0 25px"}}>
                <div className="row">
                    <div className="cart-title">Cart</div>
                </div>
                <div className="row">
                    <div className="cart-body">
                        {
                            this.context.cartItems?.length ? (
                                <>
                                    <div className="cart-items-list">
                                        {this.context.cartItems?.map((item, key) => {
                                            return (
                                                <div key={key} className="cart-list-item">
                                                    <CartItem product={item} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ):(
                                <p style={{padding: "20px"}}>No cart items</p>
                            )
                        }
                    </div>
                </div>
            </div>

        );
    }
}


class CartItem extends React.Component {
    static contextType = AppContext;

    getPriceInSelectedCurrency() {
        let selectedCurrencyPrice =  this.props.product?.prices.filter(price => price.currency === this.context.currency);
        if(selectedCurrencyPrice.length) {
            return selectedCurrencyPrice[0];
        }
        else return {};
    }

    render() {
        return (
            <div className="cart-item-container">
                <div className="cart-item-details">
                    <div className="item-title">{this.props.product.name}</div>
                    <div className="item-price price">{currencySymbols[this.getPriceInSelectedCurrency().currency]}{this.getPriceInSelectedCurrency().amount}</div>
                    <ProductAttributes product={this.props.product} />
                </div>
                <div className="cart-item-quantity-chooser">
                    <div  onClick={ () => {this.updateProductQty(this.props.product, 1)} } className="qty-increase">+</div>
                    <div className="qty-value">{this.props.product.qty}</div>
                    <div onClick={ () => {this.updateProductQty(this.props.product, -1)} } className="qty-decrease">-</div>
                </div>
                <div className="cart-item-image">
                    <img src={this.props.product.gallery[0]} alt=""/>
                </div>
            </div>
        );
    }

    updateProductQty(product, number) {
        let items = this.context.cartItems;
        for(let i=0;i<items.length;i++) {
            if(items[i].name === product.name) {
                let newQty = items[i].qty + number;
                if(newQty <= 0) {
                    items.splice(i,1);
                }
                else {
                    items[i].qty = newQty;
                }
                break;
            }
        }
        this.context.setCartItems(items);
    }
}

export default CartPage;
