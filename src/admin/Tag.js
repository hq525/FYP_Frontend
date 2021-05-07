import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react";
import { Grid, Table, TableHeaderRow, TableEditRow, TableEditColumn } from '@devexpress/dx-react-grid-material-ui';
import { EditingState } from '@devexpress/dx-react-grid';
import API from "../utils/API"
import { ENDPOINT } from "../utils/config";
import { Paper, CircularProgress, Button, Grid as Container } from '@material-ui/core';

const Tag = (props) => {
    const [tags, setTags] = useState([])
    const [loading, setLoading] = useState(false);
    const [editingRowIds, setEditingRowIds] = React.useState([]);
    const [rowChanges, setRowChanges] = React.useState({});
    const [addedRows, setAddedRows] = React.useState([]);
    const changeAddedRows = (value) => {
        setAddedRows(value);
    };

    useEffect(() => {
        async function initialize() {
            setLoading(true)
            let api = new API();
            api.setAuthorizationToken(localStorage.access_token)
            api
            .get(`${ENDPOINT}/tag`)
            .then((data) => {
                let tagData = []
                data.tags.forEach((tag) => {
                    tagData.push({id : tag.id, name : tag.name})
                })
                setTags(tagData)
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
                            .get(`${ENDPOINT}/tag`)
                            .then((data) => {
                                let tagData = []
                                data.tags.forEach((tag) => {
                                    tagData.push({id : tag.id, name : tag.name})
                                })
                                setTags(tagData)
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
                    props.setError(error.data.message)
                    setLoading(false);
                } else {
                    setLoading(false);
                    props.setError("An error occurred")
                }
            })
        }
        initialize()
    }, []);
    const [editingStateColumnExtensions] = React.useState([
        { columnName: 'id', editingEnabled: false }
      ]);
    const commitTagChanges = ({ added, changed, deleted }) => {
        let changedRows = tags;
        let api = new API();
        if (added) {
            setLoading(true);
            let promises = added.map((row) => {
                return new Promise((resolve, reject) => {
                    api.setAuthorizationToken(localStorage.access_token)
                    api
                    .post(`${ENDPOINT}/tag`, {
                        'name' : row.name
                    })
                    .then((data) => {
                        changedRows.push({id: data.tag.id, name: row.name})
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
                                    .post(`${ENDPOINT}/tag`, {
                                        'name' : row.name
                                    })
                                    .then((data) => {
                                        changedRows.push({id: data.tag.id, name: row.name})
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
                            reject(error)
                        }
                    })
                })
            })
            Promise
            .all(promises)
            .then(() => {
                setLoading(false);
                setTags(changedRows);
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
                    .delete(`${ENDPOINT}/tag`, {
                        "id" : id
                    })
                    .then(() => {
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
                                    .delete(`${ENDPOINT}/tag`, {
                                        "id" : id
                                    })
                                    .then(() => {
                                        resolve()
                                    })
                                    .catch((error) => {
                                        reject(error)
                                    })
                                })
                                .catch((error) => {
                                    reject()
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
                changedRows = tags.filter(row => !deletedSet.has(row.id));
                setLoading(false);
                setTags(changedRows);
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
    if (loading) {
        return (
            <div style={{display: "flex", flexFlow: "column", height: "100%"}}>
                <div style={{flexGrow: 1, width: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <CircularProgress size={100} />
                </div>
            </div>
        )
    } else {
        return (
            <div style={{height: "auto", width: "100%"}}>
                <div style={{marginTop: "10px"}}></div>
                <Container container>
                    <Container item lg={4} md={4} sm={4} xs={4} style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <Button variant="outlined" size="large" onClick={props.onMenuButtonClick}>
                            Menu
                        </Button>
                    </Container>
                    <Container item lg={4} md={4} sm={4} xs={4} style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <h1 style={{marginBottom: "0px", marginTop: "0px"}}>Tags</h1>
                    </Container>
                    <Container item lg={4} md={4} sm={4} xs={4}>
                        
                    </Container>
                </Container>
                <div style={{justifyContent: "center", display: "flex"}}>
                    <Paper style={{width: "80%"}}>
                        <Grid
                            rows={tags}
                            columns={[
                                { name: 'id', title: 'ID' },
                                { name: 'name', title: 'Name'}
                            ]}
                            getRowId={row => row.id}
                        >
                            <EditingState
                            editingRowIds={editingRowIds}
                            onEditingRowIdsChange={setEditingRowIds}
                            rowChanges={rowChanges}
                            onRowChangesChange={setRowChanges}
                            addedRows={addedRows}
                            onAddedRowsChange={changeAddedRows}
                            onCommitChanges={commitTagChanges}
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
            </div>
        )
    }
}

export default observer(Tag);