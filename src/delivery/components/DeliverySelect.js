import React, { useState, useEffect } from 'react';
import { userStore } from "../../index";
import { observer } from "mobx-react"
import { COLORS, ENDPOINT } from '../../utils/config'
import API from "../../utils/API"
import { makeStyles } from '@material-ui/core/styles';
import { 
    Typography,
    FormControl,
    Select,
    Button,
    Paper,
    Divider,
    CircularProgress
} from "@material-ui/core";
import 'antd/dist/antd.css';
import { InputNumber } from 'antd';

const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }));

const DeliverySelect = (props) => {
    const classes = useStyles();
    const [categoryMap, setCategoryMap] = useState(new Map());
    useEffect(() => {
        async function initialize() {
            try {
                await getDonatedItems()
                await getRequestedItems()
                getTimes()
            } catch (error) {
                if (error && error.data && error.data.message) {
                    props.setError(error.data.message)
                } else {
                    props.setError("An error occurred")
                }
            }
        }
        initialize()
    }, []);
    const getRequestedItems = () => {
        let api = new API();
        return new Promise((resolve, reject) => {
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/request/${props.beneficiaryID}`)
            .then((data) => {
                let requestedItemsData = []
                let categoryTypeIDs = new Set()
                for (const request of data.requests) {
                    var tempObj = {'id' : request["id"], 'categoryTypeID' : request['categoryTypeID'], 'quantity' : request['quantity']}
                    requestedItemsData.push(tempObj)
                    setRequestedItemsMap(new Map(requestedItemsMap.set(request['id'].toString(), tempObj)))
                    if (!categoryMap.has(request.categoryTypeID)) {
                        categoryTypeIDs.add(request.categoryTypeID)
                    }
                }
                if (categoryTypeIDs.size > 0){
                    api
                    .post(`${ENDPOINT}/category/information`, {
                        categoryTypeIDs : Array.from(categoryTypeIDs)
                    })
                    .then((data) => {
                        for (const categoryTypeID in data.information) {
                            var tempObj = { category : data.information[categoryTypeID].category, categoryType : data.information[categoryTypeID].categoryType }
                            setCategoryMap(new Map(categoryMap.set(categoryTypeID, tempObj)))
                        }
                        setRequestedItems(requestedItemsData);
                        resolve()
                    })
                    .catch((error) => {
                        reject(error)
                    })
                } else {
                    resolve()
                }
            })
            .catch((error) => {
                if (error && error.data && error.data.error === "token_expired") {
                    if(localStorage.refresh_token) {
                        api
                        .refreshToken()
                        .then(()=> {
                            api.setAuthorizationToken(localStorage.access_token)
                            api
                            .get(`${ENDPOINT}/request/${props.beneficiaryID}`)
                            .then((data) => {
                                let requestedItemsData = []
                                let categoryTypeIDs = new Set()
                                for (const request of data.requests) {
                                    var tempObj = {'id' : request["id"], 'categoryTypeID' : request['categoryTypeID'], 'quantity' : request['quantity']}
                                    requestedItemsData.push(tempObj)
                                    setRequestedItemsMap(new Map(requestedItemsMap.set(request['id'].toString(), tempObj)))
                                    if (!categoryMap.has(request.categoryTypeID)) {
                                        categoryTypeIDs.add(request.categoryTypeID)
                                    }
                                }
                                if (categoryTypeIDs.size > 0){
                                    api
                                    .post(`${ENDPOINT}/category/information`, {
                                        categoryTypeIDs : Array.from(categoryTypeIDs)
                                    })
                                    .then((data) => {
                                        for (const categoryTypeID in data.information) {
                                            var tempObj = { category : data.information[categoryTypeID].category, categoryType : data.information[categoryTypeID].categoryType }
                                            setCategoryMap(new Map(categoryMap.set(categoryTypeID, tempObj)))
                                        }
                                        setRequestedItems(requestedItemsData);
                                        resolve()
                                    })
                                    .catch((error) => {
                                        reject(error)
                                    })
                                } else {
                                    resolve()
                                }
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
    const getDonatedItems = () => {
        let api = new API();
        return new Promise((resolve, reject) => {
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/item/${props.donorID}`)
            .then((data) => {
                let donatedItemsData = []
                let categoryTypeIDs = new Set()
                for (const item of data.items) {
                    var tempObj = {'id' : item["id"], 'categoryTypeID' : item["categoryTypeID"], 'quantity' : item['quantity'], 'expiryDate' : item['expiryDate']}
                    donatedItemsData.push(tempObj)
                    setDonatedItemsMap(new Map(donatedItemsMap.set(item['id'].toString(), tempObj)))
                    if (!categoryMap.has(item.categoryTypeID)) {
                        categoryTypeIDs.add(item.categoryTypeID)
                    }
                }
                if (categoryTypeIDs.size > 0){
                    api
                    .post(`${ENDPOINT}/category/information`, {
                        categoryTypeIDs : Array.from(categoryTypeIDs)
                    })
                    .then((data) => {
                        for (const categoryTypeID in data.information) {
                            var tempObj = { category : data.information[categoryTypeID].category, categoryType : data.information[categoryTypeID].categoryType }
                            setCategoryMap(new Map(categoryMap.set(categoryTypeID, tempObj)))
                        }
                        setDonatedItems(donatedItemsData)
                        resolve()
                    })
                    .catch((error) => {
                        reject(error)
                    })
                } else {
                    resolve()
                }
            })
            .catch((error) => {
                if (error && error.data && error.data.error === "token_expired") {
                    if(localStorage.refresh_token) {
                        api
                        .refreshToken()
                        .then(() => {
                            api.setAuthorizationToken(localStorage.access_token)
                            api
                            .get(`${ENDPOINT}/item/${props.donorID}`)
                            .then((data) => {
                                let donatedItemsData = []
                                let categoryTypeIDs = new Set()
                                for (const item of data.items) {
                                    var tempObj = {'id' : item["id"], 'categoryTypeID' : item["categoryTypeID"], 'quantity' : item['quantity'], 'expiryDate' : item['expiryDate']}
                                    donatedItemsData.push(tempObj)
                                    setDonatedItemsMap(new Map(donatedItemsMap.set(item['id'].toString(), tempObj)))
                                    if (!categoryMap.has(item.categoryTypeID)) {
                                        categoryTypeIDs.add(item.categoryTypeID)
                                    }
                                }
                                if (categoryTypeIDs.size > 0){
                                    api
                                    .post(`${ENDPOINT}/category/information`, {
                                        categoryTypeIDs : Array.from(categoryTypeIDs)
                                    })
                                    .then((data) => {
                                        for (const categoryTypeID in data.information) {
                                            var tempObj = { category : data.information[categoryTypeID].category, categoryType : data.information[categoryTypeID].categoryType }
                                            setCategoryMap(new Map(categoryMap.set(categoryTypeID, tempObj)))
                                        }
                                        setDonatedItems(donatedItemsData)
                                        resolve()
                                    })
                                    .catch((error) => {
                                        reject(error)
                                    })
                                } else {
                                    resolve()
                                }
                            })
                            .catch((error) => {
                                reject(error)
                            })
                        })
                        .catch((error) => {
                            reject(error)
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
                    reject(error)
                }
            })
        })
    }
    const getTimes = async () => {
        setLoading(true);
        let api = new API();
        api.setAuthorizationToken(localStorage.access_token)
        var startDateTime = new Date(props.selectedDate.getFullYear(), props.selectedDate.getMonth(), props.selectedDate.getDate(), 0, 0, 0, 0)
        var endDateTime = new Date(props.selectedDate.getFullYear(), props.selectedDate.getMonth(), props.selectedDate.getDate(), 23, 59, 59, 99)
        await new Promise((resolve, reject) => {
            api
            .post(`${ENDPOINT}/availability/user`, {
                startDateTime,
                endDateTime,
                userID: props.donorID
            })
            .then((data) => {
                let collectionTimes = []
                data.availabilities.forEach((a) => {
                    for (var d = new Date(a.startDateTime.replace("T", " ") + " UTC"); d <= new Date(a.endDateTime.replace("T", " ") + " UTC"); d.setTime(d.getTime() + 60*60*1000)) {
                        collectionTimes.push(new Date(d))
                    }
                })
                setCollectionTimes(collectionTimes)
                api
                .post(`${ENDPOINT}/availability/user`, {
                    startDateTime,
                    endDateTime,
                    userID: props.beneficiaryID
                })
                .then((data) => {
                    let deliveryTimes = []
                    data.availabilities.forEach((a) => {
                        for (var d = new Date(a.startDateTime.replace("T", " ") + " UTC"); d <= new Date(a.endDateTime.replace("T", " ") + " UTC"); d.setTime(d.getTime() + 60*60*1000)) {
                            deliveryTimes.push(new Date(d))
                        }
                    })
                    setDeliveryTimes(deliveryTimes)
                    resolve()
                })
                .catch((error) => {
                    reject(error);
                })
            })
            .catch((error) => {
                if (error && error.data && error.data.error === "token_expired") {
                    if(localStorage.refresh_token) {
                        api
                        .refreshToken()
                        .then(() => {
                            api.setAuthorizationToken(localStorage.access_token)
                            api
                            .post(`${ENDPOINT}/availability/user`, {
                                startDateTime,
                                endDateTime,
                                userID: props.donorID
                            })
                            .then((data) => {
                                let collectionTimes = []
                                data.availabilities.forEach((a) => {
                                    for (var d = new Date(a.startDateTime.replace("T", " ") + " UTC"); d <= new Date(a.endDateTime.replace("T", " ") + " UTC"); d.setTime(d.getTime() + 60*60*1000)) {
                                        collectionTimes.push(new Date(d))
                                    }
                                })
                                setCollectionTimes(collectionTimes)
                                api
                                .post(`${ENDPOINT}/availability/user`, {
                                    startDateTime,
                                    endDateTime,
                                    userID: props.beneficiaryID
                                })
                                .then((data) => {
                                    let deliveryTimes = []
                                    data.availabilities.forEach((a) => {
                                        for (var d = new Date(a.startDateTime.replace("T", " ") + " UTC"); d <= new Date(a.endDateTime.replace("T", " ") + " UTC"); d.setTime(d.getTime() + 60*60*1000)) {
                                            deliveryTimes.push(new Date(d))
                                        }
                                    })
                                    setDeliveryTimes(deliveryTimes)
                                    resolve()
                                })
                                .catch((error) => {
                                    reject(error);
                                })
                            })
                            .catch((error) => {
                                reject(error);
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
        setLoading(false);
    }
    const [requestedItems, setRequestedItems] = useState([]);
    const [requestedItemsMap, setRequestedItemsMap] = useState(new Map());
    const [donatedItems, setDonatedItems] = useState([]);
    const [donatedItemsMap, setDonatedItemsMap] = useState(new Map());
    const [collectionTimes, setCollectionTimes] = useState([])
    const [deliveryTimes, setDeliveryTimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const handleConfirm = () => {
        setErrorMessage("");
        if (String(requestedItemsMap.get(props.requestedItemID).categoryTypeID) !== String(donatedItemsMap.get(props.donatedItemID).categoryTypeID)) {
            setErrorMessage("Requested item selected not the same as the donated item selected")
        } else if (props.deliveryTime <= props.collectionTime) {
            setErrorMessage("Delivery time should be later than the collection time")
        } else if (props.quantity === 0) {
            setErrorMessage("Please set a quantity")
        } else if (props.quantity > requestedItemsMap.get(props.requestedItemID).quantity) {
            setErrorMessage("Quantity selected is more than requested")
        } else if (props.quantity > donatedItemsMap.get(props.donatedItemID).quantity) {
            setErrorMessage("Quantity selected is more than donated")            
        } else {
            props.setItem(categoryMap.get(String(donatedItemsMap.get(props.donatedItemID).categoryTypeID)).categoryType)
            props.handleClose()
        }
    }
    if (loading) {
        return(
            <div style={{height: "100%", backgroundColor: COLORS.WHITE}}>
                <div style={{width: "100%", height: "auto", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <CircularProgress size={50} />
                </div>
            </div>
        )
    } else {
        return (
            <div style={{height: "100%", backgroundColor: COLORS.WHITE}}>
                <div style={{width: '100%', padding: '15px 15px'}}>
                    <Paper style={{paddingTop: '5px', paddingBottom: '15px'}} elevation={3}>
                        <div style={{margin: '15px 15px'}}>
                            <Typography variant="h4" style={{color: COLORS.BLUE}}>
                                Donor
                            </Typography>
                            <h3>Select Donated Item</h3>
                            <FormControl variant="outlined" className={classes.formControl}>
                                <Select
                                native
                                value={props.donatedItemID}
                                onChange={(e) => {props.setDonatedItemID(e.target.value)}}
                                >
                                <option aria-label="None" value="" />
                                {
                                    donatedItems.map((donatedItem) => (<option key={donatedItem.id} value={donatedItem.id}>{`${categoryMap.get(String(donatedItem.categoryTypeID)).categoryType} (${donatedItem.quantity} remaining)`}</option>))
                                }
                                </Select>
                            </FormControl>
                            <h3>Select Collection Time</h3>
                            <FormControl variant="outlined" className={classes.formControl}>
                                <Select
                                native
                                value={props.collectionTime}
                                onChange={(e) => {props.setCollectionTime(e.target.value)}}
                                >
                                <option aria-label="None" value="" />
                                {
                                    collectionTimes.map((collectionTime) => (<option key={collectionTime.getTime()} value={collectionTime}>{`${collectionTime.getHours()}:00`}</option>))
                                }
                                </Select>
                            </FormControl>
                        </div>
                        <Divider />
                        <div style={{margin: '15px 15px'}}>
                            <Typography variant="h4" style={{color: COLORS.BLUE}}>
                                Beneficiary
                            </Typography>
                            <h3>Select Requested Item</h3>
                            <FormControl variant="outlined" className={classes.formControl}>
                                <Select
                                native
                                value={props.requestedItemID}
                                onChange={(e) => {props.setRequestedItemID(e.target.value)}}
                                >
                                <option aria-label="None" value="" />
                                {
                                    requestedItems.map((requestedItem) => (<option key={requestedItem.id} value={requestedItem.id}>{`${categoryMap.get(String(requestedItem.categoryTypeID)).categoryType} (${requestedItem.quantity} requested)`}</option>))
                                }
                                </Select>
                            </FormControl>
                            <h3>Select Delivery Time</h3>
                            <FormControl variant="outlined" className={classes.formControl}>
                                <Select
                                native
                                value={props.deliveryTime}
                                onChange={(e) => {props.setDeliveryTime(e.target.value)}}
                                >
                                <option aria-label="None" value="" />
                                {
                                    deliveryTimes.map((deliveryTime) => (<option key={deliveryTime.getTime()} value={deliveryTime}>{`${deliveryTime.getHours()}:00`}</option>))
                                }
                                </Select>
                            </FormControl>
                        </div>
                        <Divider />
                        <div style={{margin: '15px 15px'}}>
                            <h3>Select Quantity</h3>
                            <InputNumber min={0} value={props.quantity} onChange={(value) => {props.setQuantity(value)}} />
                        </div>
                        { errorMessage && <h3 style={{color: "red"}}>{errorMessage}</h3>}
                        <div style={{display:  'flex', justifyContent: 'center'}}>
                            <Button variant="contained" color="primary" onClick={handleConfirm}>Confirm</Button>
                        </div>
                    </Paper>
                </div>
            </div>
        )
    }
}

export default observer(DeliverySelect);