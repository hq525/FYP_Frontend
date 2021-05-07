import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react";
import { ENDPOINT, COLORS } from "../utils/config";
import { makeStyles } from '@material-ui/core/styles';
import { 
    Typography, 
    Button, 
    Dialog, 
    DialogTitle, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    TextField 
} from "@material-ui/core";
import { 
    TimePicker,
    MuiPickersUtilsProvider
} from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import API from "../utils/API";

const useStyles = makeStyles((theme) => ({
    delete_button: {
      margin: theme.spacing(1),
      backgroundColor: COLORS.RED,
      color: COLORS.WHITE
    },
    save_button: {
        margin: theme.spacing(1),
        backgroundColor: COLORS.BLUE,
        color: COLORS.WHITE
      },
      textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
      },
  }));


const Availability = (props) => {
    const classes = useStyles();
    const [availabilities, setAvailabilities] = useState([]);
    const [open, setOpen] = useState(false);
    const [startDateTime, setStartDateTime] = useState(new Date(props.date.getFullYear(), props.date.getMonth(), props.date.getDate(), 8, 0, 0, 0));
    const [endDateTime, setEndDateTime] = useState(new Date(props.date.getFullYear(), props.date.getMonth(), props.date.getDate(), 9, 0, 0, 0));
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        getAvailability();
    }, [])

    const getAvailability = async () => {
        let api = new API();
        api.setAuthorizationToken(localStorage.access_token)
        var startDateTime = new Date(props.date.getFullYear(), props.date.getMonth(), props.date.getDate(), 0, 0, 0, 0)
        var endDateTime = new Date(props.date.getFullYear(), props.date.getMonth(), props.date.getDate(), 23, 59, 59, 99)
        await new Promise((resolve, reject) => {
            api
            .post(`${ENDPOINT}/availability`, {
                startDateTime,
                endDateTime
            })
            .then((data) => {
                let availabilities = []
                data.availabilities.forEach((a) => {
                    availabilities.push({id : a.id, startDateTime: new Date(a.startDateTime.replace("T", " ") + " UTC"), endDateTime: new Date(a.endDateTime.replace("T", " ") + " UTC")})
                })
                setAvailabilities(availabilities)
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
                            .post(`${ENDPOINT}/availability`, {
                                startDateTime,
                                endDateTime
                            })
                            .then((data) => {
                                let availabilities = []
                                data.availabilities.foreach((a) => {
                                    availabilities.push({id : a.id, startDateTime: new Date(a.startDateTime.replace("T", " ") + " UTC"), endDateTime: new Date(a.endDateTime.replace("T", " ") + " UTC")})
                                })
                                setAvailabilities(availabilities)
                                resolve()
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
    }

    const handleDelete = (id) => {
        let api = new API();
        api.setAuthorizationToken(localStorage.access_token)
        api
        .delete(`${ENDPOINT}/availability`, {
            id
        })
        .then((data) => {
            getAvailability()
        })
        .catch((error) => {
            if (error && error.data && error.data.error === "token_expired") {
                if(localStorage.refresh_token) {
                    api
                    .refreshToken()
                    .then(() => {
                        api.setAuthorizationToken(localStorage.access_token)
                        api
                        .delete(`${ENDPOINT}/availability`, {
                            id
                        })
                        .then((data) => {
                            getAvailability()
                        })
                        .catch((error) => {
                            if (error && error.data && error.data.message) {
                                props.setError(error.data.message)
                            } else {
                                props.setError("An error occurred")
                            }
                        })
                    })
                    .catch((error) => {
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

    const handleSave = () => {
        setErrorMessage("")
        if (endDateTime <= startDateTime) {
            setErrorMessage("End time should be greater than start time")
        } else {
            let api = new API();
            api.setAuthorizationToken(localStorage.access_token)
            api
            .post(`${ENDPOINT}/availability/new`, {
                startDateTime,
                endDateTime
            })
            .then((data) => {
                setErrorMessage("")
                getAvailability()
                setOpen(false)
            })
            .catch((error) => {
                if (error && error.data && error.data.error === "token_expired") {
                    if(localStorage.refresh_token) {
                        api
                        .refreshToken()
                        .then(() => {
                            api.setAuthorizationToken(localStorage.access_token)
                            api
                            .post(`${ENDPOINT}/availability/new`, {
                                startDateTime,
                                endDateTime
                            })
                            .then((data) => {
                                setErrorMessage("")
                                getAvailability()
                                setOpen(false)
                            })
                            .catch((error) => {
                                if (error && error.data && error.data.message) {
                                    setErrorMessage(error.data.message)
                                } else {
                                    setErrorMessage("An error occurred")
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
                    setErrorMessage(error.data.message)
                } else {
                    setErrorMessage("An error occurred")
                }
            })
        }
    }

    return (
        <div style={{height: "100%", backgroundColor: COLORS.WHITE, padding: "30px 30px"}}>
            <div style={{display: "flex", justifyContent: "space-between"}}>
                <Typography variant="h4" style={{marginLeft: "10px"}}>
                    Available time
                </Typography>
                <Button variant="outlined" size="large" style={{marginRight: "10px"}} onClick={() => {setOpen(true)}}>
                    Add Availability
                </Button>
            </div>
            <Dialog onClose={() => {setOpen(false)}} open={open}>
                <div style={{padding: "20px"}}>
                    <div style={{display: "flex", justifyContent: "center"}}>
                        <DialogTitle id="dialog-title">New Availability</DialogTitle>
                    </div>
                    <div style={{display: "flex", justifyContent: "center"}}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <TimePicker label="Start Time" value={startDateTime} onChange={setStartDateTime} views={["hours"]} />
                            <TimePicker label="End Time" value={endDateTime} onChange={setEndDateTime} views={["hours"]} />
                        </MuiPickersUtilsProvider>
                    </div>
                    <div style={{display: "flex", justifyContent: "center"}}>
                        { errorMessage && <h3 style={{color: "red", maxWidth: "300px", wordWrap: "break-word", marginTop: "10px", justifyContent: "center"}}>{errorMessage}</h3>}
                    </div>
                    <div style={{display: "flex", justifyContent: "center"}}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            className={classes.save_button}
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </Dialog>
            <div style={{marginTop : "10px"}} /> 
            <TableContainer component={Paper}>
                <Table className={classes.table} >
                    <TableHead>
                        <TableCell align="center">Start Time</TableCell>
                        <TableCell align="center">End Time</TableCell>
                        <TableCell></TableCell>
                    </TableHead>
                    <TableBody>
                        {
                            availabilities.map((availability) => 
                                <TableRow key={1}>
                                    <TableCell align="center">{String(availability.startDateTime.getHours()).padStart(2, '0')}:{String(availability.startDateTime.getMinutes()).padStart(2, '0')}</TableCell>
                                    <TableCell align="center">{String(availability.endDateTime.getHours()).padStart(2, '0')}:{String(availability.endDateTime.getMinutes()).padStart(2, '0')}</TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            className={classes.delete_button}
                                            startIcon={<DeleteIcon />}
                                            onClick={() => {handleDelete(availability.id)}}
                                        >
                                            Delete
                                        </Button>
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

export default observer(Availability);