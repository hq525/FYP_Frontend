import React, { useState } from 'react';
import { userStore } from "../../index";
import { observer } from "mobx-react"
import { COLORS } from '../../utils/config'
import { makeStyles, createMuiTheme, ThemeProvider  } from '@material-ui/core/styles';
import {
    AppBar,
    Toolbar,
    List,
    ListItem,
    ListItemText,
    Grid,
    Button
} from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import "./Map.css"

const useStyles = makeStyles((theme) => ({
    grow: {
      flexGrow: 1,
    },
  }));

  const Theme = {
    palette: {
      primary: {
        main: COLORS.WHITE
      },
      secondary: {
        main: COLORS.LIGHT_BLUE
      }
    }
  };

const MapTable = (props) => {
    const classes = useStyles();
    const theme = createMuiTheme(Theme);
    return (
        <div style={{ height: '100%', width: '100%' }}>
            <div style={{height: '40%', width: '100%'}}>
                <div className={classes.grow}>
                    <ThemeProvider theme={theme}>
                        <AppBar color={"secondary"} position="static">
                            <Toolbar>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDatePicker
                                        disableToolbar
                                        variant="inline"
                                        format="MM/dd/yyyy"
                                        margin="normal"
                                        id="date-picker-inline"
                                        value={props.selectedDate}
                                        onChange={props.handleDateChange}
                                        KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                        }}
                                    />
                                </MuiPickersUtilsProvider>
                                <div className={classes.grow} />
                            </Toolbar>
                        </AppBar>
                    </ThemeProvider>
                    <List style={{padding: "0px 0px"}} aria-label="marker list">
                        {
                            props.users.map((user) => 
                                <ListItem
                                button
                                onMouseEnter={() => {props.handleListHoverOver(user.user.id)}}
                                onMouseLeave={() => {props.handleListHoverLeave()}}
                                selected={props.selectedListItemIndex === user.user.id}
                                onClick={event => props.handleListItemClick(user.user.id)}
                                className={props.hoverListItemID === user.user.id ? "Mui-focusVisible" : null}
                                >
                                    <ListItemText primary={user.user.addressLine1} />
                                    <Button onClick={() => {props.handleSelectDonor(user.user.id)}} variant="contained" color="primary" disableElevation>
                                        Donor
                                    </Button>
                                    <Button onClick={() => {props.handleSelectBeneficiary(user.user.id)}} style={{marginLeft: "5px"}} variant="contained" color="primary" disableElevation>
                                        Beneficiary
                                    </Button>
                                </ListItem>
                            )
                        }
                    </List>
                </div>
            </div>
            <div style={{width: '100%', height: '50%', display: "flex", justifyContent: "space-between", flexDirection: "column"}}>
                <Grid container>
                    <Grid item lg={6} md={6} sm={6} xs={6}>
                        <h1>Donor</h1>
                        <h2>Address</h2>
                        <h4>{props.donor.address ? props.donor.address : ""}</h4>
                    </Grid>
                    <Grid item lg={6} md={6} sm={6} xs={6}>
                        <h1>Beneficiary</h1>
                        <h2>Address</h2>
                        <h4>{props.beneficiary.address ? props.beneficiary.address : ""}</h4>
                    </Grid>
                </Grid>
                    {props.item && <div>{`${props.item} X ${props.quantity}`}</div>}
                <div style={{height: "40px", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "10px"}}>
                        <Button disabled={props.donor.id && props.beneficiary.id ? false : true} onClick={()=> {props.setOpen(true)}} variant="outlined" color="primary">Select Time/Item</Button>
                </div>
            </div>
            <div style={{width: '100%', height: '10%'}}>
                <Button variant="outlined" color="primary" disabled={props.item ? false : true} onClick={props.handleConfirm}>
                    Confirm
                </Button>
            </div>
        </div>
    )
}

export default observer(MapTable);