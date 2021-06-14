import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { Route,BrowserRouter,Switch } from 'react-router-dom';
import HomePage from "./components/HomePage/HomePage";
import NotFound from "./components/NotFound/NotFound";
import ProductPage from "./components/ProductPage/ProductPage";
import CategoryPage from "./components/CategoryPage/CategoryPage";
import Header from "./components/Header/Header";
import CartPage from "./components/CartPage/CartPage";

import AppContextProvider from "./AppContextProvider";

import {
    ApolloClient,
    InMemoryCache,
} from "@apollo/client";


const apolloClient = new ApolloClient({
    uri: `${process.env.REACT_APP_APOLLO_SERVER_URI || 'http://localhost:4000'}`,
    cache: new InMemoryCache()
});

const router = (
    <AppContextProvider>
        <BrowserRouter forceRefresh={true}>
            <Route path="/" component={Header} />
            <Switch>
                <Route exact path="/" component={HomePage} />
                <Route exact path="/product/:product_name/" component={ProductPage} />
                <Route exact path="/category/:category_name/" component={CategoryPage} />
                <Route exact path="/cart/" component={CartPage} />
                <Route path="/" component={NotFound} />
            </Switch>
        </BrowserRouter>
    </AppContextProvider>
);

ReactDOM.render(router, document.getElementById('root'));
reportWebVitals();
export {apolloClient};
