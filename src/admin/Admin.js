import React, { useState, useEffect } from 'react';
import { userStore } from "../index";
import { observer } from "mobx-react";
import { Button } from "@material-ui/core";

const Admin = (props) => {
    return (
        <div style={{marginTop : "10px"}}>
            <Button variant="outlined" size="large" style={{marginLeft: "10px"}} onClick={props.onMenuButtonClick}>
                Menu
            </Button>
        </div>
    )
}

export default observer(Admin);