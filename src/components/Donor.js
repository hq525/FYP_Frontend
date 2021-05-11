import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react"
import { makeStyles, createStyles } from '@material-ui/core/styles';
import NavBar from "../NavBar";
import 'antd/dist/antd.css';
import { InputNumber } from 'antd';
import { 
    CircularProgress, 
    Typography, 
    Grid, 
    FormControl, 
    Select, 
    MenuItem,
    FormControlLabel,
    Checkbox,
    TextareaAutosize,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Fab,
    Button
} from "@material-ui/core";
import ControlPointIcon from '@material-ui/icons/ControlPoint';
import { ENDPOINT, COLORS } from "../utils/config"
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "../utils/API";
import MultiSelect from "@khanacademy/react-multi-select";

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

const Donor = (props) => {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [newDonation, setNewDonation] = useState(false);
    const [category, setCategory] = useState("")
    const [categories, setCategories] = useState([]);
    const [categoryType, setCategoryType] = useState("");
    const [categoryTypes, setCategoryTypes] = useState([]);
    const [expiryDate, setExpiryDate] = useState(new Date())
    const [includeExpiryDate, setIncludeExpiryDate] = useState(true);
    const [description, setDescription] = useState("")
    const [items, setItems] = useState([]);
    const [categoryMap, setCategoryMap] = useState(new Map());
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [quantity, setQuantity] = useState(1)
    const [price, setPrice] = useState(1);

    useEffect(() => {
        async function initialize() {
            setLoading(true);
            try {
                await getTags()
            } catch (error) {
                console.log(error)
                if (error && error.data && error.data.message) {
                    props.setError(error.data.message)
                } else {
                    props.setError("An error occurred")
                }
            }
            try {
                await getCategories()
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
                await getDeliveryRequests();
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
            .get(`${ENDPOINT}/delivery/item`)
            .then((data) => {
                let deliveryRequestsData = []
                data.deliveries.forEach((delivery) => {
                    deliveryRequestsData.push({
                        id : delivery['id'],
                        beneficiaryFirstName : delivery['beneficiaryFirstName'],
                        beneficiaryLastName : delivery['beneficiaryLastName'],
                        collectionDateTime : new Date(delivery['collectionDateTime'].replace("T", " ") + " UTC"),
                        itemName : delivery['itemName'],
                        quantity : delivery['quantity'],
                        donorAccepted : delivery['donorAccepted'],
                        delivererAccepted : delivery['delivererAccepted'],
                        beneficiaryAccepted : delivery['beneficiaryAccepted'],
                        delivered : delivery['delivered']
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
                            .get(`${ENDPOINT}/delivery/item`)
                            .then((data) => {
                                let deliveryRequestsData = []
                                data.deliveries.forEach((delivery) => {
                                    deliveryRequestsData.push({
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
                    reject(error)
                }
            })
        })
    }

    const getTags = () => {
        let api = new API();
        return new Promise((resolve, reject) => {
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/tag`)
            .then((data) => {
                let tagData = []
                data.tags.forEach((tag) => {
                    tagData.push({label: tag.name, value: tag.id})
                })
                setTags(tagData)
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
                            .get(`${ENDPOINT}/tag`)
                            .then((data) => {
                                let tagData = []
                                data.tags.forEach((tag) => {
                                    tagData.push({label: tag.name, value: tag.id})
                                })
                                setTags(tagData)
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

    const getCategories = () => {
        let api = new API();
        return new Promise((resolve, reject) => {
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/category`)
            .then((data) => {
                setCategories(data.categories)
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
                            .get(`${ENDPOINT}/category`)
                            .then((data) => {
                                setCategories(data.categories)
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

    const handleNewItem = (e) => {
        e.preventDefault()
        setErrorMessage("");
        if (categoryType === "") {
            setErrorMessage("Please select a category and its type")
        } else {
            setLoading(true);
            let api = new API()
            api.setAuthorizationToken(localStorage.access_token)
            api
            .post(`${ENDPOINT}/item`, {
                "categoryTypeID" : categoryType,
                "quantity" : quantity,
                "price" : price,
                "description" : description,
                "expiryDate" : includeExpiryDate ? expiryDate : null,
                "tags" : selectedTags
            })
            .then(async (data) => {
                try {
                    await getItems()
                } catch(error) {
                    if (error && error.data && error.data.message) {
                        props.setError(error.data.message)
                    } else {
                        props.setError("An error occurred")
                    }
                }
                setNewDonation(false);
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
                            .post(`${ENDPOINT}/item`, {
                                "categoryTypeID" : categoryType,
                                "quantity" : quantity,
                                "price" : price,
                                "description" : description,
                                "expiryDate" : includeExpiryDate ? expiryDate : null,
                                "tags" : selectedTags
                            })
                            .then(async (data) => {
                                try {
                                    await getItems()
                                } catch(error) {
                                    if (error && error.data && error.data.message) {
                                        props.setError(error.data.message)
                                    } else {
                                        props.setError("An error occurred")
                                    }
                                }
                                setNewDonation(false);
                                setLoading(false);
                            })
                            .catch((error) => {
                                if (error && error.data && error.data.message) {
                                    props.setError(error.data.message)
                                } else {
                                    props.setError("An error occurred")
                                }
                                setLoading(false);
                            })
                        })
                        .catch((error) => {
                            userStore.setUser(null);
                            localStorage.removeItem('refresh_token');
                            localStorage.removeItem('access_token');
                            userStore.setAuthenticated(false);
                            setLoading(false);
                        })
                    } else {
                        userStore.setUser(null);
                        localStorage.removeItem('refresh_token');
                        localStorage.removeItem('access_token');
                        userStore.setAuthenticated(false);
                        setLoading(false);
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
    }

    const handleCategoryChange = (e) => {
        let newCategoryID = e.target.value
        setCategory(newCategoryID)
        setCategoryType("")
        if (newCategoryID === "") {
            setCategoryTypes([])
        } else {
            setLoading(true);
            let api = new API();
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/category/type/${newCategoryID}`)
            .then((data) => {
                let categoryTypeData = []
                data.categoryTypes.forEach((categoryType) => {
                    categoryTypeData.push({id: categoryType.id, name: categoryType.name})
                })
                setCategoryTypes(categoryTypeData)
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
                            .get(`${ENDPOINT}/category/type/${newCategoryID}`)
                            .then((data) => {
                                let categoryTypeData = []
                                data.categoryTypes.forEach((categoryType) => {
                                    categoryTypeData.push({id: categoryType.id, name: categoryType.name})
                                })
                                setCategoryTypes(categoryTypeData)
                                setLoading(false);
                            })
                            .catch((error) => {
                                setLoading(false);
                                if (error && error.data && error.data.message) {
                                    props.setError(error.data.message)
                                } else {
                                    props.setError("An error occurred")
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
                        setLoading(false)
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
                    setLoading(false)
                }
            })
        }
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

    const handleRequestAccept = (id) => {
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
            <div style={{height: "100%", backgroundColor: COLORS.WHITE}}>
                <NavBar {...props}  />
                <div style={{width: "100%", height: "80%", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <CircularProgress size={100} />
                </div>
            </div>
        )
    } else {
        return (
            <div style={{height: "100%", backgroundColor: COLORS.WHITE}}>
                <NavBar {...props}  />
                <div style={{marginTop: "15px"}}></div>
                { newDonation ? (
                    <Grid container>
                        <Grid item sm={12} lg={12} md={12} xs={12} style={{display: 'flex', justifyContent: 'flex-start'}}>
                            <span style={{paddingLeft: '20px', cursor: 'pointer'}} onClick={() => {setNewDonation(false)}}><ArrowBackIcon style={{fontSize: '100px'}} /></span>
                        </Grid>
                        <Grid item lg={3} md={3} sm={3} xs={3} >
                            <Typography style={{color: COLORS.GREEN, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h4">
                                <b>Category</b>
                            </Typography>
                        </Grid>
                        <Grid item lg={9} md={9} sm={9} xs={9} style={{display: "flex", justifyContent: "left"}}>
                            <FormControl margin="normal" variant="outlined">
                                <Select
                                id="category"
                                value={category}
                                onChange={handleCategoryChange}
                                >
                                    <MenuItem value=""><em>Please Select</em></MenuItem>
                                    { categories.map((category) => 
                                        <MenuItem value={category.id}>{category.name}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item sm={12} lg={12} md={12} xs={12}>
                            <div style={{marginTop: "20px"}} />
                        </Grid>
                        { category && (
                            <Grid item lg={3} md={3} sm={3} xs={3} >
                                <Typography style={{color: COLORS.GREEN, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h4">
                                    <b>Category Type</b>
                                </Typography>
                            </Grid>
                        )}
                        { category && (
                            <Grid item lg={9} md={9} sm={9} xs={9} style={{display: "flex", justifyContent: "left"}}>
                                <FormControl margin="normal" variant="outlined">
                                    <Select
                                    id="categoryType"
                                    value={categoryType}
                                    onChange={(e) => {setCategoryType(e.target.value)}}
                                    >
                                        <MenuItem value=""><em>Please Select</em></MenuItem>
                                        { categoryTypes.map((categoryType) => 
                                            <MenuItem value={categoryType.id}>{categoryType.name}</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                        {
                            category && (
                                <Grid item sm={12} lg={12} md={12} xs={12}>
                                    <div style={{marginTop: "20px"}} />
                                </Grid>
                            )
                        }
                        <Grid item lg={3} md={3} sm={3} xs={3} >
                            <Typography style={{color: COLORS.GREEN, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h4">
                                <b>Quantity</b>
                            </Typography>
                        </Grid>
                        <Grid item lg={9} md={9} sm={9} xs={9} style={{display: "flex", justifyContent: "left"}}>
                            <InputNumber min={1} value={quantity} onChange={(value) => {setQuantity(value)}} />
                        </Grid>
                        <Grid item sm={12} lg={12} md={12} xs={12}>
                            <div style={{marginTop: "20px"}} />
                        </Grid>
                        {/* <Grid item lg={3} md={3} sm={3} xs={3} >
                            <Typography style={{color: COLORS.GREEN, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h4">
                                <b>Price</b>
                            </Typography>
                        </Grid>
                        <Grid item lg={9} md={9} sm={9} xs={9} style={{display: "flex", justifyContent: "left"}}>
                            <InputNumber precision={2} min={0} value={price} onChange={(value) => {setPrice(value)}} />
                        </Grid> */}
                        <Grid item sm={12} lg={12} md={12} xs={12}>
                            <div style={{marginTop: "20px"}} />
                        </Grid>
                        <Grid item lg={3} md={3} sm={3} xs={3} >
                            <Typography style={{color: COLORS.GREEN, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h4">
                                <b>Expiry Date</b>
                            </Typography>
                        </Grid>
                        <Grid item lg={9} md={9} sm={9} xs={9} style={{display: "flex", alignItems: "center"}}>
                            <div style={{float: "left"}}>
                                <DatePicker selected={expiryDate} minDate={new Date()} showYearDropdown onChange={date => setExpiryDate(date)} />
                            </div>
                            <div style={{float: "left", marginLeft: "10px"}}>
                                <FormControlLabel
                                    control={
                                    <Checkbox
                                        checked={includeExpiryDate}
                                        onChange={(e) => {setIncludeExpiryDate(e.target.checked)}}
                                        name="includeExpiryDate"
                                        color="primary"
                                    />
                                    }
                                    label="Include Expiry Date"
                                />
                            </div>
                        </Grid>
                        <Grid item sm={12} lg={12} md={12} xs={12}>
                            <div style={{marginTop: "20px"}} />
                        </Grid>
                        <Grid item lg={3} md={3} sm={3} xs={3} >
                            <Typography style={{color: COLORS.GREEN, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h4">
                                <b>Description</b>
                            </Typography>
                        </Grid>
                        <Grid item lg={9} md={9} sm={9} xs={9} style={{display: "flex", justifyContent: "left"}}>
                            <TextareaAutosize value={description} onChange={(e) => {setDescription(e.target.value)}}/>
                        </Grid>
                        <Grid item sm={12} lg={12} md={12} xs={12}>
                            <div style={{marginTop: "20px"}} />
                        </Grid>
                        <Grid item lg={3} md={3} sm={3} xs={3} >
                            <Typography style={{color: COLORS.GREEN, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h4">
                                <b>Tags</b>
                            </Typography>
                        </Grid>
                        <Grid item lg={9} md={9} sm={9} xs={9} style={{maxWidth: "800px"}}>
                            <MultiSelect
                            options={tags}
                            selected={selectedTags}
                            onSelectedChanged={selected => setSelectedTags(selected)}
                            />
                        </Grid>
                        <Grid item sm={12} lg={12} md={12} xs={12}>
                            <div style={{marginTop: "20px"}} />
                        </Grid>
                        { errorMessage && <h3 style={{color: "red"}}>{errorMessage}</h3>}
                        <Grid item lg={12} md={12} sm={12} xs={12}>
                            <Button onClick={handleNewItem}>
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                ) : (
                    <div style={{justifyContent: "center", display: "flex", flexDirection: "column", padding: "30px 30px"}}>
                        <Typography variant="h3" style={{textAlign: 'left', color: COLORS.BLUE}}>
                            Delivery Requests
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
                                        deliveryRequests.map((deliveryRequest) => 
                                            <TableRow key={deliveryRequest.id}>
                                                <TableCell align="center">{deliveryRequest.beneficiaryFirstName} {deliveryRequest.beneficiaryLastName}</TableCell>
                                                <TableCell align="center">{deliveryRequest.itemName}</TableCell>
                                                <TableCell align="center">{deliveryRequest.quantity}</TableCell>
                                                <TableCell align="center">{deliveryRequest.collectionDateTime.toLocaleString()}</TableCell>
                                                <TableCell align="center"><Button onClick={() => {handleRequestDelete(deliveryRequest.id)}} variant="contained" color="secondary" disabled={deliveryRequest.donorAccepted ? true : false}>Reject</Button></TableCell>
                                                <TableCell align="center"><Button onClick={() => {handleRequestAccept(deliveryRequest.id)}} variant="contained" color="primary" disabled={deliveryRequest.donorAccepted ? true : false}>Accept</Button></TableCell>
                                            </TableRow>
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <div style={{marginTop : '40px'}} />
                        <div style={{display: "flex", justifyContent: "space-between"}}>
                            <Typography variant="h3" style={{color: COLORS.BLUE}}>
                                Donations
                            </Typography>
                            <Fab onClick={() => {setNewDonation(true)}} variant="extended">
                                <ControlPointIcon className={classes.extendedIcon} />
                                New Donation
                            </Fab>
                        </div>
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
                )}
            </div>
        )
    }
}

export default observer(Donor);