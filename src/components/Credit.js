import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react"
import NavBar from "../NavBar";
import { 
    CircularProgress,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText
} from "@material-ui/core";
import ImageIcon from '@material-ui/icons/Image';
import { makeStyles } from '@material-ui/core/styles';
import Rating from '@material-ui/lab/Rating';
import { ENDPOINT, COLORS } from "../utils/config"
import API from "../utils/API";

const days = {
    0 : 'Sunday',
    1 : 'Monday',
    2 : 'Tuesday',
    3 : 'Wednesday',
    4 : 'Thursday',
    5 : 'Friday',
    6 : 'Saturday'
}

const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    inline: {
      display: 'inline',
    },
  }));

const Credit = (props) => {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [rating, setRating] = useState(null);
    const [ratings, setRatings] = useState([]);

    useEffect(() => {
        async function initialize() {
            setLoading(true);
            try {
                await getRatingInformation()
            } catch (error) {
                if (error && error.data && error.data.message) {
                    props.setError(error.data.message)
                } else {
                    props.setError("An error occurred")
                }
            }
            setLoading(false);
        }
        initialize();
    }, []);

    const getRatingInformation = () => {
        let api = new API();
        return new Promise((resolve, reject) => {
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/rating`)
            .then((data) => {
                setFirstName(data.firstName);
                setLastName(data.lastName);
                if (data['noOfRatings'] > 0) {
                    setRating(data['totalRating'] / data['noOfRatings'])
                }
                var ratingsData = []
                data.ratings.forEach((rating) => {
                    ratingsData.push({
                        id : rating['id'],
                        raterFirstName : rating['raterFirstName'],
                        raterLastName : rating['raterLastName'],
                        rating : rating['rating'],
                        date : new Date(rating['date'].replace("T", " ") + " UTC"),
                        feedback : rating['feedback']
                    })
                })
                ratingsData.sort(function(a,b){return new Date(a.date) - new Date(b.date)})
                console.log(ratingsData)
                setRatings(ratingsData)
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
                            .get(`${ENDPOINT}/rating`)
                            .then((data) => {
                                setFirstName(data.firstName);
                                setLastName(data.lastName);
                                if (data['noOfRatings'] > 0) {
                                    setRating(data['totalRating'] / data['noOfRatings'])
                                }
                                var ratingsData = []
                                data.ratings.forEach((rating) => {
                                    ratingsData.push({
                                        id : rating['id'],
                                        raterFirstName : rating['raterFirstName'],
                                        raterLastName : rating['raterLastName'],
                                        rating : rating['rating'],
                                        date : new Date(rating['date'].replace("T", " ") + " UTC"),
                                        feedback : rating['feedback']
                                    })
                                })
                                ratingsData.sort(function(a,b){return new Date(a.date) - new Date(b.date)})
                                setRatings(ratingsData)
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

    if (loading) {
        return (
            <div style={{height: "100%", backgroundColor: COLORS.WHITE}}>
                <NavBar {...props}  />
                <div style={{width: "100%", height: "auto", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <CircularProgress size={50} />
                </div>
            </div>
        )
    } else {
        return (
            <div style={{height: "100%", backgroundColor: COLORS.WHITE}}>
                <NavBar {...props}  />
                <div style={{marginTop: '20px'}} />
                <div style={{padding: '30px 30px'}}>
                    <Typography style={{color: COLORS.BLACK, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h3">
                        <b>{firstName} {lastName}</b>
                    </Typography>
                    {(rating === null) ? (
                        <div style={{paddingLeft: '20px', textAlign: 'left', fontSize: '30px', marginTop: '40px'}}><b>No ratings yet</b></div>
                    ) : (
                        <div>
                            <div style={{display: 'flex', paddingLeft: '20px'}}>
                                <Rating value={rating} readOnly /><span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', paddingLeft:  '10px'}}><b style={{fontSize: '20px'}}>({rating} stars)</b></span>
                            </div>
                            <div style={{marginTop: "40px"}} />
                            <div style={{display: 'flex', justifyContent: 'flex-start', paddingLeft: '20px'}}>
                                <b style={{color: COLORS.GREEN, fontSize: '30px', textAlign: 'left'}}>Feedback</b>
                            </div>
                        </div>
                    )}
                    <List className={classes.root}>
                        {
                            ratings.map((rating) => 
                                <ListItem alignItems="flex-start" button>
                                    <ListItemAvatar>
                                        <Avatar />
                                    </ListItemAvatar>
                                    <ListItemText 
                                    primary={
                                        <React.Fragment>
                                            <b>
                                            {rating.raterFirstName} {rating.raterLastName} ({rating.date.toLocaleDateString()}, {days[rating.date.getDay()]})
                                            </b>
                                        </React.Fragment>
                                    }
                                    secondary={
                                        <React.Fragment>
                                            <Rating value={rating.rating} readOnly />
                                            <div />
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                className={classes.inline}
                                                color="textPrimary"
                                            >
                                                {rating.feedback}
                                            </Typography>
                                        </React.Fragment>
                                    }
                                    />
                                </ListItem>
                            )
                        }
                    </List>
                </div>
            </div>
        )
    }
}

export default observer(Credit);