import React from 'react';
import './stylesheets/index.css';
import './stylesheets/normalize.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ListContainer from './components/ListContainer';
import ChartContainer from './components/Charts/ChartContainer';
import CardsContainer from './components/CardsContainer';
import About from './components/About';
import Rewards from './components/Rewards';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '/',
                element: <ListContainer />,
                index: true
            },
            {
                path: '/compact',
                element: <ListContainer />
            },
            {
                path: '/expanded',
                element: <CardsContainer />
            },
            {
                path: '/charts',
                element: <ChartContainer />
            },
            {
                path: '/about',
                element: <About />
            },
            {
                path: '/rewards',
                element: <Rewards />
            }
        ]
    }
]);

const root = createRoot(document.getElementById('root') as Element);
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
