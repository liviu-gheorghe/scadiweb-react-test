import React from 'react';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';
import Minicart from '../Minicart/Minicart';
import {apolloClient} from "../../index";
import {gql} from "@apollo/client";
import {AppContext} from "../../globalState";
import {currencySymbols} from "../../util/currencySymbols";
import {getUniqueValues} from "../../util/arrayUtils";

const categories = [
    "Women",
    "Men",
    "Kids"
];

class CurrencySwitcher extends React.Component {
    static contextType = AppContext;
    constructor(props) {
        super(props);
        this.state = {
            isModalOpen: false
        }
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        apolloClient
            .query({
                query: gql`
                  {
                    currencies
                    category {
                      products {
                        category
                      }
                    }            
                  }
                `
            })
            .then(result => {
                this.setState({
                    currencies: result["data"]["currencies"],
                    categories: getUniqueValues(result["data"]["category"]["products"].map(p=>p.category)),
                    ...this.state
                });
            })
            .catch(err=> {
                console.error(err);
            });
    }

    toggleModal() {
        this.setState({
            isModalOpen: !this.state.isModalOpen
        })
    }

    render() {
        return (
            <div id="currency-switcher">
                <span onClick={()=>{this.toggleModal()}} className="currency-sign">{currencySymbols[this.context.currency]}</span>
                <FontAwesomeIcon onClick={()=>{this.toggleModal()}} icon={ this.state.isModalOpen ? faAngleUp : faAngleDown } size="xs" style={{paddingLeft: "5px"}}/>
                <div className="currency-switcher-body" style={{display: this.state.isModalOpen ? "block" : "none"}}>
                    {
                        this.state.currencies?.map((currency, key) => {
                            return <div className={`currency-option ${currency === this.context.currency ? "currency-option-selected": ""}`} onClick={() => {this.changeCurrency(currency)}} key={key}>{currencySymbols[currency]} {currency}</div>
                        })
                    }
                </div>
            </div>
        );
    }

    changeCurrency(currency) {
        this.context.setCurrency(currency);
        this.toggleModal();
    }
}

class Header extends React.Component {
    static contextType = AppContext;
    constructor(props) {
        super(props);
        this.state = {
            categories : []
        }
    }

    componentDidMount() {
        apolloClient
            .query({
                query: gql`
                  {
                    category {
                      products {
                        category
                      }
                    }            
                  }
                `
            })
            .then(result => {
                this.setState({
                    ...this.state,
                    categories: getUniqueValues(result["data"]["category"]["products"].map(p=>p.category)),
                });
            })
            .catch(err=> {
                console.error(err);
            });
    }

    render() {
        return (
            <>
                <header id="header">
                    <nav className="categories-nav">
                        <ul className="categories-list">
                            {
                                this.state.categories.map((categoryName, key) => {
                                    return <a key={key} href={`${process.env.REACT_APP_URL}/category/${categoryName}`}> <li >{categoryName}</li></a>
                                })
                            }
                        </ul>
                    </nav>
                    <div className="header-go-back">
                        <img
                            style={{
                                height: "25px",
                                width: "25px",
                                marginTop: "20px",
                                cursor: "pointer"
                            }}
                            onClick = {() => {
                                window.location.href = process.env.REACT_APP_URL
                            }}
                            src={require('../../assets/images/go_back_green.png').default}
                            alt=""
                        />
                    </div>
                    <div className="header-menu">
                        <CurrencySwitcher />
                        <Minicart />
                    </div>
                </header>
            </>
        );
    }
}

export default Header;
