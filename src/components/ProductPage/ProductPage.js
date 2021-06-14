import React from 'react';
import './ProductPage.css';
import {apolloClient} from "../../index";
import {gql} from "@apollo/client";
import {AppContext} from "../../globalState";
import {currencySymbols} from "../../util/currencySymbols";
import Error from "../errors/Error";

class ProductPage extends React.Component {

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
                        product: result.data.category.products.filter(p => p.name ===this.props.match.params.product_name)[0],
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
            <>
                <div className="container">
                    {
                        this.state.product ? (
                            <div className="row">
                                <div className="col-6">
                                    <ProductImageGallery product={this.state.product} />
                                </div>
                                <div className="col-5 product-sidebar-container">
                                    <ProductSidebar product={this.state.product} />
                                </div>
                            </div>
                        ) : (
                            <Error errorMessage="Something went wrong, please try again later" />
                        )
                    }
                </div>
            </>
        );
    }
}


class ProductSidebar extends React.Component {

    constructor(props) {
        super(props);
        this.ProductAttributes = React.createRef();
    }


    static contextType = AppContext;

    getPriceInSelectedCurrency() {
        let selectedCurrencyPrice =  this.props.product?.prices.filter(price => price.currency === this.context.currency);
        if(selectedCurrencyPrice.length) {
            return selectedCurrencyPrice[0];
        }
        else return {};
    }


    addProductToCart(product) {
        let cartItems = this.context.cartItems;
        if(!cartItems) cartItems = [];
        const productAttributes = this.ProductAttributes.current;
        if(cartItems.filter(p => p.name === product.name).length > 0) {
           for(let i=0;i<cartItems.length;i++) {
               if(cartItems[i].name===product.name) {
                   cartItems[i].qty++;
                   break;
               }
           }
        }
        else {
            cartItems.push({...product, attributes_config: productAttributes.state.attributes_config, qty: 1});
        }
        this.context.setCartItems(cartItems);
    }


    render() {
        return (
            <div className="product-sidebar">
                <div className="product-name">{this.props.product?.name}</div>
                <ProductAttributes product = {this.props.product} ref={this.ProductAttributes} />
                <div className="product-price">
                    <div className="product-price-label">Price:</div>
                    <div className="product-price-value">
                        {currencySymbols[this.getPriceInSelectedCurrency().currency]}{this.getPriceInSelectedCurrency().amount}
                    </div>
                </div>
                <button id="add-to-cart" onClick={() => {this.addProductToCart(this.props.product)} }>Add to cart</button>
                <div className="product-description" dangerouslySetInnerHTML={{__html: this.props.product?.description}}/>
            </div>
        );
    }
}


class ProductAttributes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            attributes_config : {}
        }
    }

    selectAttributeItem(attribute, key) {

        let attributesConfig = this.state.attributes_config;
        if(attributesConfig[attribute.id]) {
            for(let i=0;i<attributesConfig[attribute.id].values.length;i++) {
                attributesConfig[attribute.id].values[i] = false;
            }
        }
        else {
            attributesConfig[attribute.id] = {
                id: attribute.id,
                values: []
            };
        }

        attributesConfig[attribute.id].values[key] = true;
        this.setState({
            attributes_config: attributesConfig
        });
    }

    render() {
        return (
            <div className="product-attributes">
                {
                    this.props.product?.attributes.map((attribute, key) => {
                        return (
                            <div key={key} className="product-attribute-container">
                                <div className="product-attribute-label">
                                    {attribute.name}:
                                </div>

                                <div className="attribute-items-container">
                                    {
                                        attribute.items.map((item, key) => {
                                            if(attribute.type === "text")
                                            return  (
                                                <div
                                                    key={key}
                                                    onClick={() => {this.selectAttributeItem(attribute, key)}}
                                                    className={`attribute-item ${this.state.attributes_config[attribute.id] && this.state.attributes_config[attribute.id].values[key] ? 'attribute-item-selected' : ''}`}>
                                                    {item.displayValue}
                                                </div>
                                            )
                                            else if(attribute.type === "swatch") {
                                                return (
                                                    <div
                                                        key={key}
                                                        onClick={() => {
                                                            this.selectAttributeItem(attribute, key)
                                                        }}
                                                        style={{
                                                            backgroundColor: item.value
                                                        }}
                                                        className={`color-swatch ${this.state.attributes_config[attribute.id] && this.state.attributes_config[attribute.id].values[key] ? 'swatch-attribute-item-selected' : ''}`}
                                                    />
                                                );
                                            }
                                            else return (
                                                <></>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}


class ProductImageGallery extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentImage: 0,
            imageCount : this.props.gallery?.length
        };
    }

    changeCurrentImage = (index) => {
        this.setState({
            currentImage: index
        })
    }
    render() {
        return (
          <div className="gallery-container">
              <div className="image-thumbnails">

                  {
                      this.props.product.gallery.map((imageUrl, key) => {
                          return (
                              <div className="thumbnail" key={key}>
                                  <img src={`${imageUrl}`} alt="" onClick={() => {this.changeCurrentImage(key)}}/>
                              </div>
                          );
                      })
                  }
              </div>
              <div className="current-image-container">
                  <img src={`${this.props.product?.gallery[this.state.currentImage]}`} alt=""/>
              </div>
          </div>
        );
    }
}


export default ProductPage;
export {ProductAttributes};
