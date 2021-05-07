import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react";
import { ENDPOINT, COLORS } from "../utils/config";
import { Button, Drawer, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import HomeIcon from '@material-ui/icons/Home';
import LabelIcon from '@material-ui/icons/Label';
import CategoryIcon from '@material-ui/icons/Category';
import Tag from './Tag'
import NavBar from "../NavBar";
import Admin from './Admin';
import Category from './Category';

const MainAdmin = (props) => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [page, setPage] = useState({
        main : true,
        tags : false,
        categories : false
    })
    return (
        <div style={{height: "100%", backgroundColor: COLORS.WHITE}}>
            <Drawer anchor='left' open={openDrawer} onClose={() => {setOpenDrawer(false)}}>
                <List>
                    <ListItem button key="Main" onClick={() => {setPage({main: true, tags: false, categories : false});setOpenDrawer(false)}}>
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Main" />
                    </ListItem>
                    <ListItem button key="Tags" onClick={() => {setPage({main: false, tags: true, categories : false});setOpenDrawer(false)}}>
                        <ListItemIcon>
                            <LabelIcon />
                        </ListItemIcon>
                        <ListItemText primary="Tags" />
                    </ListItem>
                    <ListItem button key="Categories" onClick={() => {setPage({main: false, tags: false, categories : true});setOpenDrawer(false)}}>
                        <ListItemIcon>
                            <CategoryIcon />
                        </ListItemIcon>
                        <ListItemText primary="Categories" />
                    </ListItem>
                </List>
            </Drawer>
            <NavBar {...props}  />
            <div>
                {page.main && <Admin {...props} onMenuButtonClick={() => {setOpenDrawer(true)}} />}
                {page.tags && <Tag {...props} onMenuButtonClick={() => {setOpenDrawer(true)}} />}
                {page.categories && <Category {...props} onMenuButtonClick={() => {setOpenDrawer(true)}} />}
            </div>
        </div>
    )
}

export default observer(MainAdmin);