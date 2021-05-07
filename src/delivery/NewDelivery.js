import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react"
import { COLORS, ENDPOINT } from '../utils/config'
import API from "../utils/API"
import { makeStyles } from '@material-ui/core/styles';
import {
    Grid,
    Typography,
    Dialog,
    Slide,
    AppBar,
    Toolbar,
    IconButton
} from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Map from "./components/Map";
import MapTable from "./components/MapTable"
import DeliverySelect from "./components/DeliverySelect";

const useStyles = makeStyles((theme) => ({
    appBar: {
      position: 'relative',
      backgroundColor: COLORS.BLUE
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
      color: COLORS.WHITE
    },
  }));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

const NewDelivery = (props) => {
    const classes = useStyles();
    const [mapState, setMapState] = useState({
        lat: 1.3656,
        lng: 103.8185,
        zoom: 11.5
    })
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [users, setUsers] = useState([]);
    useEffect(() => {
        async function initialize() {
            try {
                await getUsers()
            } catch(error) {
                if (error && error.data && error.data.message) {
                    props.setError(error.data.message)
                } else {
                    props.setError("An error occurred")
                }
            }
        }
        initialize()
    }, []);
    const getUsers = () => {
        let api = new API();
        return new Promise((resolve, reject) => {
            api.setAuthorizationToken(localStorage.access_token)
            api
            .post(`${ENDPOINT}/map/information`, {
                "startDateTime" : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0),
                "endDateTime" : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 99)
            })
            .then((data) => {
                let userData = []
                for (const userID in data.users) {
                    userData.push(data.users[userID])
                }
                setUsers(userData);
                resolve()
            })
            .catch((error) => {
                if (error && error.data && error.data.error === "token_expired") {
                    if(localStorage.refresh_token) {
                        api
                        .refreshToken()
                        .then(() => {
                            api.setAuthorizationToken(localStorage.access_token)
                            api
                            .post(`${ENDPOINT}/map/information`, {
                                "startDateTime" : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0),
                                "endDateTime" : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59, 99)
                            })
                            .then((data) => {
                                let userData = []
                                for (const userID in data.users) {
                                    userData.append(data.users[userID])
                                }
                                setUsers(userData);
                                resolve()
                            })
                            .catch((error) => {
                                reject(error)
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
                } else {
                    reject(error);
                }
            })
        })
    }
    const handleDateChange = (date) => {
        setSelectedDate(date)
    };
    useEffect(() => {
        try {
            getUsers()
        } catch(error) {
            if (error && error.data && error.data.message) {
                props.setError(error.data.message)
            } else {
                props.setError("An error occurred")
            }
        }
    }, [selectedDate]);
    const onMapChange = (e) => {
        setMapState({lat: e.center.lat, lng: e.center.lng, zoom: e.zoom})
    }
    const [hoverMarkerID, setHoverMarkerID] = useState(-1);
    const [selectedListItemID, setSelectedListItemID] = React.useState(-1);
    const [idSelected, setIDSelected] = useState(-1);
    const [hoverListItemID, setHoverListItemID] = useState(-1);
    const handleMarkerClick = (id) => {
        setSelectedListItemID(id);
        setIDSelected(id)
    }
    const handleMarkerHoverOver = (id) => {
        setHoverListItemID(id)
    }
    const handleMarkerHoverLeave = () => {
        if (idSelected === -1) {
            setHoverListItemID(-1)
        } else {
            setHoverListItemID(idSelected);
        }
    }
    const handleListItemClick = (id) => {
        setSelectedListItemID(id);
        setIDSelected(id)
        setHoverListItemID(id)
    };
    const handleListHoverOver = (id) => {
        setHoverMarkerID(id)
    }
    const handleListHoverLeave = () => {
        if (idSelected === -1) {
            setHoverMarkerID(-1);
        } else {
            setHoverMarkerID(idSelected)
        }
    }
    const [donor, setDonor] = useState({
        id: null,
        address: null
    })
    const [beneficiary, setBeneficiary] = useState({
        id: null,
        address: null
    })
    const handleSelectDonor = (id) => {
        if (beneficiary.id === id) {
            props.setError("Cannot select the same donor and beneficiary")
        } else {
            let donorID = id
            let donorAddress = ''
            users.forEach((user) => {
                if (user.user.id === id) {
                    donorAddress = user.user.addressLine1
                } 
            })
            setDonor({id: donorID, address: donorAddress})
        }
    }
    const handleSelectBeneficiary = (id) => {
        if (donor.id === id) {
            props.setError("Cannot select the same donor and beneficiary")
        } else {
            let beneficiaryID = id
            let beneficiaryAddress = ''
            users.forEach((user) => {
                if (user.user.id === id) {
                    beneficiaryAddress = user.user.addressLine1
                } 
            })
            setBeneficiary({id: beneficiaryID, address: beneficiaryAddress})
        }
    }
    const [open, setOpen] = useState(false);
    const handleClose = async () => {
        setOpen(false)
    }
    const [collectionTime, setCollectionTime] = useState("");
    const [deliveryTime, setDeliveryTime] = useState("");
    const [requestedItemID, setRequestedItemID] = useState("");
    const [donatedItemID, setDonatedItemID] = useState("");
    const [quantity, setQuantity] = useState(0)
    const [item, setItem] = useState(null);
    const handleConfirm = () => {
        let api = new API();
        api.setAuthorizationToken(localStorage.access_token)
        api
        .post(`${ENDPOINT}/delivery`, {
            'requestID' : requestedItemID,
            'delivererID' : userStore.user.id,
            'itemID' : donatedItemID,
            'quantity' : quantity,
            'collectionDateTime' : new Date(collectionTime),
            'deliveryDateTime' : new Date(deliveryTime),
            'dateTime' : new Date(),
            'itemName' : item
        })
        .then((data) => {
            props.returnToMain()
        })
        .catch((error) => {
            if (error && error.data && error.data.error === "token_expired") {
                if(localStorage.refresh_token) {
                    api
                    .refreshToken()
                    .then(() => {
                        api.setAuthorizationToken(localStorage.access_token)
                        api
                        .post(`${ENDPOINT}/delivery`, {
                            'requestID' : requestedItemID,
                            'delivererID' : userStore.user.id,
                            'itemID' : donatedItemID,
                            'quantity' : quantity,
                            'collectionDateTime' : new Date(collectionTime),
                            'deliveryDateTime' : new Date(deliveryTime),
                            'dateTime' : new Date(),
                            'itemName' : item
                        })
                        .then((data) => {
                            props.returnToMain()
                        })
                        .catch((error) => {
                            if (error && error.data && error.data.message) {
                                props.setError(error.data.message)
                            } else {
                                props.setError("An error occurred")
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
                props.setError(error.data.message)
            } else {
                props.setError("An error occurred")
            }
        })
    }
    return (
        <div style={{justifyContent: "center", display: "flex", flexDirection: "column", padding: "30px 30px"}}>
            <Grid container>
                <Grid item lg={4} md={4} sm={4} xs={4}>
                    <span style={{paddingLeft: '20px', cursor: 'pointer'}} onClick={props.returnToMain}><ArrowBackIcon style={{fontSize: '50px'}} /></span>
                </Grid>
                <Grid item lg={4} md={4} sm={4} xs={4}>
                    <Typography variant="h3" style={{color: COLORS.BLUE}}>
                        <b>New Delivery</b>
                    </Typography>
                </Grid>
                <Grid item lg={4} md={4} sm={4} xs={4}>
                    
                </Grid>
            </Grid>
            <div style={{marginTop: "10px"}} /> 
            <div style={{height: '80vh', position: 'relative', overflow: 'hidden'}}>
                <div style={{position: 'absolute', left: 0, top: 0, width: '38%', height: '100%'}}>
                    <MapTable 
                    handleListHoverOver={handleListHoverOver}
                    handleListHoverLeave={handleListHoverLeave}
                    selectedDate={selectedDate} 
                    handleDateChange={handleDateChange} 
                    users={users}
                    selectedListItemIndex={selectedListItemID}
                    handleListItemClick={handleListItemClick}
                    hoverListItemID={hoverListItemID}
                    handleSelectDonor={handleSelectDonor}
                    handleSelectBeneficiary={handleSelectBeneficiary}
                    donor={donor}
                    beneficiary={beneficiary}
                    setOpen={setOpen}
                    item={item}
                    quantity={quantity}
                    handleConfirm={handleConfirm}
                    />
                </div>
                <div style={{position: 'absolute', right: 0, top: 0, width: '62%', height: '100%'}}>
                    <Map 
                    mapState={mapState} 
                    onMapChange={onMapChange}
                    users={users}
                    hoverMarkerID={hoverMarkerID}
                    handleMarkerClick={handleMarkerClick}
                    handleMarkerHoverOver={handleMarkerHoverOver}
                    handleMarkerHoverLeave={handleMarkerHoverLeave}
                    />
                </div>
            </div>
            <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            Select Time/Item
                        </Typography>
                    </Toolbar>
                </AppBar>
                <DeliverySelect 
                setCollectionTime={setCollectionTime} 
                collectionTime={collectionTime} 
                deliveryTime={deliveryTime}
                setDeliveryTime={setDeliveryTime}
                selectedDate={selectedDate}  
                donorID={donor.id} 
                beneficiaryID={beneficiary.id} 
                requestedItemID={requestedItemID}
                setRequestedItemID={setRequestedItemID}
                donatedItemID={donatedItemID}
                setDonatedItemID={setDonatedItemID}
                quantity={quantity}
                setQuantity={setQuantity}
                setItem={setItem}
                handleClose={handleClose}
                {...props}
                />
            </Dialog>
        </div>
    )
}

export default observer(NewDelivery);