import React from 'react';
import './CategoryPage.css';
import {apolloClient} from "../../index";
import {gql} from "@apollo/client";
import {capitalize} from "../../util/stringUtils";
import {AppContext} from "../../globalState";
import {currencySymbols} from "../../util/currencySymbols";
import Error from "../errors/Error";
class CategoryPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true
        }
    }


    componentDidMount() {
        apolloClient
            .query({
                query: gql`
                {
                    category {
                        name
                        products {
                            name,
                            prices {
                                currency
                                amount
                            }
                            inStock,
                            gallery,
                            description,
                            category
                            attributes {
                                id,
                                name,
                                type,
                                items {
                                    displayValue
                                    value
                                    id
                                }
                            }
                        }
                    }
                }
                `
            })
            .then(result => {
                if (result.loading === false)
                    this.setState({
                        ...this.state,
                        products: result.data.category.products,
                        isLoading: false
                    });
            })
            .catch(err => {
                console.error(err);
                this.setState({
                    ...this.state,
                    isLoading: false
                });
            });
    }

    render() {
        if(this.state.isLoading) return <></>;
        return (
            <div className="container category-page-container">
                <div className="row category-page-row">
                    <div className="category-title">{capitalize(this.props.match.params.category_name)}</div>
                </div>
                <div className="row category-page-row">
                    {
                        this.state.products ? (
                            this.state.products.filter(
                                p => p.category === this.props.match.params.category_name
                            ).map((product,key) => {
                                return (
                                    <ProductCard key={key} product={product} />
                                );
                            })
                        ) : (
                            <Error errorMessage="Something went wrong, please try again later" />
                        )
                    }
                </div>
            </div>

        );
    }
}


class ProductCard extends React.Component {

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
            <div className={`product-card ${!this.props.product.inStock ? "out-of-stock" : ""}`}>
                <a href={`${process.env.REACT_APP_URL}/product/${this.props.product.name}`}>
                    <div className="product-card-image">
                        {
                            this.props.product.inStock === false ? (
                                <OutOfStockOverlay />
                            ) : (
                                <></>
                            )
                        }
                            <img src={this.props.product.gallery[0]} alt=""/>
                    </div>
                </a>
                {
                    this.props.product.inStock === true ? (
                        <div className="product-card-add-to-cart">
                            <img
                                onClick={() => {this.addToCart(this.props.product)}}
                                src={ require('../../assets/images/outline_shopping_cart_white_24dp.png').default}
                                alt=""
                            />
                        </div>
                    ) : (
                        <></>
                    )
                }

                <div className="product-card-name">{this.props.product.name}</div>
                <div className="product-card-price">{currencySymbols[this.getPriceInSelectedCurrency().currency]}{this.getPriceInSelectedCurrency().amount}</div>
            </div>
        );
    }

    addToCart(product) {
        let cartItems = this.context.cartItems;
        if(!cartItems) cartItems = [];
        let itemsCount = this.context.itemsCount;
        if(itemsCount === undefined) itemsCount = 0;
        if(cartItems.filter(p => p.name === product.name).length > 0) {
            for(let i=0;i<cartItems.length;i++) {
                if(cartItems[i].name===product.name) {
                    cartItems[i].qty++;
                    break;
                }
            }
        }
        else {
            cartItems.push({...product, attributes_config: [], qty: 1});
        }
        this.context.setCartItems(cartItems);
    }
}

class OutOfStockOverlay extends React.Component {
    render() {
        return (
            <div className="image-overlay">
                <div className="overlay-cart">
                    <div>Out of Stock</div>
                </div>
            </div>
        );
    }
}

export default CategoryPage;
