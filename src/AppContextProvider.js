import React from 'react';
import {AppContext} from "./globalState";

class AppContextProvider extends React.Component {
    constructor(props) {
        super(props);
        if (!localStorage.getItem("appContext")) {
            localStorage.setItem('appContext', JSON.stringify({
                currency: 'USD',
                cartItems: [],
                itemsCount: 0
            }));
        }
        this.state = JSON.parse(localStorage.getItem("appContext"));
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state !== prevState) {
            localStorage.setItem("appContext", JSON.stringify(this.state));
        }
    }

    render() {
        return (
            <AppContext.Provider value={{
                currency: this.state.currency,
                setCurrency: (currency) => this.setState({...this.state, currency: currency}),
                cartItems: this.state.cartItems,
                setCartItems:  (cartItems) => this.setState({...this.state, cartItems: cartItems, itemsCount: cartItems.length}),
                itemsCount: this.state.itemsCount
            }}>
                {this.props.children}
            </AppContext.Provider>
        );
    }
}

export default AppContextProvider;
