import React, { useEffect, useState } from "react";
import './App.css';
import { BrowserRouter, Route } from "react-router-dom";
import { userStore } from "./index";
import { observer } from "mobx-react";
import API from './utils/API';
import { ENDPOINT } from "./utils/config";
import { Snackbar, CircularProgress } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Login from "./auth/Login";
import Main from "./Main";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(localStorage.access_token) {
      let api = new API();
      api.setAuthorizationToken(localStorage.access_token)
      api
      .get(`${ENDPOINT}/login`)
      .then((data) => {
        localStorage.access_token = data.access_token
        localStorage.refresh_token = data.refresh_token
        api
        .get(`${ENDPOINT}/user`)
        .then((data) => {
          userStore.setUser(data.user);
          userStore.setAuthenticated(true);
          setLoading(false);
        })
        .catch((error) => {
          userStore.setAuthenticated(false);
          setLoading(false);
        })        
      })
      .catch((error) => {
        userStore.setAuthenticated(false);
        setLoading(false);
      })
    } else {
      setLoading(false);
    }
  }, [])

  const [errorBarOpen, setErrorBarOpen] = React.useState(false);
  const [errorText, setErrorText] = React.useState('');

  const setError = (text) => {
    setErrorText(text);
    setErrorBarOpen(true);
  }

  const logout = () => {
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('access_token');
    userStore.setUser(null);
    userStore.setAuthenticated(false);
  }

  const closeError = () => {
    setErrorBarOpen(false);
  }

  if (loading) {
    return (
      <div className="App">
        <div style={{display: "flex", justifyContent: "center", height: "100%"}}>
          <div style={{width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
            <CircularProgress size={200} />
          </div>  
        </div>
      </div>
    )
  } else {
    if (!userStore.isAuthenticated) {
      return (
        <div className="App">
          <Login />
        </div>
      )
    } else {
      return (
        <div className="App">
          <BrowserRouter>
            <Route path="/" render={() => <Main logout={logout} setError={setError} />} exact />
          </BrowserRouter>
          <Snackbar 
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={errorBarOpen}
          autoHideDuration={6000}
          onClose={closeError}
          message={errorText}
          action={
            <React.Fragment>
              <IconButton size="small" aria-label="close" color="inherit" onClick={closeError}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
          />
        </div>
      )
    }
  }
}

export default observer(App);
