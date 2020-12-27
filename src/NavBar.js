import React, { useEffect, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { userStore } from "./index";
import { observer } from "mobx-react";
import API from './utils/API';
import { ENDPOINT, COLORS } from "./utils/config";
import { AppBar, Typography, Button, MenuItem, Menu } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";

function NavBar(props) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
      };
    return (
        <AppBar
            position="static"
            style={{ backgroundColor: COLORS.LIGHT_BLUE}}
            elevation={3}
        >   
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <Typography style={{width: '100px'}} variant="h5">
                    <span style={{cursor: 'pointer', color: COLORS.BLACK}} onClick={() => {}}>Home</span>
                </Typography>
                <Typography style={{width: '100px'}} variant="h5">
                    <span style={{cursor: 'pointer', color: COLORS.BLACK}}  onClick={() => {}}>Donor</span>
                </Typography>
                <Typography style={{width: '150px'}} variant="h5">
                    <span style={{cursor: 'pointer', color: COLORS.BLACK}}  onClick={() => {}}>Volunuteer</span>
                </Typography>
                <Typography style={{width: '150px'}} variant="h5">
                    <span style={{cursor: 'pointer', color: COLORS.BLACK}}  onClick={() => {}}>Beneficiary</span>
                </Typography>
                <div style={{width: '100px'}}>
                    <Button
                        aria-controls="simple-menu"
                        aria-haspopup="true"
                        onClick={handleClick}
                    >
                        <MenuIcon color="primary" />
                    </Button>
                    <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={() => {}}>
                            Profile
                        </MenuItem>
                        <MenuItem onClick={() => {}}>
                            Change Password
                        </MenuItem>
                        <MenuItem onClick={() => {}}>
                            Social Credit
                        </MenuItem>
                        <MenuItem onClick={() => {}}>
                            Feedback
                        </MenuItem>
                        <MenuItem onClick={() => {}}>
                            Help
                        </MenuItem>
                        <MenuItem onClick={props.logout}>Log out</MenuItem>
                    </Menu>
                </div>
            </div>
        </AppBar>
    )
}

export default observer(NavBar);