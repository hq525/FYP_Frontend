import React, { useState } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react";
import { Grid, Typography, Button, TextField, Select, MenuItem, FormControl, Divider } from "@material-ui/core";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import NavBar from "../NavBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ENDPOINT, COLORS, MAX_FILE_SIZE } from "../utils/config";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import 'antd/dist/antd.css';
import { InputNumber } from 'antd';
import Dropzone from 'react-dropzone'
import API from "../utils/API";

const Profile = (props) => {
    const [edit, setEdit] = useState(false);
    const [firstName, setFirstName] = useState(userStore.user.firstName);
    const [lastName, setLastName] = useState(userStore.user.lastName);
    const [email, setEmail] = useState(userStore.user.email);
    const [birthday, setBirthday] = useState(new Date(userStore.user.birthday))
    const [householdIncome, setHouseholdIncome] = useState(userStore.user.income)
    const [householdType, setHouseholdType] = useState(userStore.user.householdType)
    const [addressLine1, setAddressLine1] = useState(userStore.user.addressLine1)
    const [addressLine2, setAddressLine2] = useState(userStore.user.addressLine2)
    const [addressPostalCode, setAddressPostalCode] = useState(userStore.user.addressPostalCode)
    const [picture, setPicture] = useState(userStore.user.picture)

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setPicture(acceptedFiles[0])
        }
    }

    const handleUpdate = (e) => {
        e.preventDefault()
        if (householdType === "") {
            props.setError("Please select a household type")
        } else {
            let api = new API();
            api.setAuthorizationToken(localStorage.access_token)
            api
            .post(`${ENDPOINT}/edit/user`, {
                "firstName": firstName,
                "lastName": lastName,
                "email": email,
                "birthday": `${birthday.getFullYear().toString().padStart(4,'0')}-${(birthday.getMonth()+1).toString().padStart(2, '0')}-${birthday.getDate().toString().padStart(2,'0')}`,
                "income": householdIncome,
                "householdType": householdType,
                "addressLine1" : addressLine1,
                "addressLine2" : addressLine2,
                "addressPostalCode": addressPostalCode
            })
            .then((data) => {
                userStore.setUser({
                    id : userStore.user.id,
                    firstName,
                    lastName,
                    email,
                    birthday : `${birthday.getFullYear().toString().padStart(4,'0')}-${(birthday.getMonth()+1).toString().padStart(2, '0')}-${birthday.getDate().toString().padStart(2,'0')}`,
                    income : householdIncome,
                    picture,
                    householdType,
                    addressLine1,
                    addressLine2,
                    addressPostalCode
                })
                setEdit(false)
            })
            .catch((error) => {
                if (error && error.data && error.data.error === "token_expired") {
                    if(localStorage.refresh_token) {
                        api
                        .refreshToken()
                        .then(() => {
                            api.setAuthorizationToken(localStorage.access_token)
                            api
                            .post(`${ENDPOINT}/edit/user`, {
                                "firstName": firstName,
                                "lastName": lastName,
                                "email": email,
                                "birthday": `${birthday.getFullYear().toString().padStart(4,'0')}-${(birthday.getMonth()+1).toString().padStart(2, '0')}-${birthday.getDate().toString().padStart(2,'0')}`,
                                "income": householdIncome,
                                "householdType": householdType,
                                "addressLine1": addressLine1,
                                "addressLine2": addressLine2,
                                "addressPostalCode": addressPostalCode
                            })
                            .then((data) => {
                                userStore.setUser({
                                    id : userStore.user.id,
                                    firstName,
                                    lastName,
                                    email,
                                    birthday,
                                    income : householdIncome,
                                    picture,
                                    householdType,
                                    addressLine1,
                                    addressLine2,
                                    addressPostalCode
                                })
                                setEdit(false)
                            })
                            .catch((error) => {
                                props.setError("An error occurred")
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
                    props.setError("An error occurred")
                }
            })
        }
    }

    if (edit) {
        return (
            <div style={{height: "100%", backgroundColor: COLORS.WHITE}}>
                <NavBar {...props}  />
                <div style={{marginTop: '20px'}} />
                <Grid container>
                    <Grid item sm={12} lg={12} md={12} xs={12} style={{display: 'flex', justifyContent: 'flex-start'}}>
                        <span style={{paddingLeft: '20px', cursor: 'pointer'}} onClick={() => {setEdit(false)}}><ArrowBackIcon style={{fontSize: '100px'}} /></span>
                    </Grid>
                    <Grid item lg={3} md={3} sm={3} xs={3} >
                        <Typography style={{color: COLORS.GREEN, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h3">
                            <b>First Name</b>
                        </Typography>
                    </Grid>
                    <Grid item lg={9} md={9} sm={9} xs={9}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="firstName"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => {setFirstName(e.target.value)}}
                        />
                    </Grid>
                    <Grid item lg={3} md={3} sm={3} xs={3} >
                        <Typography style={{color: COLORS.GREEN, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h3">
                            <b>Last Name</b>
                        </Typography>
                    </Grid>
                    <Grid item lg={9} md={9} sm={9} xs={9}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="lastName"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => {setLastName(e.target.value)}}
                        />
                    </Grid>
                    <Grid item lg={3} md={3} sm={3} xs={3} >
                        <Typography style={{color: COLORS.GREEN, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h3">
                            <b>Email</b>
                        </Typography>
                    </Grid>
                    <Grid item lg={9} md={9} sm={9} xs={9}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="email"
                            id="email"
                            value={email}
                            onChange={(e) => {setEmail(e.target.value)}}
                        />
                    </Grid>
                    <Grid item lg={3} md={3} sm={3} xs={3} >
                        <Typography style={{color: COLORS.GREEN, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h3">
                            <b>Birthday</b>
                        </Typography>
                    </Grid>
                    <Grid item lg={9} md={9} sm={9} xs={9}>
                        <DatePicker selected={birthday} maxDate={new Date()} showYearDropdown minDate={new Date(1900,1,1)} onChange={date => setBirthday(date)} />
                    </Grid>
                    <Grid item lg={3} md={3} sm={3} xs={3} >
                        <Typography style={{color: COLORS.GREEN, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h3">
                            <b>Household Income</b>
                        </Typography>
                    </Grid>
                    <Grid item lg={9} md={9} sm={9} xs={9} style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                        <InputNumber min={0} value={householdIncome} onChange={(value) => {setHouseholdIncome(value)}} />
                    </Grid>
                    <Grid item lg={3} md={3} sm={3} xs={3} >
                        <Typography style={{color: COLORS.GREEN, paddingLeft: '20px', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} variant="h3">
                            <b>Household Type</b>
                        </Typography>
                    </Grid>
                    <Grid item lg={9} md={9} sm={9} xs={9} style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                        <FormControl margin="normal" variant="outlined">
                            <Select
                            id="householdType"
                            value={householdType}
                            onChange={(e) => {setHouseholdType(e.target.value)}}
                            >
                                <MenuItem value=""><em>Please Select</em></MenuItem>
                                <MenuItem value="Condominium">Condominium</MenuItem>
                                <MenuItem value="HDB">HDB</MenuItem>
                                <MenuItem value="Terrace House">Terrace House</MenuItem>
                                <MenuItem value="Bungalow">Bungalow</MenuItem>
                                <MenuItem value="Semi-Detached">Semi-Detached</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <div style={{padding: "10px 20px"}}>
                    <Typography style={{color: COLORS.GREEN}} variant="h4" align="center">
                        Address
                    </Typography>
                    <div style={{marginTop: "10px"}}></div>
                    <Divider variant="middle" />
                </div>
                <div style={{marginTop: "10px"}}></div>
                <div style={{padding: "10px 20px"}}>
                    <div style={{display: 'flex', flexDirection: 'column', marginLeft: "10px", marginRight: "10px"}}>
                        <Typography component="h1" variant="h5" align="left">
                            Address Line 1
                        </Typography>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="addressLine1"
                            id="addressLine1"
                            value={addressLine1}
                            onChange={(e) => {setAddressLine1(e.target.value)}}
                        />
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', marginLeft: "10px", marginRight: "10px"}}>
                        <Typography component="h1" variant="h5" align="left">
                            Address Line 2
                        </Typography>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="addressLine2"
                            id="addressLine2"
                            value={addressLine2}
                            onChange={(e) => {setAddressLine2(e.target.value)}}
                        />
                    </div>
                </div>
                <Grid container style={{padding: "10px 20px"}}>
                    <Grid item lg={6} md = {6} sm = {6} xs={6}>
                        <div style={{display: 'flex', flexDirection: 'column', marginLeft: "10px", marginRight: "10px"}}>
                            <Typography component="h1" variant="h5" align="left">
                                Postal Code
                            </Typography>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                name="addressPostalCode"
                                id="addressPostalCode"
                                value={addressPostalCode}
                                onChange={(e) => {setAddressPostalCode(e.target.value)}}
                            />
                        </div>
                    </Grid>
                </Grid>
                <div style={{marginTop: "10px"}}></div>
                <Typography component="h1" variant="h4" align="center">
                    Profile Picture
                </Typography>
                <div style={{marginTop: "10px"}}></div>
                <Divider variant="middle" />
                <div style={{marginTop: "10px"}}></div>
                <Dropzone multiple={false} accept="image/*" onDrop={onDrop} minSize={0} maxSize={MAX_FILE_SIZE}>
                    {({getRootProps, getInputProps, isDragActive, isDragReject, rejectedFiles}) => {
                        const isFileTooLarge = rejectedFiles ? (rejectedFiles.length > 0 && rejectedFiles[0].size > MAX_FILE_SIZE) : false;
                        return (
                            <section>
                            <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                {isDragActive ? (!isDragReject && "Drop file here!") : (picture ? (picture.name) : ('Click here or drop a file to upload!'))}
                                {isDragReject && "File type not accepted, sorry!"}
                                {isFileTooLarge && (
                                    <div className="text-danger mt-2">
                                    File is too large.
                                    </div>
                                )}

                            </div>
                            </section>
                        )
                    }}
                </Dropzone>
                <div style={{marginTop: '20px'}} />
                <Button
                type="submit"
                fullWidth
                variant="contained"
                style={{
                    borderRadius: 20,
                    backgroundColor: COLORS.GREEN,
                    padding: "18px 36px",
                    fontSize: "18px",
                    color: COLORS.WHITE,
                    marginLeft : '10px',
                    maxWidth: '200px'
                }}
                onClick={handleUpdate}
                >
                    Update
                </Button>
                <div style={{paddingTop: "50px"}}></div>
            </div>
        )
    } else {
        return (
            <div style={{height: "100%", backgroundColor: COLORS.WHITE}}>
                <NavBar {...props}  />
                <div style={{marginTop: '20px'}} />
                <Grid container>
                    <Grid item lg={3} md={3} sm={12} xs={12}>
                        <AccountCircleIcon style={{fontSize: '200px'}} />
                    </Grid>
                    <Grid item lg={9} md={9} sm={12} xs={12}>
                        <Typography style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '20px'}} variant="h2">
                            <b>{`${userStore.user.firstName} ${userStore.user.lastName}`}</b>
                        </Typography>
                    </Grid>
                </Grid>
                <div style={{marginTop: '20px'}} />
                <Grid container>
                    <Grid item lg={3} md={3} sm={3} xs={3} style={{display: 'flex', justifyContent: 'flex-start'}}>
                        <Typography style={{color: COLORS.GREEN, paddingLeft: '20px'}} variant="h3">
                            <b>Email</b>
                        </Typography>
                    </Grid>
                    <Grid item lg={9} md={9} sm={9} xs={9} style={{display: 'flex', justifyContent: 'flex-start'}}>
                        <Typography style={{color: COLORS.BLACK, paddingLeft: '20px'}} variant="h3">
                            <b>{userStore.user.email}</b>
                        </Typography>
                    </Grid>
                    <Grid item lg={3} md={3} sm={3} xs={3} style={{display: 'flex', justifyContent: 'flex-start', marginTop: '40px'}}>
                        <Typography style={{color: COLORS.GREEN, paddingLeft: '20px'}} variant="h3">
                            <b>Address</b>
                        </Typography>
                    </Grid>
                    <Grid item lg={9} md={9} sm={9} xs={9} style={{display: 'flex', justifyContent: 'flex-start', marginTop: '40px'}}>
                        <Typography style={{color: COLORS.BLACK, paddingLeft: '20px', display: 'flex', justifyContent: 'flex-start'}} variant="h3">
                            <b style={{textAlign: "left"}}>{`${userStore.user.addressLine1}, ${userStore.user.addressLine2}, Singapore ${userStore.user.addressPostalCode}`}</b>
                        </Typography>
                    </Grid>
                    <Grid item lg={3} md={3} sm={3} xs={3} style={{display: 'flex', justifyContent: 'flex-start', marginTop: '40px'}}>
                        <Typography style={{color: COLORS.GREEN, paddingLeft: '20px'}} variant="h3">
                            <b>Birthday</b>
                        </Typography>
                    </Grid>
                    <Grid item lg={9} md={9} sm={9} xs={9} style={{display: 'flex', justifyContent: 'flex-start', marginTop: '40px'}}>
                        <Typography style={{color: COLORS.BLACK, paddingLeft: '20px'}} variant="h3">
                            <b>{userStore.user.birthday}</b>
                        </Typography>
                    </Grid>
                    <Grid item lg={3} md={3} sm={3} xs={3} style={{display: 'flex', justifyContent: 'flex-start', marginTop: '40px'}}>
                        <Typography style={{color: COLORS.GREEN, paddingLeft: '20px'}} variant="h3">
                            <b>Household Income</b>
                        </Typography>
                    </Grid>
                    <Grid item lg={9} md={9} sm={9} xs={9} style={{display: 'flex', justifyContent: 'flex-start', marginTop: '40px'}}>
                        <Typography style={{color: COLORS.BLACK, paddingLeft: '20px'}} variant="h3">
                            <b>${userStore.user.income}</b>
                        </Typography>
                    </Grid>
                    <Grid item lg={3} md={3} sm={3} xs={3} style={{display: 'flex', justifyContent: 'flex-start', marginTop: '40px'}}>
                        <Typography style={{color: COLORS.GREEN, paddingLeft: '20px'}} variant="h3">
                            <b>Household Type</b>
                        </Typography>
                    </Grid>
                    <Grid item lg={9} md={9} sm={9} xs={9} style={{display: 'flex', justifyContent: 'flex-start', marginTop: '40px'}}>
                        <Typography style={{color: COLORS.BLACK, paddingLeft: '20px'}} variant="h3">
                            <b>{userStore.user.householdType}</b>
                        </Typography>
                    </Grid>
                </Grid>
                <div style={{marginTop: '20px'}} />
                <Button
                type="submit"
                fullWidth
                variant="contained"
                style={{
                    borderRadius: 20,
                    backgroundColor: COLORS.GREEN,
                    padding: "18px 36px",
                    fontSize: "18px",
                    color: COLORS.WHITE,
                    marginLeft : '10px',
                    maxWidth: '200px'
                }}
                onClick={() => {
                    setEdit(true);
                }}
                >
                Edit
                </Button>
            </div>
        )
    }
}

export default observer(Profile);