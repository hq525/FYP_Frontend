import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react";
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, AppBar, Toolbar, IconButton, Dialog, Slide, CircularProgress } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import NavBar from "../NavBar";
import { ENDPOINT, COLORS, MIN_YEAR } from "../utils/config";
import API from "../utils/API";
import { MonthView } from 'react-calendar';
import './Calendar.css'
import Combobox from 'react-widgets/lib/Combobox'
import 'react-widgets/dist/css/react-widgets.css';
import Availability from './Availability';

const monthss = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

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

const Calendar = (props) => {
    const classes = useStyles();
    const [months, setMonths] = useState([]);
    const [availableDates, setAvailableDates] = useState(new Set())
    const [selectedDate, setSelectedDate] = useState(null);
    const [years, setYears] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function initialize() {
            let temp2 = []
            for (let yr = MIN_YEAR; yr <= new Date().getFullYear(); yr += 1) {
                temp2.push(yr)
            }
            setYears(temp2);
            await getAvailableDates(year);
            setLoading(false);
        }
        initialize()
    }, [])

    const getAvailableDates = (yr) => {
        let api = new API();
        let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        api.setAuthorizationToken(localStorage.access_token)
        return new Promise((resolve, reject) => {
            api
            .post(`${ENDPOINT}/availability/get`, {
                year: yr,
                timezone
            })
            .then((data) => {
                var tempSet = new Set()
                for (let month in data.dates) {
                    data.dates[month].forEach((date) => {
                        tempSet.add(`${date},${month}`)
                    })
                }
                setAvailableDates(tempSet)
                let temp = [];
                for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
                    temp.push(
                        <Grid item xs={3} sm={3} md={3} lg={3} style={{padding: "7px"}}>
                            <h2 style={{marginTop: "0px", marginBottom: "0px"}}>{monthss[monthIndex]}</h2>
                            <MonthView tileClassName={({ date, view}) => ((view === 'month') && (tempSet.has(`${date.getDate()},${date.getMonth()+1}`))) ? 'available' : null} onClick={(value) => handleDateClick(value)} activeStartDate={new Date(yr, monthIndex)} />
                        </Grid>
                    );
                }
                setMonths(temp);
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
                            .post(`${ENDPOINT}/availability/get`, {
                                year,
                                timezone
                            })
                            .then((data) => {
                                var tempSet = new Set()
                                for (let month in data.dates) {
                                    data.dates[month].forEach((date) => {
                                        tempSet.add(`${date},${month}`)
                                    })
                                }
                                setAvailableDates(tempSet)
                                let temp = [];
                                for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
                                    temp.push(
                                        <Grid item xs={3} sm={3} md={3} lg={3} style={{padding: "7px"}}>
                                            <h2 style={{marginTop: "0px", marginBottom: "0px"}}>{monthss[monthIndex]}</h2>
                                            <MonthView tileClassName={({ date, view}) => ((view === 'month') && (tempSet.has(`${date.getDate()},${date.getMonth()+1}`))) ? 'available' : null} onClick={(value) => handleDateClick(value)} activeStartDate={new Date(yr, monthIndex)} />
                                        </Grid>
                                    );
                                }
                                setMonths(temp);
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

    const handleDateClick = (date) => {
        setSelectedDate(date)
        setOpen(true);
    }

    const handleYearChange = async (value) => {
        setLoading(true)
        setYear(value)
        await getAvailableDates(value)
        setLoading(false)
    }

    const handleClose = async () => {
        setOpen(false)
        setLoading(true)
        await getAvailableDates(year)
        setLoading(false);
    }
    if (loading) {
        return(
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
                <div style={{display: 'flex', justifyContent: "center"}}>
                    <div style={{width: 300}}>
                        <Combobox 
                        data={years}
                        value={year}
                        defaultValue={new Date().getFullYear()}
                        onChange = {value => {handleYearChange(value)}}
                        />
                    </div>
                </div>
                <Grid container>
                    {months}
                </Grid>
                <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
                    <AppBar className={classes.appBar}>
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                                <CloseIcon />
                            </IconButton>
                            <Typography variant="h6" className={classes.title}>
                                {selectedDate && selectedDate.toDateString()}
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    {selectedDate && <Availability  {...props} date={selectedDate} />}
                </Dialog>
            </div>
        )
    }
}

export default observer(Calendar);