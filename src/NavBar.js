import React, { useEffect, useState } from "react";
import { Link, Redirect, useLocation } from "react-router-dom";
import { userStore } from "./index";
import { observer } from "mobx-react";
import API from './utils/API';
import { ENDPOINT, COLORS } from "./utils/config";
import { AppBar, Typography, Button, MenuItem, Menu } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";

function NavBar(props) {
    const location = useLocation();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [redirectProfile, setRedirectProfile] = React.useState(false);
    const [redirectHome, setRedirectHome] = React.useState(false);
    const [redirectPasswordEdit, setRedirectPasswordEdit] = React.useState(false);
    const [redirectCalendar, setRedirectCalendar] = React.useState(false);
    const [redirectAdmin, setRedirectAdmin] = React.useState(false);
    const [redirectDonor, setRedirectDonor] = React.useState(false);
    const [redirectRequest, setRedirectRequest] = React.useState(false);
    const [redirectDelivery, setRedirectDelivery] = React.useState(false);
    const [redirectCredit, setRedirectCredit] = React.useState(false);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
      };
    if (redirectProfile && (location.pathname !== "/profile")) {
        return (<Redirect to={{pathname: "/profile"}}/>)
    } 
    else if (redirectHome && (location.pathname !== "/")) {
        return (<Redirect to={{pathname: "/"}}/>)
    } 
    else if (redirectCredit && (location.pathname !== "/credit")) {
        return (<Redirect to={{pathname: "/credit"}}/>)
    }
    else if (redirectPasswordEdit && (location.pathname !== "/password/edit")) {
        return (<Redirect to={{pathname: "/password/edit"}}/>)
    } else if (redirectCalendar && (location.pathname !== "/calendar")) {
        return (<Redirect to={{pathname: "/calendar"}}/>)
    } else if (redirectAdmin && (location.pathname !== "/admin")) {
        return (<Redirect to={{pathname: "/admin"}}/>)
    } else if (redirectDonor && location.pathname !== "/donor") {
        return (<Redirect to={{pathname: "/donor"}}/>)
    } else if (redirectRequest && (location.pathname !== "/request")) {
        return (<Redirect to={{pathname: "/request"}}/>)
    } else if (redirectDelivery && (location.pathname !== "/delivery")) {
        return (<Redirect to={{pathname: "/delivery"}}/>)
    } else {
        return (
            <AppBar
                position="static"
                style={{ backgroundColor: COLORS.LIGHT_BLUE}}
                elevation={3}
            >   
                <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                    <Typography style={{width: '150px'}} variant="h4">
                        <b><span style={{cursor: 'pointer', color: COLORS.GREY}} onClick={() => {setRedirectHome(true)}}>Home</span></b>
                    </Typography>
                    <Typography style={{width: '150px'}} variant="h4">
                        <b><span style={{cursor: 'pointer', color: COLORS.GREY}}  onClick={() => {setRedirectDonor(true)}}>Donor</span></b>
                    </Typography>
                    <Typography style={{width: '200px'}} variant="h4">
                        <b><span style={{cursor: 'pointer', color: COLORS.GREY}}  onClick={() => {setRedirectDelivery(true)}}>Volunteer</span></b>
                    </Typography>
                    <Typography style={{width: '200px'}} variant="h4">
                        <b><span style={{cursor: 'pointer', color: COLORS.GREY}}  onClick={() => {setRedirectRequest(true)}}>Beneficiary</span></b>
                    </Typography>
                    <div style={{width: '100px'}}>
                        <Button
                            aria-controls="simple-menu"
                            aria-haspopup="true"
                            onClick={handleClick}
                        >
                            <MenuIcon color="primary" style={{fontSize: '50px'}} />
                        </Button>
                        <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={() => {setRedirectProfile(true)}}>
                                Profile
                            </MenuItem>
                            <MenuItem onClick={() => {setRedirectPasswordEdit(true)}}>
                                Change Password
                            </MenuItem>
                            <MenuItem onClick={() => {setRedirectCalendar(true)}}>
                                Calendar
                            </MenuItem>
                            <MenuItem onClick={() => {setRedirectCredit(true)}}>
                                Social Credit
                            </MenuItem>
                            <MenuItem onClick={() => {setRedirectAdmin(true)}}>
                                Admin
                            </MenuItem>
                            <MenuItem onClick={props.logout}>Log out</MenuItem>
                        </Menu>
                    </div>
                </div>
            </AppBar>
        )
    }
}

export default observer(NavBar);