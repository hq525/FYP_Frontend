import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react";
import API from "../utils/API"
import { ENDPOINT, COLORS } from "../utils/config";
import { 
    CircularProgress, 
    Grid,
    Button,
    Typography,
    Divider,
    FormControl,
    Select,
    MenuItem,
    Slider
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { 
    TimePicker,
    MuiPickersUtilsProvider
} from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns';

const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }));

const Allocation = (props) => {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [day, setDay]  = useState("Monday");
    const [householdStatusImportance, setHouseholdStatusImportance] = useState(50);
    const [requestedQuantityImportance, setRequestedQuantityImportance] = useState(50);
    const [volunteerWorkImportance, setVolunteerWorkImportance] = useState(50)
    const [runtime, setRuntime] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 8, 0, 0, 0))
    useEffect(() => {

    }, []);
    if (loading) {
        return (
            <div style={{width: "100%", height: "80%", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <CircularProgress size={100} />
                </div>
        )
    } else {
        return(
            <div style={{height: "auto", backgroundColor: COLORS.WHITE}}>
                <div style={{marginTop: "20px"}}></div>
                <Grid container>
                    <Grid item lg={4} md={4} sm={4} xs={4} style={{display: "flex", alignItems: "center", justifyContent: "flex-start"}}>
                        <Button style={{marginLeft: "80px"}} variant="outlined" size="large" onClick={props.onMenuButtonClick}>
                            Menu
                        </Button>
                    </Grid>
                    <Grid item lg={4} md={4} sm={4} xs={4} style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        
                    </Grid>
                    <Grid item lg={4} md={4} sm={4} xs={4}>
                        
                    </Grid>
                </Grid>
                <div style={{marginTop: "20px"}} />
                <div style={{paddingLeft: "80px", paddingRight: "40px", display: "flex", alignItems: "flex-start", flexDirection: "column"}}>
                    <Typography variant="h4" style={{textAlign: 'left', color: COLORS.BLUE}}>
                        <b>Schedule Allocation</b>
                    </Typography>
                    <div style={{width: "50%", borderTopStyle: "solid", borderWidth: "1px", borderColor: "grey"}} />
                    <div style={{marginTop: "10px"}} />
                    <Typography variant="h5" style={{textAlign: 'left', color: COLORS.BLUE}}>
                        Run Every
                    </Typography>
                    <FormControl variant="outlined" className={classes.formControl}>
                        <Select
                        labelId="dow-label"
                        id="dow"
                        value={day}
                        onChange={(event) => {setDay(event.target.value)}}
                        >
                        <MenuItem value={"Monday"}>Monday</MenuItem>
                        <MenuItem value={"Tuesday"}>Tuesday</MenuItem>
                        <MenuItem value={"Wednesday"}>Wednesday</MenuItem>
                        <MenuItem value={"Thursday"}>Thursday</MenuItem>
                        <MenuItem value={"Friday"}>Friday</MenuItem>
                        <MenuItem value={"Saturday"}>Saturday</MenuItem>
                        <MenuItem value={"Sunday"}>Sunday</MenuItem>
                        </Select>
                    </FormControl>
                    <div style={{marginTop: "10px"}} />
                    <Typography variant="h5" style={{textAlign: 'left', color: COLORS.BLUE}}>
                        At
                    </Typography>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <TimePicker value={runtime} onChange={setRuntime} views={["hours"]} />
                    </MuiPickersUtilsProvider>
                    <div style={{marginTop: "10px"}} />
                    <div>
                        <Button variant="contained" color="primary">
                            Schedule
                        </Button>
                        <Button style={{marginLeft: "5px"}} variant="contained" color="primary">
                            Run Now
                        </Button>
                    </div>
                    <div style={{marginTop: "40px"}} />
                    <Typography variant="h4" style={{textAlign: 'left', color: COLORS.BLUE}}>
                        <b>Importance Adjustment</b>
                    </Typography>
                    <div style={{width: "50%", borderTopStyle: "solid", borderWidth: "1px", borderColor: "grey"}} />
                    <div style={{marginTop: "10px"}} />
                    <Typography variant="h5" style={{textAlign: 'left', color: COLORS.BLUE}}>
                        Household status
                    </Typography>
                    <Grid container>
                        <Grid xs={10} sm={10} md={10} lg={10}>
                            <Slider value={householdStatusImportance} onChange={(event, newValue) => {setHouseholdStatusImportance(newValue)}} />
                        </Grid>
                        <Grid xs={2} sm={2} md={2} lg={2}>
                            {householdStatusImportance}%  
                        </Grid> 
                    </Grid>
                    <Typography variant="h5" style={{textAlign: 'left', color: COLORS.BLUE}}>
                        Requested Quantity
                    </Typography>
                    <Grid container>
                        <Grid xs={10} sm={10} md={10} lg={10}>
                            <Slider value={requestedQuantityImportance} onChange={(event, newValue) => {setRequestedQuantityImportance(newValue)}} />
                        </Grid>
                        <Grid xs={2} sm={2} md={2} lg={2}>
                            {requestedQuantityImportance}%  
                        </Grid> 
                    </Grid>
                    <Typography variant="h5" style={{textAlign: 'left', color: COLORS.BLUE}}>
                        Volunteer Work
                    </Typography>
                    <Grid container>
                        <Grid xs={10} sm={10} md={10} lg={10}>
                            <Slider value={volunteerWorkImportance} onChange={(event, newValue) => {setVolunteerWorkImportance(newValue)}} />
                        </Grid>
                        <Grid xs={2} sm={2} md={2} lg={2}>
                            {volunteerWorkImportance}%  
                        </Grid> 
                    </Grid>
                    <Button variant="contained" color="primary">
                        Save
                    </Button>
                </div>
            </div>
        )
    }
}

export default observer(Allocation)