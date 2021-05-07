import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react";
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, IconButton, Typography, CircularProgress, Paper } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Grid, Table, TableHeaderRow, TableEditRow, TableEditColumn } from '@devexpress/dx-react-grid-material-ui';
import { EditingState, DataTypeProvider } from '@devexpress/dx-react-grid';
import { ENDPOINT, COLORS } from "../utils/config";
import API from "../utils/API"
import 'antd/dist/antd.css';
import { InputNumber } from 'antd';

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

const CategoryType = (props) => {
    const classes = useStyles();
    const [category, setCategory] = useState(null)
    const [loading, setLoading] = useState(false)
    const [categoryTypes, setCategoryTypes] = useState([]);
    const [categoryTypeMap, setCategoryTypeMap] = useState(new Map());
    const [editingRowIds, setEditingRowIds] = React.useState([]);
    const [rowChanges, setRowChanges] = React.useState({});
    const [addedRows, setAddedRows] = React.useState([]);
    const changeAddedRows = (value) => {
        setAddedRows(value);
    };
    useEffect(() => {
        async function initialize() {
            setLoading(true);
            let api = new API();
            try {
                await new Promise((resolve, reject) => {
                    api.setAuthorizationToken(localStorage.access_token)
                    api
                    .post(`${ENDPOINT}/category/get`, {
                        "id" : props.categoryID
                    })
                    .then((data) => {
                        setCategory(data.category.name)
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
                                    .post(`${ENDPOINT}/category/get`, {
                                        "id" : props.categoryID
                                    })
                                    .then((data) => {
                                        setCategory(data.category.name)
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
            } catch (error) {
                if (error && error.data && error.data.message) {
                    props.setError(error.data.message)
                } else {
                   props.setError("An error occurred")
                }
            }
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/category/type/${props.categoryID}`)
            .then((data) => {
                let categoryTypesData = []
                data.categoryTypes.forEach((categoryType) => {
                    var info = {id : categoryType.id, name : categoryType.name, price : categoryType.price}
                    categoryTypesData.push(info)
                    setCategoryTypeMap(new Map(categoryTypeMap.set(categoryType.id, info)))
                })
                setCategoryTypes(categoryTypesData)
                setLoading(false)
            })
            .catch((error) => {
                if (error && error.data && error.data.message) {
                    props.setError(error.data.message)
                    setLoading(false)
                } else {
                    props.setError("An error occurred")
                    setLoading(false)
                }
            })
        }
        initialize();
    }, []);
    const [editingStateColumnExtensions] = React.useState([
        { columnName: 'id', editingEnabled: false }
      ]);
    const commitCategoryTypeChanges = ({ added, changed, deleted}) => {
        let changedRows = categoryTypes;
        let api = new API();
        if (added) {
            setLoading(true);
            let promises = added.map((row) => {
                return new Promise((resolve, reject) => {
                    api.setAuthorizationToken(localStorage.access_token)
                    api
                    .post(`${ENDPOINT}/category/type`, {
                        "categoryID" : Number(props.categoryID),
                        "name" : row.name,
                        "price" : row.price
                    })
                    .then((data) => {
                        var info = {id: data.categoryType.id, name: row.name, price: row.price}
                        changedRows.push(info)
                        setCategoryTypeMap(new Map(categoryTypeMap.set(data.categoryType.id, info)))
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
                                    .post(`${ENDPOINT}/category/type`, {
                                        "categoryID" : props.categoryID,
                                        "name" : row.name,
                                        "price" : row.price
                                    })
                                    .then((data) => {
                                        var info = {id: data.categoryType.id, name: row.name, price: row.price}
                                        changedRows.push(info)
                                        setCategoryTypeMap(new Map(categoryTypeMap.set(data.categoryType.id, info)))
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
                                    reject()
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
            })
            Promise
            .all(promises)
            .then(() => {
                setCategoryTypes(changedRows)
                setLoading(false);
            })
            .catch((error) => {
                if(error && error.data && error.data.message) {
                    props.setError(error.data.message);
                } else {
                    props.setError("An error occurred")
                }
                setLoading(false)
            })
        }
        if (changed) {
            setLoading(true);
            let index = parseInt(Object.keys(changed)[0])
            if (changed[index] !== undefined) {
                api.setAuthorizationToken(localStorage.access_token)
                api
                .put(`${ENDPOINT}/category/type`, {
                    id : index,
                    name : changed[index].name ? (changed[index].name) : (categoryTypeMap.get(index).name),
                    price : changed[index].price ? (changed[index].name) : (categoryTypeMap.get(index).price)
                })
                .then(() => {
                    var info = categoryTypeMap[index]
                    setCategoryTypeMap(new Map(categoryTypeMap.set(index, {...info, ...changed[index]})))
                    changedRows = categoryTypes.map(row => (changed[row.id] ? {...row , ...changed[row.id]} : row))
                    setCategoryTypes(changedRows)
                    setLoading(false);
                })
                .catch((error) => {
                    if (error && error.data && error.data.error === "token_expired") {
                        if(localStorage.refresh_token) {
                            api
                            .refreshToken()
                            .then(() => {
                                api.setAuthorizationToken(localStorage.access_token)
                                api
                                .put(`${ENDPOINT}/category/type`, {
                                    id : categoryTypes[index].id,
                                    name : changed[index].name ? (changed[index].name) : (categoryTypeMap.get(index).name),
                                    price : changed[index].price ? (changed[index].name) : (categoryTypeMap.get(index).price)
                                })
                                .then(() => {
                                    var info = categoryTypeMap[index]
                                    setCategoryTypeMap(new Map(categoryTypeMap.set(index, {...info, ...changed[index]})))
                                    changedRows = categoryTypes.map(row => (changed[row.id] ? {...row , ...changed[row.id]} : row))
                                    setCategoryTypes(changedRows)
                                    setLoading(false);
                                })
                                .catch((error) => {
                                    if (error && error.data && error.data.message) {
                                        props.setError(error.data.message)
                                        setLoading(false)
                                    } else {
                                        props.setError("An error occurred")
                                        setLoading(false);
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
                            setLoading(false);
                            userStore.setUser(null);
                            localStorage.removeItem('refresh_token');
                            localStorage.removeItem('access_token');
                            userStore.setAuthenticated(false);
                        }
                    } else if (error && error.data && error.data.message) {
                        console.log(error);
                        props.setError(error.data.message)
                        setLoading(false)
                    } else {
                        props.setError("An error occurred")
                        setLoading(false);
                    }
                })
            } else {
                props.setError("Nothing changed")
                setLoading(false);
            }
        }
        if (deleted) {
            setLoading(true);
            let promises = deleted.map((id) => {
                return new Promise((resolve, reject) => {
                    api.setAuthorizationToken(localStorage.access_token)
                    api
                    .delete(`${ENDPOINT}/category/type`, {
                        "id" : id
                    })
                    .then(() => {
                        setCategoryTypeMap(new Map(categoryTypeMap.set(id, undefined)))
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
                                    .delete(`${ENDPOINT}/category/type`, {
                                        "id" : id
                                    })
                                    .then(() => {
                                        setCategoryTypeMap(new Map(categoryTypeMap.set(id, undefined)))
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
                                    reject()
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
            })
            Promise
            .all(promises)
            .then(() => {
                const deletedSet = new Set(deleted);
                changedRows = categoryTypes.filter(row => !deletedSet.has(row.id));
                setCategoryTypes(changedRows);
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                if(error && error.data && error.data.message) {
                    props.setError(error.data.message);
                } else {
                    props.setError("An error occurred")
                }
            })
        }
    }
    const PriceFormatter = ({ value }) => {return(<span>$ {value}</span>)}
    const PriceEditor = ({ value, onValueChange }) => (
        <InputNumber defaultValue={0.01} step={0.01} precision={2} min={0.01} value={value} onChange={(value) => {onValueChange(value)}} />
    )
    const PriceTypeProvider = props => (
        <DataTypeProvider
        formatterComponent={PriceFormatter}
        editorComponent={PriceEditor}
        {...props}
        />
    )

    if (loading) {
        return (
            <div style={{display: "flex", flexFlow: "column", height: "100%"}}>
                <div style={{flexGrow: 1, width: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <CircularProgress size={100} />
                </div>
            </div>
        )
    } else {
        return(
            <div style={{height: "100%", backgroundColor: COLORS.WHITE}}>
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={props.handleClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            {category !== null ? category : ""}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <div style={{marginTop: "10px"}}></div>
                <div style={{justifyContent: "center", display: "flex"}}>
                    <Paper style={{width: "80%"}}>
                        <Grid
                            rows={categoryTypes}
                            columns={[
                                { name: 'id', title: 'ID' },
                                { name: 'name', title: 'Name'},
                                { name: 'price', title: 'Price'}
                            ]}
                            getRowId={row => row.id}
                        >
                            <PriceTypeProvider
                            for={['price']}
                            />
                            <EditingState
                            editingRowIds={editingRowIds}
                            onEditingRowIdsChange={setEditingRowIds}
                            rowChanges={rowChanges}
                            onRowChangesChange={setRowChanges}
                            addedRows={addedRows}
                            onAddedRowsChange={changeAddedRows}
                            onCommitChanges={commitCategoryTypeChanges}
                            columnExtensions={editingStateColumnExtensions}
                            />
                            <Table />
                            <TableHeaderRow />
                            <TableEditRow />
                            <TableEditColumn
                            showAddCommand={!addedRows.length}
                            showDeleteCommand
                            showEditCommand
                            />
                        </Grid>
                    </Paper>
                </div>
            </div>
        )
    }
}

export default observer(CategoryType);