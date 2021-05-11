import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react";
import { 
    Grid,
    Button,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress
} from "@material-ui/core";
import { ENDPOINT, COLORS } from "../utils/config"
import API from "../utils/API"
import { makeStyles, createStyles } from '@material-ui/core/styles';

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

const Unmet = (props) => {
    const classes = useStyles();
    const [unmetRequests, setUnmetRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function initialize() {
            setLoading(true);
            try {
                await getUnmetRequests()
            } catch(error) {
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

    const getUnmetRequests = () => {
        let api = new API()
        return new Promise((resolve, reject) => {
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/unmet`)
            .then((data) => {
                setUnmetRequests(data.requests)
                resolve()
            })
            .catch((error) => {
                if (error && error.data && error.data.error === "token_expired") {
                    if (localStorage.refreshToken) {
                        api
                        .refreshToken()
                        .then(()=>{
                            api.setAuthorizationToken(localStorage.access_token)
                            api
                            .get(`${ENDPOINT}/unmet`)
                            .then((data) => {
                                setUnmetRequests(data.requests)
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

    if (loading) {
        return (
            <div style={{display: "flex", flexFlow: "column", height: "100%"}}>
                <div style={{width: "100%", height: "80%", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <CircularProgress size={100} />
                </div>
            </div>
        )
    } else {
        return (
            <div style={{height: "auto", width: "100%"}}>
                <div style={{marginTop: "20px"}}></div>
                <Grid container>
                    <Grid item lg={4} md={4} sm={4} xs={4} style={{display: "flex", alignItems: "center", justifyContent: "flex-start"}}>
                        <Button style={{marginLeft: "80px"}} variant="outlined" size="large" onClick={props.onMenuButtonClick}>
                            Menu
                        </Button>
                    </Grid>
                    <Grid item lg={4} md={4} sm={4} xs={4} style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <h1 style={{marginBottom: "0px", marginTop: "0px", color: COLORS.BLUE}}>Unmet Requests</h1>
                    </Grid>
                    <Grid item lg={4} md={4} sm={4} xs={4}>
                        
                    </Grid>
                </Grid>
                <div style={{marginTop: "20px"}} />
                <div style={{paddingLeft: "80px", paddingRight: "80px"}}>
                    <TableContainer component={Paper}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
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
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    unmetRequests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell align="center">{request.dateRequested.toLocaleDateString()}</TableCell>
                                            <TableCell align="center">{request.category}</TableCell>
                                            <TableCell align="center">{request.categoryType}</TableCell>
                                            <TableCell align="center">{request.quantity}</TableCell>
                                            <TableCell align="center">{request.comments}</TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        )
    }
}

export default observer(Unmet);