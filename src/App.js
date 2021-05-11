import React, { useEffect, useState } from "react";
import './App.css';
import { BrowserRouter, Route } from "react-router-dom";
import { userStore } from "./index";
import { observer } from "mobx-react";
import API from './utils/API';
import { ENDPOINT, COLORS } from "./utils/config";
import { Snackbar, CircularProgress } from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import NavBar from "./NavBar";
import Login from "./auth/Login";
import Profile from "./components/Profile";
import PasswordEdit from "./components/PasswordEdit";
import Calendar from "./components/Calendar";
import Donor from "./components/Donor";
import Credit from "./components/Credit"
import Purchase from "./components/Purchase";
import Main from "./Main";
import MainAdmin from "./admin/MainAdmin";
import RequestMain from "./request/RequestMain";
import DeliveryMain from "./delivery/DeliveryMain";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: COLORS.BLACK,
      secondary: COLORS.RED
    }
  }
});

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
        if (error && error.data && error.data.error === "token_expired") {
          if(localStorage.refresh_token) {
            api
            .refreshToken()
            .then(() => {
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
            .catch(() => {
              userStore.setAuthenticated(false);
              setLoading(false);
            })
          } else {
            userStore.setAuthenticated(false);
            setLoading(false);
          }
        } else {
          userStore.setAuthenticated(false);
          setLoading(false);
        }
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
          <MuiThemeProvider theme={theme}>
            <BrowserRouter>
              <Route path="/" render={() => <Main logout={logout} setError={setError} />} exact />
              <Route path="/calendar" render={() => <Calendar logout={logout} setError={setError} />} exact />
              <Route path="/profile" render={() => <Profile logout={logout} setError={setError} />} exact />
              <Route path="/password/edit" render={() => <PasswordEdit logout={logout} setError={setError} />} exact />
              <Route path="/admin" render={() => <MainAdmin logout={logout} setError={setError} />} exact />
              <Route path="/donor" render={() => <Donor logout={logout} setError={setError} />} exact />
              <Route path="/request" render={() => <RequestMain logout={logout} setError={setError} />} exact />
              <Route path="/delivery" render={() => <DeliveryMain logout={logout} setError={setError} />} exact />
              <Route path="/credit" render={() => <Credit logout={logout} setError={setError} />} exact />
              <Route path="/purchase" render={() => <Purchase logout={logout} setError={setError} />} exact />
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
          </MuiThemeProvider>
        </div>
      )
    }
  }
}

export default observer(App);
