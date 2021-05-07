import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react"
import {
    Typography,
    Fab,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    TextareaAutosize 
} from "@material-ui/core";
import Rating from '@material-ui/lab/Rating';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import ControlPointIcon from '@material-ui/icons/ControlPoint';
import { ENDPOINT, COLORS } from "../utils/config"
import API from "../utils/API"

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

const Landing = (props) => {
    const classes = useStyles();
    const [requests, setRequests] = useState([]);
    const [categoryMap, setCategoryMap] = useState(new Map());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function initialize() {
            setLoading(true);
            try {
                await getRequests()
            } catch(error) {
                if (error && error.data && error.data.message) {
                    props.setError(error.data.message)
                } else {
                    props.setError("An error occurred")
                }
            }
            try {
                await getDeliveryRequests()
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

    const getRequests = () => {
        let api = new API();
        return new Promise((resolve, reject) => {
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/request`)
            .then((data) => {
                let requestData = []
                let categoryTypeIDs = new Set()
                data.requests.forEach((request) => {
                    requestData.push({id: request.id, categoryTypeID: request.categoryTypeID, quantity: request.quantity, dateRequested: new Date(request.dateRequested), comments: request.comments})
                    if (!categoryMap.has(request.categoryTypeID)) {
                        categoryTypeIDs.add(request.categoryTypeID)
                    }
                })
                setRequests(requestData)
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
                            .get(`${ENDPOINT}/request`)
                            .then((data) => {
                                let requestData = []
                                let categoryTypeIDs = new Set()
                                data.requests.forEach((request) => {
                                    requestData.push({id: request.id, categoryType: request.categoryTypeID, quantity: request.quantity, dateRequested: new Date(request.dateRequested), comments: request.comments})
                                    if (!categoryMap.has(request.categoryTypeID)) {
                                        categoryTypeIDs.add(request.categoryTypeID)
                                    }
                                })
                                setRequests(requestData)
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

    const handleDelete = (id) => {
        let api = new API();
        setLoading(true);
        api.setAuthorizationToken(localStorage.access_token)
        api
        .delete(`${ENDPOINT}/request`, {
            "id" : id
        })
        .then(async (data) => {
            await getRequests()
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
                            "id" : id
                        })
                        .then(async (data) => {
                            await getRequests()
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

    const handleRequestDetails = (id) => {
        props.setSelectedRequestID(id)
        props.goToRequestDetails()
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

    const handleAccept = (id) => {
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
                <Typography variant="h3" style={{textAlign: 'left', color: COLORS.BLUE}}>
                    Deliveries
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
                                                <Button onClick={() => {handleAccept(deliveryRequest.id)}} variant="contained" color="primary" >Accept</Button>
                                            )
                                        }
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <div style={{marginTop: "40px"}}></div>
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <Typography variant="h3" style={{color: COLORS.BLUE}}>
                        Requests
                    </Typography>
                    <Fab onClick={props.goToNewRequest} variant="extended">
                        <ControlPointIcon className={classes.extendedIcon} />
                        New Request
                    </Fab>
                </div>
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
                <TableContainer component={Paper}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">
                                    
                                </TableCell>
                                <TableCell align="center">
                                    Requested On
                                </TableCell>
                                <TableCell align="center">
                                    Category
                                </TableCell>
                                <TableCell align="center">
                                    Type
                                </TableCell>
                                <TableCell align="center">
                                    Quantity
                                </TableCell>
                                <TableCell align="center">
                                    Comments
                                </TableCell>
                                <TableCell align="center">
                                    Delete
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                requests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell align="center"><Button onClick={() => {handleRequestDetails(request.id)}}>Details</Button></TableCell>
                                        <TableCell align="center">{request.dateRequested.toLocaleDateString()}</TableCell>
                                        <TableCell align="center">{categoryMap.get(String(request.categoryTypeID)).category}</TableCell>
                                        <TableCell align="center">{categoryMap.get(String(request.categoryTypeID)).categoryType}</TableCell>
                                        <TableCell align="center">{request.quantity}</TableCell>
                                        <TableCell align="center">{request.comments}</TableCell>
                                        <TableCell align="center"><Button onClick={() => {handleDelete(request.id)}}>Delete</Button></TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        )
    }
}

export default observer(Landing);