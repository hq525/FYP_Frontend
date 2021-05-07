import React, { useState, useEffect } from 'react';
import {
    CircularProgress,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableCell,
    TableBody,
    TableRow,
    Button,
    Paper,
    Dialog,
    DialogTitle,
    TextareaAutosize
} from "@material-ui/core";
import Rating from '@material-ui/lab/Rating';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react';
import { userStore } from './index';
import { ENDPOINT, COLORS } from "./utils/config";
import API from "./utils/API";
import NavBar from "./NavBar";
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

const Main = (props) => {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function initialize() {
            setLoading(true);
            try {
                await getDeliveryRequests()
            } catch(error) {
                if (error && error.data && error.data.message) {
                    props.setError(error.data.message)
                } else {
                    props.setError("An error occurred")
                }
            }
            try {
                await getDeliveries()
            } catch (error) {
                if (error && error.data && error.data.message) {
                    props.setError(error.data.message)
                } else {
                    props.setError("An error occurred")
                }
            }
            try {
                await getItems();
            } catch(error) {
                if (error && error.data && error.data.message) {
                    props.setError(error.data.message)
                } else {
                    props.setError("An error occurred")
                }
            }
            try {
                await getDonationRequests();
            } catch(error) {
                if (error && error.data && error.data.message) {
                    props.setError(error.data.message)
                } else {
                    props.setError("An error occurred")
                }
            }
            setLoading(false);
        }
        initialize();
    }, [])
    
    const [deliveryRequests, setDeliveryRequests] = useState([]);
    const getDeliveryRequests = () => {
        let api = new API();
        return new Promise((resolve, reject) => {
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/delivery/request`)
            .then((data) => {
                let deliveryRequestsData = []
                data.deliveries.forEach((delivery) => {
                    deliveryRequestsData.push({
                        id : delivery['id'],
                        donorFirstName : delivery['donorFirstName'],
                        donorLastName : delivery['donorLastName'],
                        delivererFirstName : delivery['delivererFirstName'],
                        delivererLastName : delivery['delivererLastName'],
                        delivererID : delivery['delivererID'],
                        deliveryDateTime : new Date(delivery['deliveryDateTime'].replace("T", " ") + " UTC"),
                        itemName : delivery['itemName'],
                        quantity : Number(delivery['quantity']),
                        donorAccepted : delivery['donorAccepted'],
                        delivererAccepted : delivery['delivererAccepted'],
                        delivered : delivery['delivered'],
                        beneficiaryAccepted : delivery['beneficiaryAccepted'],
                        confirmationCode : delivery['confirmationCode'],
                        ratingGiven : delivery['ratingGiven']
                    })
                })
                setDeliveryRequests(deliveryRequestsData)
                resolve()
            })
            .catch((error) => {
                if (error && error.data && error.data.error === "token_expired") {
                    if (localStorage.refreshToken) {
                        api
                        .refreshToken()
                        .then(() => {
                            api.setAuthorizationToken(localStorage.access_token)
                            api
                            .get(`${ENDPOINT}/delivery/request`)
                            .then((data) => {
                                let deliveryRequestsData = []
                                data.deliveries.forEach((delivery) => {
                                    deliveryRequestsData.push({
                                        id : delivery['id'],
                                        donorFirstName : delivery['donorFirstName'],
                                        donorLastName : delivery['donorLastName'],
                                        delivererFirstName : delivery['delivererFirstName'],
                                        delivererLastName : delivery['delivererLastName'],
                                        delivererID : delivery['delivererID'],
                                        deliveryDateTime : new Date(delivery['deliveryDateTime'].replace("T", " ") + " UTC"),
                                        itemName : delivery['itemName'],
                                        quantity : Number(delivery['quantity']),
                                        donorAccepted : delivery['donorAccepted'],
                                        delivererAccepted : delivery['delivererAccepted'],
                                        delivered : delivery['delivered'],
                                        beneficiaryAccepted : delivery['beneficiaryAccepted'],
                                        confirmationCode : delivery['confirmationCode'],
                                        ratingGiven : delivery['ratingGiven']
                                    })
                                })
                                setDeliveryRequests(deliveryRequestsData)
                                resolve()
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

    const handleRequestDelete = (id) => {
        let api = new API();
        setLoading(true);
        api.setAuthorizationToken(localStorage.access_token)
        api
        .delete(`${ENDPOINT}/delivery`, {
            deliveryID: id
        })
        .then(async () => {
            try {
                await getDeliveryRequests()
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
                                await getDeliveryRequests()
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
    const [confirmationCode, setConfirmationCode] = useState('');
    const [feedbackDeliveryID, setFeedbackDeliveryID] = useState('')
    const [feedbackDelivererID, setFeedbackDelivererID] = useState('');
    const [rating, setRating] = useState(3)
    const [feedback, setFeedback] = useState('');
    const [ratingGiven, setRatingGiven] = useState(false);
    const handleRequestConfirm = (deliveryID, delivererID, confirmationCode, ratingGiven) => {
        setConfirmOpen(true);
        setFeedbackDeliveryID(deliveryID);
        setFeedbackDelivererID(delivererID);
        setConfirmationCode(confirmationCode)
        setFeedback('');
        setRatingGiven(ratingGiven);
    }

    const handleFeedback = () => {
        let api = new API();
        setLoading(true);
        api.setAuthorizationToken(localStorage.access_token)
        api
        .post(`${ENDPOINT}/rating`, {
            rateeID : feedbackDelivererID,
            raterID : userStore.user.id,
            deliveryID : feedbackDeliveryID,
            rating : rating,
            feedback : feedback,
            date : new Date()
        })
        .then(() => {
            setConfirmOpen(false);
            setFeedbackDeliveryID('');
            setFeedbackDelivererID('');
            setConfirmationCode('')
            setFeedback('');
            setRatingGiven(false);
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
                        .post(`${ENDPOINT}/rating`, {
                            rateeID : feedbackDelivererID,
                            raterID : userStore.user.id,
                            deliveryID : feedbackDeliveryID,
                            rating : rating,
                            feedback : feedback,
                            date : new Date()
                        })
                        .then(() => {
                            setConfirmOpen(false);
                            setFeedbackDeliveryID('');
                            setFeedbackDelivererID('');
                            setConfirmationCode('')
                            setFeedback('');
                            setRatingGiven(false);
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

    const handleRequestAccept = (id) => {
        let api = new API();
        setLoading(true);
        api.setAuthorizationToken(localStorage.access_token)
        api
        .put(`${ENDPOINT}/delivery`, {
            beneficiaryAccepted: true,
            deliveryID : id
        })
        .then(async () => {
            try {
                await getDeliveryRequests()
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
                            beneficiaryAccepted: true,
                            deliveryID : id
                        })
                        .then(async () => {
                            try {
                                await getDeliveryRequests()
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

    const handleDeliveryDelete = (id) => {
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

    const handleDeliveryAccept = (id) => {
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

    const [confirmDeliveryID, setConfirmDeliveryID] = useState('');
    const handleDeliveryConfirm = (id) => {
        setConfirmDeliveryID(id);
        setDeliveryConfirmOpen(true);
    }

    const [deliveries, setDeliveries] = useState([]);
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

    const [deliveryConfirmOpen, setDeliveryConfirmOpen] = useState(false);
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
            setDeliveryConfirmOpen(false);
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
                            setDeliveryConfirmOpen(false);
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

    const [donationRequests, setDonationRequests] = useState([]);
    const getDonationRequests = () => {
        let api = new API();
        return new Promise((resolve, reject) => {
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/delivery/item`)
            .then((data) => {
                let donationRequestsData = []
                data.deliveries.forEach((delivery) => {
                    donationRequestsData.push({
                        id : delivery['id'],
                        beneficiaryFirstName : delivery['firstName'],
                        beneficiaryLastName : delivery['lastName'],
                        collectionDateTime : new Date(delivery['collectionDateTime'].replace("T", " ") + " UTC"),
                        itemName : delivery['itemName'],
                        quantity : delivery['quantity'],
                        donorAccepted : delivery['donorAccepted'],
                        delivererAccepted : delivery['delivererAccepted'],
                        beneficiaryAccepted : delivery['beneficiaryAccepted'],
                        delivered : delivery['delivered']
                    })
                })
                setDonationRequests(donationRequestsData)
                resolve()
            })
            .catch((error) => {
                if (error && error.data && error.data.error === "token_expired") {
                    if (localStorage.refreshToken) {
                        api
                        .refreshToken()
                        .then(() => {
                            api.setAuthorizationToken(localStorage.access_token)
                            api
                            .get(`${ENDPOINT}/delivery/item`)
                            .then((data) => {
                                let donationRequestsData = []
                                data.deliveries.forEach((delivery) => {
                                    donationRequestsData.push({
                                        id : delivery['id'],
                                        beneficiaryFirstName : delivery['firstName'],
                                        beneficiaryLastName : delivery['lastName'],
                                        collectionDateTime : new Date(delivery['collectionDateTime'].replace("T", " ") + " UTC"),
                                        itemName : delivery['itemName'],
                                        quantity : delivery['quantity'],
                                        donorAccepted : delivery['donorAccepted'],
                                        beneficiaryAccepted : delivery['beneficiaryAccepted'],
                                        delivererAccepted : delivery['delivererAccepted'],
                                        delivered : delivery['delivered']
                                    })
                                })
                                setDonationRequests(donationRequestsData)
                                resolve()
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
                    reject(error)
                }
            })
        })
    }
    const [items, setItems] = useState([]);
    const [categoryMap, setCategoryMap] = useState(new Map());

    const getItems = () => {
        let api = new API();
        return new Promise((resolve, reject) => {
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/item`)
            .then((data) => {
                let itemData = []
                let categoryTypeIDs = new Set()
                data.items.forEach((item) => {
                    itemData.push({id: item.id, categoryTypeID: item.categoryTypeID, description: item.description, quantity: item.quantity, expiryDate: new Date(item.expiryDate)})
                    if (!categoryMap.has(item.categoryTypeID)) {
                        categoryTypeIDs.add(item.categoryTypeID)
                    }
                })
                setItems(itemData)
                if (categoryTypeIDs.size > 0) {
                    api
                    .post(`${ENDPOINT}/category/information`, {
                        categoryTypeIDs : Array.from(categoryTypeIDs)
                    })
                    .then((data) => {
                        for (const categoryTypeID in data.information) {
                            var tempObj = { category : data.information[categoryTypeID].category, categoryType : data.information[categoryTypeID].categoryType }
                            setCategoryMap(new Map(categoryMap.set(categoryTypeID, tempObj)))
                        }
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
                    if (localStorage.refresh_token) {
                        api
                        .refreshToken()
                        .then(() => {
                            api.setAuthorizationToken(localStorage.access_token)
                            api
                            .get(`${ENDPOINT}/item`)
                            .then((data) => {
                                let itemData = []
                                let categoryTypeIDs = new Set()
                                data.items.forEach((item) => {
                                    itemData.push({id: item.id, categoryTypeID: item.categoryTypeID, description: item.description, quantity: item.quantity, expiryDate: new Date(item.expiryDate)})
                                    if (!categoryMap.has(item.categoryTypeID)) {
                                        categoryTypeIDs.add(item.categoryTypeID)
                                    }
                                })
                                setItems(itemData)
                                if (categoryTypeIDs.size > 0) {
                                    api
                                    .post(`${ENDPOINT}/category/information`, {
                                        categoryTypeIDs : Array.from(categoryTypeIDs)
                                    })
                                    .then((data) => {
                                        for (const categoryTypeID in data.information) {
                                            setCategoryMap(new Map(categoryMap.set(categoryTypeID, data.information[categoryTypeID])))
                                        }
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
                    reject(error)
                }
            })
        })
    }

    const handleDonationRequestDelete = (id) => {
        let api = new API();
        setLoading(true);
        api.setAuthorizationToken(localStorage.access_token)
        api
        .delete(`${ENDPOINT}/delivery`, {
            deliveryID: id
        })
        .then(async () => {
            try {
                await getDonationRequests()
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
                                await getDonationRequests()
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

    const handleDonationRequestAccept = (id) => {
        let api = new API();
        setLoading(true);
        api.setAuthorizationToken(localStorage.access_token)
        api
        .put(`${ENDPOINT}/delivery`, {
            donorAccepted: true,
            deliveryID : id
        })
        .then(async () => {
            try {
                await getDeliveryRequests()
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
                            donorAccepted: true,
                            deliveryID : id
                        })
                        .then(async () => {
                            try {
                                await getDeliveryRequests()
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
            }
        })
    }

    if (loading) {
        return (
            <div style={{width: "100%", height: "auto", display: "flex", justifyContent: "center", alignItems: "center"}}>
                <NavBar {...props}  />
                <CircularProgress size={50} />
            </div>
        )
    } else {
        return (
            <div style={{height: "100%", backgroundColor: COLORS.WHITE}}>
                <NavBar {...props}  />
                <div style={{justifyContent: "center", display: "flex", flexDirection: "column", padding: "30px 30px"}}>
                    <Dialog onClose={() => {setConfirmOpen(false);setConfirmationCode('');setFeedbackDelivererID('');setFeedbackDeliveryID('');setFeedback('');setRatingGiven(false);}} open={confirmOpen}>
                        <div style={{padding: "20px"}}>
                            <div style={{display: "flex", justifyContent: "center"}}>
                                <DialogTitle id="dialog-title"><b style={{color: COLORS.BLUE, fontSize: '30px'}}>Enter the following code:</b></DialogTitle>
                            </div>
                            <div style={{display: "flex", justifyContent: "center"}}>
                                <b style={{color : COLORS.GREEN, fontSize: '60px'}}>{confirmationCode}</b>
                            </div>
                            <div style={{marginTop : '5px'}}/>
                            {
                                (ratingGiven) ? (
                                    <div style={{display: "flex", justifyContent: 'center', fontSize: '20px'}}>
                                        <b>Feedback already given</b>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{display: "flex", alignItems: "center", flexDirection: 'column'}}>
                                            <Typography style={{textAlign : 'center', fontSize: '20px'}} component="legend"><b>Select a rating</b></Typography>
                                            <Rating
                                            value={rating}
                                            onChange={(event, newValue) => {
                                                setRating(newValue);
                                            }}
                                            />
                                        </div>
                                        <div style={{marginTop: '20px', display: "flex", justifyContent: "center"}}>
                                            <TextareaAutosize
                                            rowsMax={4}
                                            placeholder="Write feedback here..."
                                            value = {feedback}
                                            onChange={(e) => {setFeedback(e.target.value)}}
                                            />
                                        </div>
                                        <div style={{marginTop: '20px', display: "flex", justifyContent: "center"}}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleFeedback}
                                            >
                                                Submit Feedback
                                            </Button>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </Dialog>
                    <div style={{marginTop: "15px"}}></div>
                    <Typography variant="h3" style={{textAlign: 'left', color: COLORS.BLUE}}>
                        Allocated Deliveries for Requests
                    </Typography>
                    <div style={{marginTop: "15px"}}></div>
                    <TableContainer component={Paper}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableCell align="center">
                                    Donor
                                </TableCell>
                                <TableCell align="center">
                                    Deliverer
                                </TableCell>
                                <TableCell align="center">
                                    Item
                                </TableCell>
                                <TableCell align="center">
                                    Quantity
                                </TableCell>
                                <TableCell align="center">
                                    Reject
                                </TableCell>
                                <TableCell align="center">
                                    Confirm
                                </TableCell>
                            </TableHead>
                            <TableBody>
                                {
                                    deliveryRequests.map((deliveryRequest) =>
                                        <TableRow key={deliveryRequest.id}>
                                            <TableCell align="center">{deliveryRequest.donorFirstName} {deliveryRequest.donorLastName}</TableCell>
                                            <TableCell align="center">{deliveryRequest.delivererFirstName} {deliveryRequest.delivererLastName}</TableCell>
                                            <TableCell align="center">{deliveryRequest.itemName}</TableCell>
                                            <TableCell align="center">{deliveryRequest.quantity}</TableCell>
                                            <TableCell align="center"><Button onClick={() => {handleRequestDelete(deliveryRequest.id)}} variant="contained" color="secondary" disabled={deliveryRequest.beneficiaryAccepted ? true : false}>Reject</Button></TableCell>
                                            <TableCell align="center">
                                            {
                                                (deliveryRequest.beneficiaryAccepted) ? (
                                                    (deliveryRequest.donorAccepted && deliveryRequest.delivererAccepted) ? (
                                                        <Button onClick={() => {handleRequestConfirm(deliveryRequest.id, deliveryRequest.delivererID, deliveryRequest.confirmationCode, deliveryRequest.ratingGiven)}} variant="contained" color="primary" >Confirm</Button>
                                                    ) : (
                                                        <h2>Pending</h2>
                                                    )
                                                ) : (
                                                    <Button onClick={() => {handleRequestAccept(deliveryRequest.id)}} variant="contained" color="primary" >Accept</Button>
                                                )
                                            }
                                            </TableCell>
                                        </TableRow>
                                    )
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <div style={{marginTop: "15px"}}></div>
                    <Typography variant="h3" style={{textAlign: 'left', color: COLORS.BLUE}}>
                        Deliveries
                    </Typography>
                    <div style={{marginTop: "15px"}}></div>
                    <Dialog onClose={() => {setDeliveryConfirmOpen(false)}} open={deliveryConfirmOpen}>
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
                    <TableContainer component={Paper}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">
                                        <h3>Collection Address</h3>
                                    </TableCell>
                                    <TableCell align="center">
                                        <h3>Delivery Address</h3>
                                    </TableCell>
                                    <TableCell align="center">
                                        <h3>Collection Date and Time</h3>
                                    </TableCell>
                                    <TableCell align="center">
                                        <h3>Delivery Date and Time</h3>
                                    </TableCell>
                                    <TableCell align="center">
                                        <h3>Delete</h3>
                                    </TableCell>
                                    <TableCell align="center">
                                        <h3>Action</h3>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    deliveries.map((delivery) => 
                                        <TableRow key={delivery.id}>
                                            <TableCell align="center">
                                                <div>{delivery.collectionAddressLine1}</div>
                                                <div>{delivery.collectionAddressLine2}</div>
                                                <div>{delivery.collectionAddressPostalCode}</div>
                                            </TableCell>
                                            <TableCell align="center">
                                                <div>{delivery.deliveryAddressLine1}</div>
                                                <div>{delivery.deliveryAddressLine2}</div>
                                                <div>{delivery.deliveryAddressPostalCode}</div>
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
                                                <Button onClick={() => {handleDeliveryDelete(delivery.id)}} variant="contained" color="secondary" disabled={delivery.delivererAccepted ? true : false}>Delete</Button>
                                            </TableCell>
                                            <TableCell align="center">
                                                {
                                                    (delivery.delivererAccepted) ? (
                                                            (delivery.donorAccepted && delivery.beneficiaryAccepted) ? (
                                                                <Button onClick={() => {handleDeliveryConfirm(delivery.id)}} variant="contained" color="primary" disabled={delivery.delivered ? true : false}>Confirm</Button>
                                                            ) : (
                                                                <Button variant="contained" disabled>Pending</Button>
                                                            )
                                                    ) : (
                                                        <Button onClick={() => handleDeliveryAccept(delivery.id)} variant="contained" color="primary">Accept</Button>
                                                    )
                                                }
                                            </TableCell>
                                        </TableRow>
                                    )
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <div style={{marginTop: "15px"}}></div>
                    <Typography variant="h3" style={{textAlign: 'left', color: COLORS.BLUE}}>
                        Donation Requests
                    </Typography>
                    <div style={{marginTop: "15px"}}></div>
                    <TableContainer component={Paper}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableCell align="center">
                                    Beneficiary
                                </TableCell>
                                <TableCell align="center">
                                    Item
                                </TableCell>
                                <TableCell align="center">
                                    Quantity
                                </TableCell>
                                <TableCell align="center">
                                    Date and time
                                </TableCell>
                                <TableCell align="center">
                                    Reject
                                </TableCell>
                                <TableCell align="center">
                                    Accept
                                </TableCell>
                            </TableHead>
                            <TableBody>
                                {
                                    donationRequests.map((donationRequest) => 
                                        <TableRow key={donationRequest.id}>
                                            <TableCell align="center">{donationRequest.beneficiaryFirstName} {donationRequest.beneficiaryLastName}</TableCell>
                                            <TableCell align="center">{donationRequest.itemName}</TableCell>
                                            <TableCell align="center">{donationRequest.quantity}</TableCell>
                                            <TableCell align="center">{donationRequest.collectionDateTime.toLocaleString()}</TableCell>
                                            <TableCell align="center"><Button onClick={() => {handleDonationRequestDelete(donationRequest.id)}} variant="contained" color="secondary" disabled={donationRequest.donorAccepted ? true : false}>Reject</Button></TableCell>
                                            <TableCell align="center"><Button onClick={() => {handleDonationRequestAccept(donationRequest.id)}} variant="contained" color="primary" disabled={donationRequest.donorAccepted ? true : false}>Accept</Button></TableCell>
                                        </TableRow>
                                    )
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <div style={{marginTop : '40px'}} />
                    <Typography variant="h3" style={{textAlign: 'left', color: COLORS.BLUE}}>
                        Donations
                    </Typography>
                    <div style={{marginTop: "15px"}}></div>
                    <TableContainer component={Paper}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">
                                        Category
                                    </TableCell>
                                    <TableCell align="center">
                                        Type
                                    </TableCell>
                                    <TableCell align="center">
                                        Description
                                    </TableCell>
                                    <TableCell align="center">
                                        Remaining Quantity
                                    </TableCell>
                                    <TableCell align="center">
                                        Expiry Date
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell align="center">{categoryMap.get(String(item.categoryTypeID)).category}</TableCell>
                                            <TableCell align="center">{categoryMap.get(String(item.categoryTypeID)).categoryType}</TableCell>
                                            <TableCell align="center">{item.description}</TableCell>
                                            <TableCell align="center">{item.quantity}</TableCell>
                                            <TableCell align="center">{item.expiryDate.toLocaleDateString()}</TableCell>
                                        </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        )
    }
}

export default observer(Main);