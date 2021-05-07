import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react"
import { ENDPOINT, COLORS } from "../utils/config"
import API from "../utils/API"
import {
    CircularProgress,
    Grid,
    Button,
    Typography
} from "@material-ui/core";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const RequestDetails = (props) => {
    const [loading, setLoading] = useState(true);
    const [dateRequested, setDateRequested] = useState(new Date());
    const [item, setItem] = useState("");
    const [quantity, setQuantity] = useState(0);
    useEffect(() => {
        async function initialize() {
            setLoading(true);
            try {
                await getRequestDetails()
            } catch(error) {
                if (error && error.data && error.data.message) {
                    props.setError(error.data.message)
                } else {
                    props.setError("An error occurred")
                }
            }
            setLoading(false);
        }
        initialize()
    }, []);
    const getRequestDetails = () => {
        let api = new API();
        return new Promise((resolve, reject) => {
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/request/information/${props.selectedRequestID}`)
            .then((data) => {
                let request = data.request
                setDateRequested(new Date(request.dateRequested))
                setQuantity(request.quantity)
                api
                .post(`${ENDPOINT}/category/information`, {
                    'categoryTypeIDs' : [request.categoryTypeID]
                })
                .then((data) => {
                    setItem(`${data.information[request.categoryTypeID].category}, ${data.information[request.categoryTypeID].categoryType}`)
                    resolve()
                })
                .catch((error) => {
                    reject(error)
                })
            })
            .catch((error) => {
                if (error && error.data && error.data.error === "token_expired") {
                    if (localStorage.refresh_token) {
                        api
                        .refreshToken()
                        .then(() => {
                            api.setAuthorizationToken(localStorage.access_token)
                            api
                            .get(`${ENDPOINT}/request/information/${props.selectedRequestID}`)
                            .then((data) => {
                                let request = data.request
                                setDateRequested(new Date(request.dateRequested))
                                setQuantity(request.quantity)
                                api
                                .post(`${ENDPOINT}/category/information`, {
                                    'categoryTypeIDs' : [request.categoryTypeID]
                                })
                                .then((data) => {
                                    setItem(`${data.information[request.categoryTypeID].category}, ${data.information[request.categoryTypeID].categoryType}`)
                                    resolve()
                                })
                                .catch((error) => {
                                    reject(error)
                                })
                            })
                            .catch((error) => {
                                reject(error)
                            })
                        })
                        .catch((error) => {
                            userStore.setUser(null);
                            localStorage.removeItem('refresh_token');
                            localStorage.removeItem('access_token');
                            userStore.setAuthenticated(false);
                            reject(error)
                        })
                    } else {
                        userStore.setUser(null);
                        localStorage.removeItem('refresh_token');
                        localStorage.removeItem('access_token');
                        userStore.setAuthenticated(false);
                        reject()
                    }
                } else {
                    reject(error);
                }
            })
        })
    }
    const handleDelete = () => {
        let api = new API();
        setLoading(true);
        api.setAuthorizationToken(localStorage.access_token)
        api
        .delete(`${ENDPOINT}/request`, {
            "id" : props.selectedRequestID
        })
        .then(async (data) => {
            props.returnToMain()
            setLoading(false);
        })
        .catch((error) => {
            if (error && error.data && error.data.error === "token_expired") {
                if (localStorage.refresh_token) {
                    api
                    .refreshToken()
                    .then(() => {
                        api.setAuthorizationToken(localStorage.access_token)
                        api
                        .delete(`${ENDPOINT}/request`, {
                            "id" : props.selectedRequestID
                        })
                        .then(async (data) => {
                            props.returnToMain()
                            setLoading(false);
                        })
                        .catch((error) => {
                            if (error && error.data && error.data.message) {
                                props.setError(error.data.message)
                                setLoading(false)
                            } else {
                                props.setError("An error occurred")
                                setLoading(false)
                            }
                        })
                    })
                    .catch((error) => {
                        setLoading(false);
                        userStore.setUser(null);
                        localStorage.removeItem('refresh_token');
                        localStorage.removeItem('access_token');
                        userStore.setAuthenticated(false);
                    })
                } else {
                    setLoading(false);
                    userStore.setUser(null);
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('access_token');
                    userStore.setAuthenticated(false);
                }
            } else if (error && error.data && error.message) {
                props.setError(error.message)
                setLoading(false)
            } else {
                props.setError("An error occurred")
                setLoading(false)
            }
        })
    }

    if (loading) {
        return (
            <div style={{width: "100%", height: "auto", display: "flex", justifyContent: "center", alignItems: "center"}}>
                <CircularProgress size={50} />
            </div>
        )
    } else {
        return (
            <div style={{justifyContent: "center", display: "flex", flexDirection: "column", padding: "30px 30px"}}>
                <div style={{marginTop: "15px"}}></div>
                <Grid container>
                    <Grid style={{textAlign: "left"}} item lg={4} md={4} sm={4} xs={4}>
                        <span style={{paddingLeft: '20px', cursor: 'pointer'}} onClick={props.returnToMain}><ArrowBackIcon style={{fontSize: '50px'}} /></span>
                    </Grid>
                    <Grid item lg={4} md={4} sm={4} xs={4}>
                        
                    </Grid>
                    <Grid item lg={4} md={4} sm={4} xs={4}>
                            <Button onClick={handleDelete}>
                                Delete
                            </Button>
                            <Typography style={{color: COLORS.GREEN, float: "right"}} variant="h4">
                                Pending
                            </Typography>
                    </Grid>
                </Grid>
                <Typography style={{color: COLORS.BLUE, textAlign: "left"}} variant="h4">
                    Request Details
                </Typography>
                <div style={{marginTop: "10px", display: "flex", alignItems: "center"}}>
                    <Typography style={{float: "left", color: COLORS.GREEN, width: "250px", textAlign: "left"}} variant="h4">
                        Requested on
                    </Typography>
                    <h4 style={{textAlign: "left", marginBottom: "0px"}}>{dateRequested.toLocaleDateString()}</h4>
                </div>
                <div style={{marginTop: "10px", display: "flex", alignItems: "center"}}>
                    <Typography style={{float: "left", color: COLORS.GREEN, width: "250px", textAlign: "left"}} variant="h4">
                        Item
                    </Typography>
                    <h4 style={{textAlign: "left", marginBottom: "0px"}}>{item}</h4>
                </div>
                <div style={{marginTop: "10px", display: "flex", alignItems: "center"}}>
                    <Typography style={{float: "left", color: COLORS.GREEN, width: "250px", textAlign: "left"}} variant="h4">
                        Quantity
                    </Typography>
                    <h4 style={{textAlign: "left", marginBottom: "0px"}}>{quantity}</h4>
                </div>
            </div>
        )
    }
}

export default observer(RequestDetails)