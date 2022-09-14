import React from 'react';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {createRoot} from 'react-dom/client';
import {
    createBrowserRouter,
    RouterProvider,
    Route
} from "react-router-dom";
import ListContainer from "./components/ListContainer";
import ChartContainer from "./components/Charts/ChartContainer";
import CardsContainer from "./components/CardsContainer";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/list",
                element: <ListContainer />
            },
            {
                path: "/cards",
                element: <CardsContainer />
            },
            {
                path: "/charts",
                element: <ChartContainer />
            }
        ]
    },
]);

const root = createRoot(document.getElementById('root') as Element);
root.render(<React.StrictMode><RouterProvider router={router} /></React.StrictMode>);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
