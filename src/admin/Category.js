import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react";
import { Grid, Table, TableHeaderRow, TableEditRow, TableEditColumn } from '@devexpress/dx-react-grid-material-ui';
import { DataTypeProvider, EditingState } from '@devexpress/dx-react-grid';
import API from "../utils/API"
import { ENDPOINT, COLORS } from "../utils/config";
import { Paper, CircularProgress, Button, Dialog, Slide, Grid as Container } from '@material-ui/core';
import CategoryType from "./CategoryType";
import 'antd/dist/antd.css';
import { InputNumber } from 'antd';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

const Category = (props) => {
    const [categories, setCategories] = useState([]);
    const [categoryMap, setCategoryMap] = useState(new Map());
    const [open, setOpen] = useState(false);
    const [selectedCategoryID, setSelectedCategoryID] = useState(null);
    const [loading, setLoading] = useState([]);
    const [editingRowIds, setEditingRowIds] = React.useState([]);
    const [rowChanges, setRowChanges] = React.useState({});
    const [addedRows, setAddedRows] = React.useState([]);
    const changeAddedRows = (value) => {
        setAddedRows(value);
    };

    useEffect(() => {
        setLoading(true);
        let api = new API();
        api.setAuthorizationToken(localStorage.access_token)
        api
        .get(`${ENDPOINT}/category`)
        .then((data) => {
            let categoryData = []
            data.categories.forEach((category) => {
                var info = {id: category.id, name: category.name, urgency: category.urgency}
                categoryData.push(info)
                setCategoryMap(new Map(categoryMap.set(category.id, info)))
            })
            setCategories(categoryData)
            setLoading(false)
        })
        .catch((error) => {
            if (error && error.data && error.data.error === "token_expired") {
                if(localStorage.refresh_token) {
                    api
                    .refreshToken()
                    .then(() => {
                        api.setAuthorizationToken(localStorage.access_token)
                        api
                        .get(`${ENDPOINT}/category`)
                        .then((data) => {
                            let categoryData = []
                            data.categories.forEach((category) => {
                                var info = {id: category.id, name: category.name, urgency: category.urgency}
                                categoryData.push(info)
                                setCategoryMap(new Map(categoryMap.set(category.id, info)))
                            })
                            setCategories(categoryData)
                            setLoading(false)
                        })
                        .catch((error) => {
                            if (error && error.data && error.data.message) {
                                props.setError(error.data.message)
                                setLoading(false);
                            } else {
                                setLoading(false);
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
                setLoading(false);
            } else {
                setLoading(false);
                props.setError("An error occurred")
            }
        })
    }, []);
    const [editingStateColumnExtensions] = React.useState([
        { columnName: 'id', editingEnabled: false }
      ]);
    const commitCategoryChanges = ({ added, changed, deleted}) => {
        let changedRows = categories
        let api = new API();
        if (added) {
            setLoading(true)
            let promises = added.map((row) => {
                return new Promise((resolve, reject) => {
                    api.setAuthorizationToken(localStorage.access_token)
                    api
                    .post(`${ENDPOINT}/category`, {
                        'name' : row.name,
                        'urgency' : row.urgency
                    })
                    .then((data) => {
                        var info = {id: data.category.id, name: row.name, urgency: row.urgency}
                        changedRows.push(info)
                        setCategoryMap(new Map(categoryMap.set(data.category.id, info)))
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
                                    .post(`${ENDPOINT}/category`, {
                                        'name' : row.name,
                                        'urgency' : row.urgency
                                    })
                                    .then((data) => {
                                        changedRows.push({id: data.category.id, name: row.name, urgency: row.urgency})
                                        resolve()
                                    })
                                    .catch((error) => {
                                        reject(error);
                                    })
                                })
                                .catch((error) => {
                                    reject(error)
                                    userStore.setUser(null);
                                    localStorage.removeItem('refresh_token');
                                    localStorage.removeItem('access_token');
                                    userStore.setAuthenticated(false);
                                })
                            } else {
                                reject()
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
            })
            Promise
            .all(promises)
            .then(() => {
                setLoading(false);
                setCategories(changedRows);
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
        if (deleted) {
            setLoading(true);
            let promises = deleted.map((id) => {
                return new Promise((resolve, reject) => {
                    api.setAuthorizationToken(localStorage.access_token)
                    api
                    .delete(`${ENDPOINT}/category`, {
                        "id" : id
                    })
                    .then(() => {
                        setCategoryMap(new Map(categoryMap.set(id, undefined)))
                        resolve()
                    })
                    .catch((error) => {
                        if (error && error.data && error.data.error === "token_expired") {
                            if(localStorage.refresh_token) {
                                api
                                .refreshToken()
                                .then(() => {
                                    api
                                    .delete(`${ENDPOINT}/category`, {
                                        "id" : id
                                    })
                                    .then(() => {
                                        setCategoryMap(new Map(categoryMap.set(id, undefined)))
                                        resolve()
                                    })
                                    .catch((error) => {
                                        reject(error)
                                    })
                                })
                                .catch((error) => {
                                    reject(error)
                                    userStore.setUser(null);
                                    localStorage.removeItem('refresh_token');
                                    localStorage.removeItem('access_token');
                                    userStore.setAuthenticated(false);
                                })
                            } else {
                                reject()
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
            })
            Promise
            .all(promises)
            .then(() => {
                const deletedSet = new Set(deleted);
                changedRows = categories.filter(row => !deletedSet.has(row.id));
                setLoading(false);
                setCategories(changedRows);
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
    const handleEditTypesClick = (id) => {
        setSelectedCategoryID(id);
        setOpen(true);
    }
    const TypesFormatter = ( { value } ) => {return(<Button variant="contained" onClick={() => handleEditTypesClick(value)}>Edit Types</Button>)}
    const TypesEditTypeProvider = props => (
        <DataTypeProvider
        formatterComponent={TypesFormatter}
        {...props}
        />
    )
    const UrgencyFormatter = ({ value }) => {return(<span>{value}</span>)}
    const UrgencyEditor = ({ value, onValueChange }) => (
        <InputNumber defaultValue={1} min={1} value={value} onChange={(value) => {onValueChange(value)}} />
    )
    const UrgencyTypeProvider = props => (
        <DataTypeProvider
        formatterComponent={UrgencyFormatter}
        editorComponent={UrgencyEditor}
        {...props}
        />
    )
    const handleClose = () => {
        setOpen(false)
    }
    if (loading) {
        return (
            <div style={{height: "auto", backgroundColor: COLORS.WHITE}}>
                <div style={{flexGrow: 1, width: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <CircularProgress size={100} />
                </div>
            </div>
        )
    } else {
        return (
            <div style={{height: "auto", backgroundColor: COLORS.WHITE}}>
                <div style={{marginTop: "10px"}}></div>
                <Container container>
                    <Container item lg={4} md={4} sm={4} xs={4} style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <Button variant="outlined" size="large" onClick={props.onMenuButtonClick}>
                            Menu
                        </Button>
                    </Container>
                    <Container item lg={4} md={4} sm={4} xs={4} style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <h1 style={{marginBottom: "0px", marginTop: "0px"}}>Categories</h1>
                    </Container>
                    <Container item lg={4} md={4} sm={4} xs={4}>
                        
                    </Container>
                </Container>
                <div style={{justifyContent: "center", display: "flex"}}>
                    <Paper style={{width: "80%"}}>
                        <Grid
                            rows={categories}
                            columns={[
                                { name: 'id', title: 'Edit Types' },
                                { name: 'name', title: 'Name'},
                                { name: 'urgency', title: 'Urgency'}
                            ]}
                            getRowId={row => row.id}
                        >   
                            <TypesEditTypeProvider for={['id']} />
                            <UrgencyTypeProvider
                            for={['urgency']}
                            />
                            <EditingState
                            editingRowIds={editingRowIds}
                            onEditingRowIdsChange={setEditingRowIds}
                            rowChanges={rowChanges}
                            onRowChangesChange={setRowChanges}
                            addedRows={addedRows}
                            onAddedRowsChange={changeAddedRows}
                            onCommitChanges={commitCategoryChanges}
                            columnExtensions={editingStateColumnExtensions}
                            />
                            <Table />
                            <TableHeaderRow />
                            <TableEditRow />
                            <TableEditColumn
                            showAddCommand={!addedRows.length}
                            showDeleteCommand
                            />
                        </Grid>
                    </Paper>
                </div>
                <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
                    { selectedCategoryID && <CategoryType categoryID={selectedCategoryID} {...props} handleClose={handleClose} />}
                </Dialog>
            </div>
        )
    }
}

export default observer(Category);