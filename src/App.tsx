import React, { lazy } from 'react';
import {HashRouter, Router, Route, Redirect, Switch  } from 'react-router-dom'
import logo from './logo.svg';
import './App.css';
import SuspenseWithChunkError from './components/SuspenseWithChunkError'
import PageLoader from './components/Loader/PageLoader'
import history from './routerHistory'

// import { Connect } from "./views/ConnectPage"


const Connect = lazy(() => import('./views/ConnectPage'))
const Mainpage = lazy(() => import('./views/MainPage'))

function App() {
  return (

      // <HashRouter basename={"/"}>
      //   {/* <SessionProvider> */}
      //     {/* <Header /> */}
      //     <Switch>
      //         <Route path="/connect">
      //          <Connect />
      //        </Route>
      //     </Switch>
      //   {/* </SessionProvider> */}
      // </HashRouter>

      <div className="main">

     <Router history={history}>
         <SuspenseWithChunkError fallback={<PageLoader />}>
           <Switch>
             <Route path="/" exact>
                <Mainpage />
             </Route>
             <Route path="/mainpage">
             <Mainpage />
             </Route>
           </Switch>
         </SuspenseWithChunkError>
     </Router>
    </div>
  );
}

export default App;
