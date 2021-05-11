import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react"
import {
    Typography,
    Fab,
    CircularProgress,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Dialog,
    DialogTitle
} from "@material-ui/core";
import { makeStyles, createStyles } from '@material-ui/core/styles';
import ControlPointIcon from '@material-ui/icons/ControlPoint';
import { ENDPOINT, COLORS } from "../utils/config"
import API from "../utils/API"
import PinInput from "react-pin-input";

const useStyles = makeStyles((theme) =>
  createStyles({
    table: {
        minWidth: 650,
      },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    paper: {
        position: 'absolute',
        width: "80%",
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
      },
      extendedIcon: {
        marginRight: theme.spacing(1),
      },
  }),
);

const DeliveryLanding = (props) => {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [deliveries, setDeliveries] = useState([]);

    useEffect(() => {
        async function initialize() {
            setLoading(true);
            try {
                await getDeliveries()
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

    const getDeliveries = () => {
        let api = new API();
        return new Promise((resolve, reject) => {
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/delivery`)
            .then((data) => {
                var deliveriesData = []
                data.deliveries.forEach((delivery) => {
                    deliveriesData.push({
                        id : delivery['id'],
                        requestID : delivery['requestID'],
                        delivererID : delivery['delivererID'],
                        itemID: delivery['itemID'],
                        dateTime: new Date(delivery['dateTime'].replace("T", " ") + " UTC"),
                        quantity: delivery['quantity'],
                        donorAccepted: delivery['donorAccepted'],
                        delivererAccepted: delivery['delivererAccepted'],
                        beneficiaryAccepted : delivery['beneficiaryAccepted'],
                        delivered: delivery['delivered'],
                        collectionDateTime: new Date(delivery['collectionDateTime'].replace("T", " ") + " UTC"),
                        deliveryDateTime: new Date(delivery['deliveryDateTime'].replace("T", " ") + " UTC"),
                        itemName: delivery['itemName'],
                        collectionAddressLine1: delivery['collectionAddressLine1'],
                        collectionAddressLine2: delivery['collectionAddressLine2'],
                        collectionAddressPostalCode: delivery['collectionAddressPostalCode'],
                        deliveryAddressLine1: delivery['deliveryAddressLine1'],
                        deliveryAddressLine2: delivery['deliveryAddressLine2'],
                        deliveryAddressPostalCode: delivery['deliveryAddressPostalCode']
                    })
                })
                setDeliveries(deliveriesData)
                resolve()
            })
            .catch((error) => {
                if (error && error.data && error.data.error === "token_expired") {
                    if (localStorage.refresh_token) {
                        api
                        .refreshToken()
                        .then(() => {
                            api.setAuthorizationToken(localStorage.access_token)
                            api
                            .get(`${ENDPOINT}/delivery`)
                            .then((data) => {
                                var deliveriesData = []
                                data.deliveries.forEach((delivery) => {
                                    deliveriesData.push({
                                        id : delivery['id'],
                                        requestID : delivery['requestID'],
                                        delivererID : delivery['delivererID'],
                                        itemID: delivery['itemID'],
                                        dateTime: new Date(delivery['dateTime'].replace("T", " ") + " UTC"),
                                        quantity: delivery['quantity'],
                                        donorAccepted: delivery['donorAccepted'],
                                        delivererAccepted: delivery['delivererAccepted'],
                                        beneficiaryAccepted : delivery['beneficiaryAccepted'],
                                        delivered: delivery['delivered'],
                                        collectionDateTime: new Date(delivery['collectionDateTime'].replace("T", " ") + " UTC"),
                                        deliveryDateTime: new Date(delivery['deliveryDateTime'].replace("T", " ") + " UTC"),
                                        itemName: delivery['itemName'],
                                        collectionAddressLine1: delivery['collectionAddressLine1'],
                                        collectionAddressLine2: delivery['collectionAddressLine2'],
                                        collectionAddressPostalCode: delivery['collectionAddressPostalCode'],
                                        deliveryAddressLine1: delivery['deliveryAddressLine1'],
                                        deliveryAddressLine2: delivery['deliveryAddressLine2'],
                                        deliveryAddressPostalCode: delivery['deliveryAddressPostalCode']
                                    })
                                })
                                setDeliveries(deliveriesData)
                                resolve()
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

    const handleDeliveryDetails = (id) => {
        props.setSelectedDeliveryID(id)
        props.goToDeliveryDetails()
    }
    
    const handleDelete = (id) => {
        let api = new API();
        setLoading(true);
        api.setAuthorizationToken(localStorage.access_token)
        api
        .delete(`${ENDPOINT}/delivery`, {
            deliveryID: id
        })
        .then(async () => {
            try {
                await getDeliveries()
            } catch (error) {
                if (error && error.data && error.data.message) {
                    props.setError(error.data.message)
                } else {
                    props.setError("An error occurred")
                }
            }
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
                        .delete(`${ENDPOINT}/delivery`, {
                            deliveryID: id
                        })
                        .then(async () => {
                            try {
                                await getDeliveries()
                            } catch (error) {
                                if (error && error.data && error.data.message) {
                                    props.setError(error.data.message)
                                } else {
                                    props.setError("An error occurred")
                                }
                            }
                            setLoading(false);
                        })
                        .catch((error) => {
                            if (error && error.data && error.data.message) {
                                props.setError(error.data.message)
                                setLoading(false);
                            } else {
                                props.setError("An error occurred")
                                setLoading(false);
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
            } else if (error && error.data && error.data.message) {
                props.setError(error.data.message)
                setLoading(false);
            } else {
                props.setError("An error occurred")
                setLoading(false);
            }
        })
    }

    const handleAccept = (id) => {
        let api = new API();
        setLoading(true);
        api.setAuthorizationToken(localStorage.access_token)
        api
        .put(`${ENDPOINT}/delivery`, {
            delivererAccepted: true,
            deliveryID : id
        })
        .then(async () => {
            try {
                await getDeliveries()
            } catch (error) {
                if (error && error.data && error.data.message) {
                    props.setError(error.data.message)
                } else {
                    props.setError("An error occurred")
                }
            }
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
                        .put(`${ENDPOINT}/delivery`, {
                            delivererAccepted: true
                        })
                        .then(async () => {
                            try {
                                await getDeliveries()
                            } catch (error) {
                                if (error && error.data && error.data.message) {
                                    props.setError(error.data.message)
                                } else {
                                    props.setError("An error occurred")
                                }
                            }
                            setLoading(false);
                        })
                        .catch((error) => {
                            if (error && error.data && error.data.message) {
                                props.setError(error.data.message)
                                setLoading(false);
                            } else {
                                props.setError("An error occurred")
                                setLoading(false);
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
            } else if (error && error.data && error.data.message) {
                props.setError(error.data.message)
                setLoading(false);
            } else {
                props.setError("An error occurred")
                setLoading(false);
            }
        })
    }

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmDeliveryID, setConfirmDeliveryID] = useState('');
    const handleConfirm = (id) => {
        setConfirmDeliveryID(id);
        setConfirmOpen(true);
    }
    const [pin, setPin] = useState('');
    const confirm = () => {
        let api = new API();
        setLoading(true);
        api.setAuthorizationToken(localStorage.access_token)
        api
        .post(`${ENDPOINT}/delivery/${confirmDeliveryID}`, {
            confirmationCode : pin
        })
        .then(async () => {
            try {
                await getDeliveries()
            } catch (error) {
                if (error && error.data && error.data.message) {
                    props.setError(error.data.message)
                } else {
                    props.setError("An error occurred")
                }
            }
            setConfirmDeliveryID('');
            setPin('')
            setConfirmOpen(false);
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
                        .post(`${ENDPOINT}/delivery/${confirmDeliveryID}`, {
                            confirmationCode : pin
                        })
                        .then(async () => {
                            try {
                                await getDeliveries()
                            } catch (error) {
                                if (error && error.data && error.data.message) {
                                    props.setError(error.data.message)
                                } else {
                                    props.setError("An error occurred")
                                }
                            }
                            setConfirmDeliveryID('');
                            setPin('')
                            setConfirmOpen(false);
                            setLoading(false);
                        })
                        .catch((error) => {
                            if (error && error.data && error.data.message) {
                                props.setError(error.data.message)
                                setLoading(false);
                            } else {
                                props.setError("An error occurred")
                                setLoading(false);
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
            } else if (error && error.data && error.data.message) {
                props.setError(error.data.message)
                setLoading(false);
            } else {
                props.setError("An error occurred")
                setLoading(false);
            }
        })
    }

    if (loading) {
        return (
            <div style={{width: "100%", height: "80%", display: "flex", justifyContent: "center", alignItems: "center"}}>
                <CircularProgress size={100} />
            </div>
        )
    } else {
        return (
            <div style={{justifyContent: "center", display: "flex", flexDirection: "column", padding: "30px 30px"}}>
                <div style={{marginTop: "15px"}}></div>
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <Typography variant="h3" style={{color: COLORS.BLUE}}>
                        Suggested Deliveries
                    </Typography>
                    <div></div>
                </div>
                <div style={{marginTop: "15px"}}></div>
                <TableContainer component={Paper}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">
                                    <h3><b>Collection Address</b></h3>
                                </TableCell>
                                <TableCell align="center">
                                    <h3><b>Delivery Address</b></h3>
                                </TableCell>
                                <TableCell align="center">
                                    <h3><b>Collection Date and Time</b></h3>
                                </TableCell>
                                <TableCell align="center">
                                    <h3><b>Delivery Date and Time</b></h3>
                                </TableCell>
                                <TableCell align="center">
                                    <h3><b>Action</b></h3>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell align="center">
                                    <div>34 Choa Chu Kang Street 2</div>
                                    <div>#03-02</div>
                                    <div>Singapore 876523</div>
                                </TableCell>
                                <TableCell align="center">
                                    <div>369 Bukit Batok Street 31</div>
                                    <div>#07-11</div>
                                    <div>Singapore 653872</div>
                                </TableCell>
                                <TableCell align="center">
                                    <div>4/23/2021</div>
                                    <div>3:00:00 PM</div>
                                </TableCell>
                                <TableCell align="center">
                                    <div>4/23/2021</div>
                                    <div>5:00:00 PM</div>
                                </TableCell>
                                <TableCell align="center">
                                    <Button variant="contained" color="primary" >Accept</Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                <div style={{marginTop: "15px"}}></div>
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <Typography variant="h3" style={{color: COLORS.BLUE}}>
                        Deliveries
                    </Typography>
                    <Fab onClick={props.goToNewDelivery} variant="extended">
                        <ControlPointIcon className={classes.extendedIcon} />
                        New Delivery
                    </Fab>
                </div>
                <Dialog onClose={() => {setConfirmOpen(false)}} open={confirmOpen}>
                    <div style={{padding: "20px"}}>
                        <div style={{display: "flex", justifyContent: "center"}}>
                        <DialogTitle id="dialog-title"><b style={{color: COLORS.BLUE, fontSize: '30px'}}>Enter code:</b></DialogTitle>
                        </div>
                        <div style={{display: "flex", justifyContent: "center"}}>
                            <PinInput 
                            length={6} 
                            initialValue={pin}
                            onChange={(value, index) => {setPin(value)}} 
                            type="numeric" 
                            inputMode="number"
                            style={{padding: '10px'}}  
                            inputStyle={{borderColor: 'red'}}
                            inputFocusStyle={{borderColor: 'blue'}}
                            autoSelect={true}
                            regexCriteria={/^[ A-Za-z0-9_@./#&+-]*$/}
                            />
                        </div>
                        <div style={{display: "flex", justifyContent: "center"}}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={confirm}
                            >
                                Submit
                            </Button>
                        </div>
                    </div>
                </Dialog>
                <div style={{marginTop: "15px"}}></div>
                <TableContainer component={Paper}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">
                                    
                                </TableCell>
                                <TableCell align="center">
                                    <h3><b>Collection Address</b></h3>
                                </TableCell>
                                <TableCell align="center">
                                    <h3><b>Delivery Address</b></h3>
                                </TableCell>
                                <TableCell align="center">
                                    <h3><b>Collection Date and Time</b></h3>
                                </TableCell>
                                <TableCell align="center">
                                    <h3><b>Delivery Date and Time</b></h3>
                                </TableCell>
                                <TableCell align="center">
                                    <h3><b>Delete</b></h3>
                                </TableCell>
                                <TableCell align="center">
                                    <h3><b>Action</b></h3>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                deliveries.map((delivery) => 
                                    <TableRow key={delivery.id}>
                                        <TableCell align="center"><Button variant="outlined" onClick={() => {handleDeliveryDetails(delivery.id)}}>Details</Button></TableCell>
                                        <TableCell align="center">
                                            <div>{delivery.collectionAddressLine1}</div>
                                            <div>{delivery.collectionAddressLine2}</div>
                                            <div>Singapore {delivery.collectionAddressPostalCode}</div>
                                        </TableCell>
                                        <TableCell align="center">
                                            <div>{delivery.deliveryAddressLine1}</div>
                                            <div>{delivery.deliveryAddressLine2}</div>
                                            <div>Singapore {delivery.deliveryAddressPostalCode}</div>
                                        </TableCell>
                                        <TableCell align="center">
                                            <div>{delivery.collectionDateTime.toLocaleDateString()}</div>
                                            <div>{delivery.collectionDateTime.toLocaleTimeString()}</div>
                                        </TableCell>
                                        <TableCell align="center">
                                            <div>{delivery.deliveryDateTime.toLocaleDateString()}</div>
                                            <div>{delivery.deliveryDateTime.toLocaleTimeString()}</div>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Button onClick={() => {handleDelete(delivery.id)}} variant="contained" color="secondary" disabled={delivery.delivererAccepted ? true : false}>Delete</Button>
                                        </TableCell>
                                        <TableCell align="center">
                                            {
                                                (delivery.delivererAccepted) ? (
                                                        (delivery.donorAccepted && delivery.beneficiaryAccepted) ? (
                                                            <Button onClick={() => {handleConfirm(delivery.id)}} variant="contained" color="primary" disabled={delivery.delivered ? true : false}>Confirm</Button>
                                                        ) : (
                                                            <Button variant="contained" disabled>Pending</Button>
                                                        )
                                                ) : (
                                                    <Button onClick={() => handleAccept(delivery.id)} variant="contained" color="primary">Accept</Button>
                                                )
                                            }
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        )
    }
}

export default observer(DeliveryLanding);