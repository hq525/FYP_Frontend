import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react"
import {
    CircularProgress, 
    Typography,
    Grid,
    FormControl,
    Select,
    MenuItem,
    TextareaAutosize,
    Button
} from "@material-ui/core";
import API from "../utils/API";
import { ENDPOINT, COLORS } from "../utils/config"
import 'antd/dist/antd.css';
import { InputNumber } from 'antd';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { withStyles, makeStyles } from '@material-ui/core/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const SubmitButton = withStyles((theme) => ({
    root: {
      color: theme.palette.getContrastText(COLORS.BLACK),
      backgroundColor: COLORS.PEACH,
      fontSize: 28,
      borderRadius: "30px"
    },
}))(Button);

const useStyles = makeStyles((theme) => ({
    margin: {
        margin: theme.spacing(1),
    },
    textarea: {
        width: '100%',
    },
}));

const addDays = (date, days) => {
    var temp = new Date()
    temp.setDate(date.getDate() + days)
    return temp
}

const NewRequest = (props) => {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState("")
    const [categories, setCategories] = useState([]);
    const [categoryType, setCategoryType] = useState("");
    const [categoryTypes, setCategoryTypes] = useState([]);
    const [quantity, setQuantity] = useState(1)
    const [comments, setComments] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function initialize() {
            setLoading(true);
            try {
                await getCategories()
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

    const handleSubmit = (e) => {
        e.preventDefault()
        setErrorMessage("");
        if (categoryType === "") {
            setErrorMessage("Please select a category and its type")
        } else {
            setLoading(true);
            let api = new API();
            api.setAuthorizationToken(localStorage.access_token)
            api
            .post(`${ENDPOINT}/request`, {
                "categoryTypeID" : categoryType,
                "quantity" : quantity,
                "comments" : comments
            })
            .then(async (data) => {
                setErrorMessage("Request created successfully")
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
                            .post(`${ENDPOINT}/request`, {
                                "categoryTypeID" : categoryType,
                                "quantity" : quantity,
                                "comments" : comments
                            })
                            .then(async (data) => {
                                setErrorMessage("Request created successfully")
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

    if (loading) {
        return (
            <div style={{width: "100%", height: "auto", display: "flex", justifyContent: "center", alignItems: "center"}}>
                <CircularProgress size={50} />
            </div>
        )
    } else {
        return (
            <div style={{justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column", padding: "30px 30px"}}>
                <div style={{marginTop: "15px"}}></div>
                <div style={{maxWidth: "1000px", backgroundColor: COLORS.GREEN, padding: "20px 20px"}}>
                    <Grid container>
                        <Grid item lg={4} md={4} sm={4} xs={4}>
                            <span style={{paddingLeft: '20px', cursor: 'pointer'}} onClick={props.returnToMain}><ArrowBackIcon style={{fontSize: '50px'}} /></span>
                        </Grid>
                        <Grid item lg={4} md={4} sm={4} xs={4}>
                            <Typography variant="h3" style={{color: COLORS.LIGHT_BLUE}}>
                                <b>New Request</b>
                            </Typography>
                        </Grid>
                        <Grid item lg={4} md={4} sm={4} xs={4}>
                            
                        </Grid>
                        <Grid item lg={6} md={6} sm={6} xs={6} style={{display:"flex", alignItems: "center", height: "100px"}}>
                            <div style={{width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                                <Typography style={{color: COLORS.LIGHT_BLUE, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h4" >
                                    <b>Category:</b>
                                </Typography>
                            </div>
                        </Grid>
                        <Grid item lg={6} md={6} sm={6} xs={6}>
                            <FormControl style={{width: "100%", backgroundColor: COLORS.WHITE}} margin="normal" variant="outlined">
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
                        { category && (
                            <Grid item lg={6} md={6} sm={6} xs={6} style={{display:"flex", alignItems: "center", height: "100px"}}>
                                <div style={{width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                                    <Typography style={{color: COLORS.LIGHT_BLUE, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h4">
                                        <b>Type:</b>
                                    </Typography>
                                </div>
                            </Grid>
                        )}
                        { category && (
                            <Grid item lg={6} md={6} sm={6} xs={6} >
                                <FormControl style={{width: "100%", backgroundColor: COLORS.WHITE}} margin="normal" variant="outlined">
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
                        <Grid item lg={6} md={6} sm={6} xs={6} style={{display:"flex", alignItems: "center", height: "100px"}}>
                            <div style={{width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                                <Typography style={{color: COLORS.LIGHT_BLUE, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h4">
                                    <b>Quantity:</b>
                                </Typography>
                            </div>
                        </Grid>
                        <Grid item lg={6} md={6} sm={6} xs={6} style={{display: "flex", justifyContent: "left", alignItems: "center"}}>
                            <InputNumber style={{width: "100%", height: "35px"}} min={1} value={quantity} onChange={(value) => {setQuantity(value)}} />
                        </Grid>
                        <Grid item lg={6} md={6} sm={6} xs={6} style={{display:"flex", alignItems: "flex-start", height: "100px"}}>
                            <div style={{width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                                <Typography style={{color: COLORS.LIGHT_BLUE, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h4">
                                    <b>Comments:</b>
                                </Typography>
                            </div>
                        </Grid>
                        <Grid item lg={6} md={6} sm={6} xs={6} style={{display: "flex", justifyContent: "left"}}>
                            <TextareaAutosize className={classes.textarea} value={comments} onChange={(e) => {setComments(e.target.value)}} rowsMin={3} placeholder="Type comments here" />
                        </Grid>
                    </Grid>
                    { errorMessage && <h3 style={{color: "red"}}>{errorMessage}</h3>}
                    <div style={{marginTop: "15px"}}></div>
                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                        <SubmitButton onClick={handleSubmit} variant="contained" color="primary" className={classes.margin}>
                            Submit
                        </SubmitButton>
                    </div>
                </div>
            </div>
        )
    }
}

export default observer(NewRequest);