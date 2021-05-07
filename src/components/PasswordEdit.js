import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react";
import { Grid, Typography, TextField, Button } from "@material-ui/core";
import NavBar from "../NavBar";
import { ENDPOINT, COLORS } from "../utils/config";
import API from "../utils/API";

const PasswordEdit = (props) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleUpdate = (e) => {
        e.preventDefault()
        setMessage("");
        if (newPassword !== confirmNewPassword) {
            props.setError('Passwords does not match')
        }
        let api = new API()
        api.setAuthorizationToken(localStorage.access_token)
        api
        .put(`${ENDPOINT}/edit/user`, {
            "oldPassword" : "12345678",
            "newPassword": "87654321"
        })
        .then((data) => {
            setMessage("Password updated")
        })
        .catch((error) => {
            if (error && error.data && error.data.error === "token_expired") {
                if (localStorage.refresh_token) {
                    api
                    .refreshToken()
                    .then(() => {
                        api.setAuthorizationToken(localStorage.access_token)
                        api
                        .put(`${ENDPOINT}/edit/user`, {
                            "oldPassword" : "12345678",
                            "newPassword": "87654321"
                        })
                        .then((data) => {
                            setMessage("Password updated")
                        })
                        .catch((error) => {
                            if (error && error.data && error.data.message) {
                                setMessage(error.data.message)
                            } else {
                                setMessage("An error occurred")
                            }
                        })
                    })
                    .catch(() => {
                        userStore.setUser(null);
                        localStorage.removeItem('refresh_token');
                        localStorage.removeItem('access_token');
                        userStore.setAuthenticated(false);
                    })
                } else {
                    userStore.setUser(null);
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('access_token');
                    userStore.setAuthenticated(false);
                }
            } else if (error && error.data && error.data.message) {
                setMessage(error.data.message)
            } else {
                setMessage("An error occurred")
            }
        })
    }

    return (
        <div style={{height: "100%", backgroundColor: COLORS.WHITE}}>
            <NavBar {...props}  />
            <Grid container style={{padding: "20px 20px"}}>
                <Grid item lg={6} md={6} sm={6} xs={6}>
                    <Typography style={{color: COLORS.GREEN, paddingLeft: '20px', paddingRight: '20px', height: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}} variant="h4">
                        <b>Old Password</b>
                    </Typography>
                </Grid>
                <Grid item lg={6} md={6} sm={6} xs={6}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="oldPassword"
                        id="oldPassword"
                        value={oldPassword}
                        type="password"
                        onChange={(e) => {setOldPassword(e.target.value)}}
                    />
                </Grid>
                <Grid item lg={6} md={6} sm={6} xs={6}>
                    <Typography style={{color: COLORS.GREEN, paddingLeft: '20px', paddingRight: '20px', height: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}} variant="h4">
                        <b>New Password</b>
                    </Typography>
                </Grid>
                <Grid item lg={6} md={6} sm={6} xs={6}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="newPassword"
                        id="newPassword"
                        value={newPassword}
                        type="password"
                        onChange={(e) => {setNewPassword(e.target.value)}}
                    />
                </Grid>
                <Grid item lg={6} md={6} sm={6} xs={6}>
                    <Typography style={{color: COLORS.GREEN, paddingLeft: '20px', paddingRight: '20px', height: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}} variant="h4">
                        <b>Confirm New Password</b>
                    </Typography>
                </Grid>
                <Grid item lg={6} md={6} sm={6} xs={6}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="confirmNewPassword"
                        id="confirmNewPassword"
                        value={confirmNewPassword}
                        type="password"
                        onChange={(e) => {setConfirmNewPassword(e.target.value)}}
                    />
                </Grid>
            </Grid>
            { message && <h3 style={{color: "red"}}>{message}</h3>}
            <Button
            type="submit"
            fullWidth
            variant="contained"
            style={{
                borderRadius: 20,
                backgroundColor: COLORS.GREEN,
                padding: "18px 36px",
                fontSize: "18px",
                color: COLORS.WHITE,
                marginLeft : '10px',
                maxWidth: '200px'
            }}
            onClick={handleUpdate}
            >
                Update
            </Button>
        </div>
    )
}

export default observer(PasswordEdit);