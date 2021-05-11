import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { 
    CircularProgress,
    Typography,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableCell,
    TableBody,
    TableRow,
    Button
} from "@material-ui/core";
import { observer } from "mobx-react"
import NavBar from "../NavBar";
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { ENDPOINT, COLORS } from "../utils/config"
import API from "../utils/API"

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

const Purchase = (props) => {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [excessItems, setExcessItems] = useState([])

    useEffect(() => {
        async function initialize() {
            setLoading(true);
            try{
                await getExcessItems()
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

    const getExcessItems = () => {
        let api = new API()
        return new Promise((resolve, reject) => {
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/excess`)
            .then((data)=>{
                setExcessItems(data.items)
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
                            .get(`${ENDPOINT}/excess`)
                            .then((data)=>{
                                setExcessItems(data.items)
                                resolve();
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

    const handlePurchase = (itemID) => {

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
                <div style={{padding: "20px"}}>
                    <Typography variant="h3" style={{textAlign: 'left', color: COLORS.BLUE}}>
                        Excess Items For Purchase
                    </Typography>
                    <div style={{marginTop: "15px"}}></div>
                    <TableContainer component={Paper}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableCell align="center">
                                    Item
                                </TableCell>
                                <TableCell align="center">
                                    Quantity Left
                                </TableCell>
                                <TableCell align="center">
                                    Price
                                </TableCell>
                                <TableCell align="center">
                                    
                                </TableCell>
                            </TableHead>
                            <TableBody>
                                {
                                    excessItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell align="center">{item.name}</TableCell>
                                            <TableCell align="center">{item.quantity}</TableCell>
                                            <TableCell align="center">$ {item.price}</TableCell>
                                            <TableCell align="center"><Button onClick={() => {handlePurchase(item.id)}}>Purchase</Button></TableCell>
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

export default observer(Purchase);