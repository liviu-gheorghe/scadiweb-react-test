import React from 'react';
import './Minicart.css';
import {AppContext} from "../../globalState";
import {currencySymbols} from "../../util/currencySymbols";

class Minicart extends React.Component {
    static contextType = AppContext;
    constructor(props) {
        super(props);
        this.state = {
            isModalOpen: false,
            productQuantities: []
        }
    }

    getProductCount() {
        return this.context.itemsCount;
    }

    toggleModal() {
        this.setState({
            isModalOpen: !this.state.isModalOpen,
        })
    }

    getPriceInSelectedCurrency() {
        let selectedCurrencyPrice =  this.props.product?.prices.filter(price => price.currency === this.context.currency);
        if(selectedCurrencyPrice.length) {
            return selectedCurrencyPrice[0];
        }
        else return {};
    }

    getGrandTotal() {
        let total = 0;
       this.context.cartItems.forEach(
            (item) => {
                let priceInSelectedCurrency = item.prices.filter(p => p.currency === this.context.currency)[0];
                total += priceInSelectedCurrency.amount*item.qty;
            }
        );
        return {
            currency: this.context.currency,
            amount: Math.round(total * 100) / 100
        }
    }

    render() {
        return (
            <div id="mini-cart">
                <img
                    className="mini-cart-icon" onClick={() => {this.toggleModal()}}
                    src={ require('../../assets/images/outline_shopping_cart_black_24dp.png').default}
                    alt=""
                />
                {
                    this.getProductCount() > 0 ? (
                        <span onClick={() => {this.toggleModal()}} className="mini-cart-product-count">{this.getProductCount()}</span>
                    ) : (
                        <></>
                    )
                }
                <div className="mini-cart-overlay" style={{display: this.state.isModalOpen ? "block" : "none"}}/>
                <div className="mini-cart-body" style={{display: this.state.isModalOpen ? "block" : "none"}}>
                    {this.context.cartItems?.length ? (
                        <>
                        <div className="mini-cart-title">
                            <span>My Bag,</span><span> {this.getProductCount()} items</span>
                        </div>
                        <div className="mini-cart-items-list">
                            {this.context.cartItems?.map((item, key) => {
                                return (
                                        <div key={key} className="mini-cart-list-item">
                                            <MinicartItem product={item} />
                                        </div>
                                );
                            })}
                        </div>
                            <div className="grand-total">
                                <div className="grand-total-label">Total</div>
                                <div className="grand-total-value">{currencySymbols[this.context.currency]}{this.getGrandTotal().amount}</div>
                            </div>
                            <div className="mini-cart-buttons">
                                <button
                                    className="mini-cart-button"
                                    onClick={() => {
                                        window.location.href = process.env.REACT_APP_URL+"/cart";
                                    }}
                                    id="view-bag">
                                    View Bag
                                </button>
                                <button className="mini-cart-button" id="checkout">Checkout</button>
                            </div>
                        </>
                    ):(
                        <p style={{padding: "20px"}}>No cart items</p>
                    )}
                </div>
            </div>
        );
    }
}

export default Minicart;

class MinicartItem extends React.Component {
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
            <div className="mini-cart-item-container">
                <div className="mini-cart-item-details">
                    <div className="item-title">{this.props.product.name}</div>
                    <div className="item-price price">{currencySymbols[this.getPriceInSelectedCurrency().currency]}{this.getPriceInSelectedCurrency().amount}</div>
                    <div className="item-attributes">
                        {
                            this.props.product.attributes.map((attribute,key) => {
                                return (
                                    <div key={key} className="attribute-items-container">
                                        {
                                            attribute.items.map((item, key) => {
                                                if(attribute.type === "text")
                                                    return  (
                                                        <div
                                                            key={key}
                                                            className={`attribute-item ${this.props.product.attributes_config[attribute.id] && this.props.product.attributes_config[attribute.id].values[key] === true ? 'attribute-item-selected' : ''}`}>
                                                            {item.displayValue}
                                                        </div>
                                                    )
                                                // Maybe there is too little space in the minicart to put the swatch attrs too...
                                                // else if(attribute.type === "swatch") {
                                                //     return (
                                                //         <div
                                                //             key={key}
                                                //             style={{
                                                //                 backgroundColor: item.value
                                                //             }}
                                                //             className={`color-swatch ${this.props.product.attributes_config[attribute.id] && this.props.product.attributes_config[attribute.id].values[key] === true ? 'swatch-attribute-item-selected' : ''}`}
                                                //         />
                                                //     );
                                                // }
                                                else return (
                                                        <></>
                                                    );
                                            })
                                        }
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
                <div className="mini-cart-item-quantity-chooser">
                    <div  onClick={ () => {this.updateProductQty(this.props.product, 1)} } className="qty-increase">+</div>
                    <div className="qty-value">{this.props.product.qty}</div>
                    <div onClick={ () => {this.updateProductQty(this.props.product, -1)} } className="qty-decrease">-</div>
                </div>
                <div className="mini-cart-item-image">
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
