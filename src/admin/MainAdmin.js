import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react";
import { ENDPOINT, COLORS } from "../utils/config";
import { Button, Drawer, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import AddToHomeScreenIcon from '@material-ui/icons/AddToHomeScreen';
import LabelIcon from '@material-ui/icons/Label';
import CategoryIcon from '@material-ui/icons/Category';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import Tag from './Tag'
import NavBar from "../NavBar";
import Unmet from './Unmet'
import Category from './Category';
import Allocation from './Allocation';

const MainAdmin = (props) => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [page, setPage] = useState({
        unmet : true,
        tags : false,
        categories : false,
        allocation : false
    })
    return (
        <div style={{height: "100%", backgroundColor: COLORS.WHITE}}>
            <Drawer anchor='left' open={openDrawer} onClose={() => {setOpenDrawer(false)}}>
                <List>
                    <ListItem button key="Main" onClick={() => {setPage({unmet: true, tags: false, categories : false, allocation: false});setOpenDrawer(false)}}>
                        <ListItemIcon>
                            <AddToHomeScreenIcon />
                        </ListItemIcon>
                        <ListItemText primary="Unmet Requests" />
                    </ListItem>
                    <ListItem button key="Tags" onClick={() => {setPage({unmet: false, tags: true, categories : false, allocation: false});setOpenDrawer(false)}}>
                        <ListItemIcon>
                            <LabelIcon />
                        </ListItemIcon>
                        <ListItemText primary="Tags" />
                    </ListItem>
                    <ListItem button key="Categories" onClick={() => {setPage({unmet: false, tags: false, categories : true, allocation: false});setOpenDrawer(false)}}>
                        <ListItemIcon>
                            <CategoryIcon />
                        </ListItemIcon>
                        <ListItemText primary="Categories" />
                    </ListItem>
                    <ListItem button key="Categories" onClick={() => {setPage({unmet: false, tags: false, categories : false, allocation: true});setOpenDrawer(false)}}>
                        <ListItemIcon>
                            <AssignmentTurnedInIcon />
                        </ListItemIcon>
                        <ListItemText primary="Allocation" />
                    </ListItem>
                </List>
            </Drawer>
            <NavBar {...props}  />
            <div>
                {page.unmet && <Unmet {...props} onMenuButtonClick={() => {setOpenDrawer(true)}} />}
                {page.tags && <Tag {...props} onMenuButtonClick={() => {setOpenDrawer(true)}} />}
                {page.categories && <Category {...props} onMenuButtonClick={() => {setOpenDrawer(true)}} />}
                {page.allocation && <Allocation {...props} onMenuButtonClick={() => {setOpenDrawer(true)}} />}
            </div>
        </div>
    )
}

export default observer(MainAdmin);