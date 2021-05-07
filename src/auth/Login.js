import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, TextField, Checkbox, Paper, Grid, Typography, FormControlLabel, Divider, FormControl, Select, MenuItem} from '@material-ui/core';
import { observer } from 'mobx-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Dropzone from 'react-dropzone'
import { userStore } from '../index';
import { ENDPOINT, COLORS, MAX_FILE_SIZE } from "../utils/config";
import API from "../utils/API";
import 'antd/dist/antd.css';
import { InputNumber } from 'antd';

const useStyles = makeStyles((theme) => ({
    paper: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
      padding: theme.spacing(2),
      [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
        marginTop: theme.spacing(6),
        marginBottom: theme.spacing(6),
        padding: theme.spacing(3),
      },
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(3),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  }));

const Login = () => {
    const classes = useStyles({});
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [forgetPassword, setForgetPassword] = useState(false);
    const [register, setRegister] = useState(false);

    // Register
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
    const [birthday, setBirthday] = useState(new Date());
    const [householdIncome, setHouseholdIncome] = useState(0);
    const [householdCount, setHouseholdCount] = useState(1);
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [addressPostalCode, setAddressPostalCode] = useState('');
    const [householdType, setHouseholdType] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [picture, setPicture] = useState(null)

    // Forget Password
    const [sentPin, setSentPin] = useState(false);
    const [pinEmail, setPinEmail] = useState('');
    const [pin, setPin] = useState('');

    const handleChange = (e ) => {
        switch (e.target.name) {
          case 'email':
            setEmail(e.target.value);
            break;
          case 'password':
            setPassword(e.target.value);
            break;
        case 'registerEmail':
            setRegisterEmail(e.target.value);
            break;
        case 'registerPassword':
            setRegisterPassword(e.target.value);
            break;
        case 'registerConfirmPassword':
            setRegisterConfirmPassword(e.target.value);
            break;
        case 'addressLine1':
            setAddressLine1(e.target.value);
            break;
        case 'addressLine2':
            setAddressLine2(e.target.value);
            break;
        case 'addressPostalCode':
            setAddressPostalCode(e.target.value);
            break;
        case 'pinEmail':
            setPinEmail(e.target.value);
            break;
        case 'pin':
            setPin(e.target.value);
            break;
        case 'firstName':
            setFirstName(e.target.value);
            break;
        case 'lastName':
            setLastName(e.target.value);
            break;
        default:
            return;
        }
      }

    const handleLogin = (e) => {
        e.preventDefault();
        setErrorMessage("");
        let api = new API();
        api
        .post(`${ENDPOINT}/login`, {email, password})
        .then((data) => {
            localStorage.access_token = data.access_token
            if (remember) {
                localStorage.refresh_token = data.refresh_token
            } else {
                localStorage.removeItem('refresh_token');
            }
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/user`)
            .then((data) => {
                userStore.setUser(data.user);
                userStore.setAuthenticated(true);
            })
            .catch(err => {
                if(err.data && err.data.message) {
                  setErrorMessage(err.data.message);
                } else {
                  setErrorMessage("An error occurred")
                }
            });
        })
        .catch(err => {
            if(err.data && err.data.message) {
              setErrorMessage(err.data.message);
            } else {
              setErrorMessage("An error occurred")
            }
        });
    }
    const handleRegister = (e) => {
        e.preventDefault();
        setErrorMessage("");
        if (registerPassword !== registerConfirmPassword) {
            setErrorMessage("Passwords do not match");
        } 
        else if (householdType === "") {
            setErrorMessage("Please select a household type");
        } else {
            let api = new API();
            api
            .post(`${ENDPOINT}/register`, {
                email : registerEmail,
                password : registerPassword,
                firstName : firstName,
                lastName : lastName,
                birthday : `${birthday.getFullYear().toString().padStart(4,'0')}-${(birthday.getMonth()+1).toString().padStart(2, '0')}-${birthday.getDate().toString().padStart(2,'0')}`,
                income : householdIncome,
                householdCount,
                householdType: householdType,
                addressLine1: addressLine1,
                addressLine2: addressLine2,
                addressPostalCode: addressPostalCode
            })
            .then((data) => {
                setErrorMessage("Profile created successfully. Please login.");
                setForgetPassword(false);
                setRegister(false);
            })
            .catch((err) => {
                if(err.data && err.data.message) {
                    setErrorMessage(err.data.message);
                } else {
                    setErrorMessage("An error occurred")
                }
            })
        }
    }

    const handlePinLogin = (e) => {
        e.preventDefault();
        setErrorMessage("");
        let api = new API();
        api
        .post(`${ENDPOINT}/pin/login`, {
            email : pinEmail,
            pin : pin
        })
        .then((data) => {
            localStorage.access_token = data.access_token
            if (remember) {
                localStorage.refresh_token = data.refresh_token
            } else {
                localStorage.removeItem('refresh_token');
            }
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/user`)
            .then((data) => {
                userStore.setUser(data.user);
                userStore.setAuthenticated(true);
            })
            .catch(err => {
                if(err.data && err.data.message) {
                  setErrorMessage(err.data.message);
                } else {
                  setErrorMessage("An error occurred")
                }
            });
        })
        .catch(err => {
            if(err.data && err.data.message) {
              setErrorMessage(err.data.message);
            } else {
              setErrorMessage("An error occurred")
            }
        });
    }

    const handleSendPin = (e) => {
        e.preventDefault();
        setErrorMessage("");
        let api = new API();
        api
        .post(`${ENDPOINT}/forget/password`, {
            email : pinEmail
        })
        .then((data) => {
            setSentPin(true);
            setErrorMessage("Pin sent to specified email. Please check your inbox and key in the pin number.")
        })
        .catch((err) => {
            if(err.data && err.data.message) {
                setErrorMessage(err.data.message);
            } else {
                setErrorMessage("An error occurred")
            }
        })
    }

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setPicture(acceptedFiles[0])
        }
    }

    if (register) {
        return (
            <div style={{backgroundColor: '#D3E3FC', paddingTop: '50px', paddingBottom: '50px', display : 'flex', justifyContent: 'center'}}>
                <Paper className={classes.paper} style={{width: "50%", border: "1px solid black", borderRadius: "25px"}}>
                    <Typography component="h1" variant="h4" align="center">
                        <b>Register</b>
                    </Typography>
                    <Grid container>
                        <Grid item lg={4} md={4} sm={4} xs={4} style={{display:"flex", alignItems: "center"}}>
                            <div style={{width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                            <Typography component="h1" variant="h4" align="left">
                                First Name:
                            </Typography>
                            </div>
                        </Grid>
                        <Grid item lg={8} md={8} sm={8} xs={8}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                name="firstName"
                                id="firstName"
                                value={firstName}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item lg={4} md={4} sm={4} xs={4} style={{display:"flex", alignItems: "center"}}>
                            <div style={{width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                            <Typography component="h1" variant="h4" align="left">
                                Last Name:
                            </Typography>
                            </div>
                        </Grid>
                        <Grid item lg={8} md={8} sm={8} xs={8}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                name="lastName"
                                id="lastName"
                                value={lastName}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item lg={4} md={4} sm={4} xs={4} style={{display:"flex", alignItems: "center"}}>
                            <div style={{width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                            <Typography component="h1" variant="h4" align="left">
                                Email:
                            </Typography>
                            </div>
                        </Grid>
                        <Grid item lg={8} md={8} sm={8} xs={8}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                name="registerEmail"
                                id="registerEmail"
                                value={registerEmail}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item lg={4} md={4} sm={4} xs={4} style={{display:"flex", alignItems: "center"}}>
                            <div style={{width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                            <Typography component="h1" variant="h4" align="left">
                                Password:
                            </Typography>
                            </div>
                        </Grid>
                        <Grid item lg={8} md={8} sm={8} xs={8}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                name="registerPassword"
                                type="password"
                                id="registerPassword"
                                value={registerPassword}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item lg={4} md={4} sm={4} xs={4} style={{display:"flex", alignItems: "center"}}>
                            <div style={{width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                            <Typography component="h1" variant="h4" align="left">
                                Confirm Password:
                            </Typography>
                            </div>
                        </Grid>
                        <Grid item lg={8} md={8} sm={8} xs={8}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                name="registerConfirmPassword"
                                type="password"
                                id="registerConfirmPassword"
                                value={registerConfirmPassword}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item lg={4} md={4} sm={4} xs={4} style={{display:"flex", alignItems: "center"}}>
                            <div style={{width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                            <Typography component="h1" variant="h4" align="left">
                                Birthday:
                            </Typography>
                            </div>
                        </Grid>
                        <Grid item lg={8} md={8} sm={8} xs={8} style={{display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                            <DatePicker selected={birthday} maxDate={new Date()} showYearDropdown minDate={new Date(1900,1,1)} onChange={date => setBirthday(date)} />
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item lg={4} md={4} sm={4} xs={4} style={{display:"flex", alignItems: "center"}}>
                            <div style={{width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                                <Typography component="h1" variant="h4" align="left">
                                    Household Income:
                                </Typography>
                            </div>
                        </Grid>
                        <Grid item lg={8} md={8} sm={8} xs={8} style={{display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                            <InputNumber min={0} value={householdIncome} onChange={(value) => {setHouseholdIncome(value)}} />
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item lg={4} md={4} sm={4} xs={4} style={{display:"flex", alignItems: "center"}}>
                            <div style={{width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                                <Typography component="h1" variant="h4" align="left">
                                    Household Member Count:
                                </Typography>
                            </div>
                        </Grid>
                        <Grid item lg={8} md={8} sm={8} xs={8} style={{display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                            <InputNumber min={0} value={householdCount} onChange={(value) => {setHouseholdCount(value)}} />
                        </Grid>
                    </Grid>
                    <div style={{marginTop: "10px"}}></div>
                    <Typography component="h1" variant="h4" align="center">
                        Upload Profile Picture (Optional)
                    </Typography>
                    <div style={{marginTop: "10px"}}></div>
                    <Divider variant="middle" />
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
                    <div style={{marginTop: "10px"}}></div>
                    <Typography component="h1" variant="h4" align="center">
                        Address
                    </Typography>
                    <div style={{marginTop: "10px"}}></div>
                    <Divider variant="middle" />
                    <div style={{marginTop: "10px"}}></div>
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
                            onChange={handleChange}
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
                            onChange={handleChange}
                        />
                    </div>
                    <Grid container>
                        <Grid item lg={5} md={5} sm={5} xs={5}>
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
                                    onChange={handleChange}
                                />
                            </div>
                        </Grid>
                        <Grid item lg={7} md={7} sm={7} xs={7}>
                            <div style={{display: 'flex', flexDirection: 'column', marginLeft: "10px", marginRight: "10px"}}>
                                <Typography component="h1" variant="h5" align="left">
                                    Household Type
                                </Typography>
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
                            </div>
                        </Grid>
                    </Grid>
                    { errorMessage && <h3 style={{color: "red"}}>{errorMessage}</h3>}
                    <div style={{marginTop: "10px"}}></div>
                    <Grid container justify="space-between" alignItems="center">
                        <Grid item >
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
                                marginLeft : '10px'
                            }}
                            onClick={() => {
                                setErrorMessage("");
                                setForgetPassword(false);
                                setRegister(false);
                            }}
                            >
                            Back
                            </Button>
                        </Grid>
                        <Grid item >
                            <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            style={{
                                borderRadius: 20,
                                backgroundColor: COLORS.BLUE,
                                padding: "18px 36px",
                                fontSize: "18px",
                                color: COLORS.WHITE
                            }}
                            onClick={handleRegister}
                            >
                            Register
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        )
    } else {
        if (forgetPassword) {
            return (
                <div style={{height: "100%", backgroundColor: '#D3E3FC', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Paper className={classes.paper} style={{width: "50%", marginLeft: "50px", marginRight: "50px", border: "1px solid black", borderRadius: "25px"}}>
                        <Typography component="h1" variant="h4" align="center">
                            <b>Forget Password</b>
                        </Typography>
                        <Grid container>
                            <Grid item lg={4} md={4} sm={4} xs={4} style={{display:"flex", alignItems: "center"}}>
                                <div style={{width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                                <Typography component="h1" variant="h4" align="left">
                                    Email:
                                </Typography>
                                </div>
                            </Grid>
                            <Grid item lg={8} md={8} sm={8} xs={8}>
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="pinEmail"
                                    id="pinEmail"
                                    value={pinEmail}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>
                        <Grid container>
                            <Grid item lg={4} md={4} sm={4} xs={4} style={{display:"flex", alignItems: "center"}}>
                                <div style={{width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                                <Typography component="h1" variant="h4" align="left">
                                    Pin:
                                </Typography>
                                </div>
                            </Grid>
                            <Grid item lg={8} md={8} sm={8} xs={8}>
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="pin"
                                    id="pin"
                                    value={pin}
                                    disabled={!sentPin}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>
                        { errorMessage && <h3 style={{color: "red"}}>{errorMessage}</h3>}
                        <div style={{marginTop: "10px"}}></div>
                        <Grid container justify="space-between" alignItems="center">
                            <Grid item >
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
                                    marginLeft : '10px'
                                }}
                                onClick={() => {
                                    setErrorMessage("");
                                    setSentPin(false);
                                    setRegister(false);
                                    setForgetPassword(false);
                                }}
                                >
                                Back
                                </Button>
                            </Grid>
                            <Grid item >
                                {
                                    sentPin ? (
                                        <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        style={{
                                            borderRadius: 20,
                                            backgroundColor: COLORS.BLUE,
                                            padding: "18px 36px",
                                            fontSize: "18px",
                                            color: COLORS.WHITE
                                        }}
                                        onClick={handlePinLogin}
                                        >
                                        Login
                                        </Button>
                                    ) : (
                                        <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        style={{
                                            borderRadius: 20,
                                            backgroundColor: COLORS.BLUE,
                                            padding: "18px 36px",
                                            fontSize: "18px",
                                            color: COLORS.WHITE
                                        }}
                                        onClick={handleSendPin}
                                        >
                                        Send Email
                                        </Button>
                                    )
                                }
                            </Grid>
                        </Grid>
                    </Paper>
                </div>
            )
        } else {
            return(
                <div style={{height: "100%", backgroundColor: '#D3E3FC', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Paper className={classes.paper} style={{width: "50%", marginLeft: "30px", marginRight: "30px", border: "1px solid black", borderRadius: "25px"}}>
                        <Typography component="h1" variant="h4" align="center">
                            Login
                        </Typography>
                        <form className={classes.form} noValidate>
                            <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email"
                                name="email"
                                value={email}
                                autoFocus
                                onChange={handleChange}
                                />
                            </Grid>
                            </Grid>
                            <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                type="password"
                                label="Password"
                                id="password"
                                value={password}
                                onChange={handleChange}
                            />
                            </Grid>
                            <Grid container spacing={2} style={{marginTop: "14px"}}>
                            <FormControlLabel
                            style={{paddingLeft: "8px"}}
                            control={
                                <Checkbox
                                checked={remember}
                                onChange={(event) => {remember ? setRemember(false) : setRemember(true)}}
                                value="primary"
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                                />
                            }
                            label="Remember me"
                            />
                            </Grid>
                            { errorMessage && <h3 style={{color: "red"}}>{errorMessage}</h3>}
                            <Grid container justify="space-between" alignItems="center">
                            <Grid item >
                                <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                className={classes.submit}
                                onClick={() => {
                                    setRegister(true);
                                }}
                                >
                                Register
                                </Button>
                            </Grid>
                            <Grid item >
                                <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={handleLogin}
                                >
                                Login
                                </Button>
                            </Grid>
                            </Grid>
                            <Grid container justify="flex-end">
                                <Grid item>
                                    <Typography variant="body2" style={{ cursor: 'pointer' }}>
                                    <span onClick={() => {setForgetPassword(true)}}>Forgot Password</span>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </div>
            )
        }
    }
}

export default observer(Login);