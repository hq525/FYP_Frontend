import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react"
import {
    Grid,
    Button,
    CircularProgress
} from "@material-ui/core";
import { ENDPOINT, COLORS } from "../utils/config"
import API from "../utils/API"
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import PersonIcon from '@material-ui/icons/Person';
import ScheduleIcon from '@material-ui/icons/Schedule';
import RoomIcon from '@material-ui/icons/Room';
import ShoppingBasketIcon from '@material-ui/icons/ShoppingBasket';
import { MAP_KEY } from '../utils/config'
import GoogleMapReact from 'google-map-react';
import './components/Map.css';

const Marker = (props) => {
    return (
        <div className={"marker"} >
           
        </div>
     );
}

const DeliveryDetails = (props) => {
    const [loading, setLoading] = useState(false);
    const [delivery, setDelivery] = useState(null);
    useEffect(() => {
        async function initialize() {
            setLoading(true);
            try {
                await getDeliveryDetails()
            } catch (error) {
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

    const getDeliveryDetails = () => {
        let api = new API();
        return new Promise((resolve, reject) => {
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/delivery/${props.selectedDeliveryID}`)
            .then((data) => {
                if (data.delivery) {
                    setDelivery({
                        donorFirstName: data.delivery['donorFirstName'],
                        donorLastName: data.delivery['donorLastName'],
                        donorLat: Number(data.delivery['donorLat']),
                        donorLng: Number(data.delivery['donorLng']),
                        beneficiaryFirstName: data.delivery['beneficiaryFirstName'],
                        beneficiaryLastName: data.delivery['beneficiaryLastName'],
                        beneficiaryLat: Number(data.delivery['beneficiaryLat']),
                        beneficiaryLng: Number(data.delivery['beneficiaryLng']),
                        collectionDateTime: new Date(data.delivery['collectionDateTime'].replace("T", " ") + " UTC"),
                        deliveryDateTime: new Date(data.delivery['deliveryDateTime'].replace("T", " ") + " UTC"),
                        itemName: data.delivery['itemName'],
                        quantity: data.delivery['quantity'],
                        comments: data.delivery['comments'],
                        donorAccepted: data.delivery['donorAccepted'],
                        delivererAccepted: data.delivery['delivererAccepted'],
                        delivered: data.delivery['delivered'],
                        beneficiaryAccepted : delivery['beneficiaryAccepted']
                    })
                    resolve()
                } else {
                    reject("Delivery not found")
                }
            })
            .catch((error) => {
                console.log(error);
                if (error && error.data && error.data.error === "token_expired") {
                    if (localStorage.refresh_token) {
                        api
                        .refreshToken()
                        .then(() => {
                            api.setAuthorizationToken(localStorage.access_token)
                            api
                            .get(`${ENDPOINT}/delivery/${props.selectedDeliveryID}`)
                            .then((data) => {
                                if (data.delivery) {
                                    setDelivery({
                                        donorFirstName: data.delivery['donorFirstName'],
                                        donorLastName: data.delivery['donorLastName'],
                                        donorLat: Number(data.delivery['donorLat']),
                                        donorLng: Number(data.delivery['donorLng']),
                                        beneficiaryFirstName: data.delivery['beneficiaryFirstName'],
                                        beneficiaryLastName: data.delivery['beneficiaryLastName'],
                                        beneficiaryLat: Number(data.delivery['beneficiaryLat']),
                                        beneficiaryLng: Number(data.delivery['beneficiaryLng']),
                                        collectionDateTime: new Date(data.delivery['collectionDateTime'].replace("T", " ") + " UTC"),
                                        deliveryDateTime: new Date(data.delivery['deliveryDateTime'].replace("T", " ") + " UTC"),
                                        itemName: data.delivery['itemName'],
                                        quantity: data.delivery['quantity'],
                                        comments: data.delivery['comments'],
                                        donorAccepted: data.delivery['donorAccepted'],
                                        delivererAccepted: data.delivery['delivererAccepted'],
                                        delivered: data.delivery['delivered'],
                                        beneficiaryAccepted : delivery['beneficiaryAccepted']
                                    })
                                    resolve()
                                } else {
                                    reject("Delivery not found")
                                }
                            })
                            .catch((error) => {
                                reject(error);
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
                        {delivery && <Button variant="contained" color="secondary" disabled={delivery.delivererAccepted ? true : false}>Reject</Button>}
                        <span style={{paddingLeft: '10px'}}></span>
                        {
                            delivery && ((delivery.delivererAccepted) ? (
                                    (delivery.donorAccepted && delivery.beneficiaryAccepted) ? (
                                        <Button variant="contained" color="primary" disabled={delivery.delivered ? true : false}>Confirm</Button>
                                    ) : (
                                        <Button variant="contained" disabled>Pending</Button>
                                    )
                            ) : (
                                <Button variant="contained" color="primary">Accept</Button>
                            ))
                        }
                    </Grid>
                </Grid>
                <div style={{marginTop: "15px"}}></div>
                <div style={{borderWidth: '1px', borderColor: COLORS.GREY, borderStyle: 'solid'}}>
                    <Grid style={{minHeight: '250px'}} container>
                        <Grid style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} item xs={0} sm={0} md={2} lg={2}>
                            <PersonIcon style={{fontSize: '150px'}} />
                        </Grid>
                        <Grid style={{borderLeftWidth: '1px', borderLeftColor: COLORS.GREY, borderLeftStyle: 'solid'}} item xs={12} sm={12} md={10} lg={10}>
                            <div style={{height: '40px', backgroundColor: COLORS.GREEN}}><h1 style={{color: COLORS.WHITE}}>Donor</h1></div>
                            <div style={{height: '85px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>{delivery && <span style={{fontSize: '40px'}}>{delivery.donorFirstName} {delivery.donorLastName}</span>}</div>
                            <div style={{height: '40px', backgroundColor: COLORS.GREEN}}><h1 style={{color: COLORS.WHITE}}>Beneficiary</h1></div>
                            <div style={{height: '85px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>{delivery && <span style={{fontSize : '40px'}}>{delivery.beneficiaryFirstName} {delivery.beneficiaryLastName}</span>}</div>
                        </Grid>
                    </Grid>
                </div>
                <div style={{marginTop: "15px"}}></div>
                <div style={{borderWidth: '1px', borderColor: COLORS.GREY, borderStyle: 'solid'}}>
                    <Grid style={{minHeight: '250px'}} container>
                        <Grid style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} item xs={0} sm={0} md={2} lg={2}>
                            <ScheduleIcon style={{fontSize: '150px'}} />
                        </Grid>
                        <Grid style={{borderLeftWidth: '1px', borderLeftColor: COLORS.GREY, borderLeftStyle: 'solid'}} item xs={12} sm={12} md={10} lg={10}>
                            <div style={{height: '40px', backgroundColor: COLORS.GREEN}}><h1 style={{color: COLORS.WHITE}}>Collection</h1></div>
                            <div style={{height: '85px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>{delivery && <span style={{fontSize: '40px'}}>{delivery.collectionDateTime.toDateString()} {delivery.collectionDateTime.toLocaleTimeString()}</span>}</div>
                            <div style={{height: '40px', backgroundColor: COLORS.GREEN}}><h1 style={{color: COLORS.WHITE}}>Delivery</h1></div>
                            <div style={{height: '85px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>{delivery && <span style={{fontSize: '40px'}}>{delivery.deliveryDateTime.toDateString()} {delivery.deliveryDateTime.toLocaleTimeString()}</span>}</div>
                        </Grid>
                    </Grid>
                </div>
                <div style={{marginTop: "15px"}}></div>
                <div style={{borderWidth: '1px', borderColor: COLORS.GREY, borderStyle: 'solid'}}>
                    <Grid style={{minHeight: '250px'}} container>
                        <Grid style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} item xs={0} sm={0} md={2} lg={2}>
                            <ShoppingBasketIcon style={{fontSize: '150px'}} />
                        </Grid>
                        <Grid style={{borderLeftWidth: '1px', borderLeftColor: COLORS.GREY, borderLeftStyle: 'solid'}} item xs={12} sm={12} md={10} lg={10}>
                            <div style={{height: '40px', backgroundColor: COLORS.GREEN}}><h1 style={{color: COLORS.WHITE}}>Item</h1></div>
                            <div style={{height: '85px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>{delivery && <span style={{fontSize: '40px'}}>{delivery.itemName}</span>}</div>
                            <div style={{height: '40px', backgroundColor: COLORS.GREEN}}><h1 style={{color: COLORS.WHITE}}>Quantity</h1></div>
                            <div style={{height: '85px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>{delivery && <span style={{fontSize: '40px'}}>{delivery.quantity}</span>}</div>
                        </Grid>
                    </Grid>
                </div>
                <div style={{marginTop: "15px"}}></div>
                <div style={{borderWidth: '1px', borderColor: COLORS.GREY, borderStyle: 'solid'}}>
                    <Grid style={{minHeight: '250px'}} container>
                        <Grid style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} item xs={0} sm={0} md={2} lg={2}>
                            <RoomIcon style={{fontSize: '150px'}} />
                        </Grid>
                        <Grid style={{borderLeftWidth: '1px', borderLeftColor: COLORS.GREY, borderLeftStyle: 'solid'}} item xs={12} sm={12} md={10} lg={10}>
                            <Grid style={{height: '100%'}} container>
                                <Grid style={{borderRightWidth: '1px', borderRightColor: COLORS.GREY, borderRightStyle: 'solid'}} item xs={6} sm={6} md={6} lg={6}>
                                    <div style={{height: '40px', backgroundColor: COLORS.GREEN}}><h1 style={{color: COLORS.WHITE}}>From</h1></div>
                                    <div style={{ height: '210px', width: '100%' }}>
                                        {
                                            delivery && (
                                                <GoogleMapReact
                                                bootstrapURLKeys={{ key: MAP_KEY }}
                                                defaultCenter={{lat: delivery.donorLat, lng: delivery.donorLng}}
                                                defaultZoom={17}
                                                >
                                                    <Marker 
                                                        lat={delivery.donorLat}
                                                        lng={delivery.donorLng}
                                                    />
                                                </GoogleMapReact>
                                            )
                                        }
                                    </div>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6} lg={6}>
                                    <div style={{height: '40px', backgroundColor: COLORS.GREEN}}><h1 style={{color: COLORS.WHITE}}>To</h1></div>
                                    <div style={{ height: '210px', width: '100%' }}>
                                        {
                                            delivery && (
                                                <GoogleMapReact
                                                bootstrapURLKeys={{ key: MAP_KEY }}
                                                defaultCenter={{lat: delivery.beneficiaryLat, lng: delivery.beneficiaryLng}}
                                                defaultZoom={17}
                                                >
                                                    <Marker 
                                                        lat={delivery.beneficiaryLat}
                                                        lng={delivery.beneficiaryLng}
                                                    />
                                                </GoogleMapReact>
                                            )
                                        }
                                    </div>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
                <div style={{marginTop: "15px"}}></div>
                <div style={{minHeight: '250px', borderWidth: '1px', borderColor: COLORS.GREY, borderStyle: 'solid'}}>
                    <div style={{height: '40px', backgroundColor: COLORS.GREEN}}><h1 style={{color: COLORS.WHITE}}>Comments</h1></div>
                    <div>{delivery && <h4>{delivery.comments}</h4>}</div>
                </div>
            </div>
        )
    }
}

export default observer(DeliveryDetails);