import React, { useState } from 'react';
import { observer } from "mobx-react"
import NavBar from "../NavBar";
import { COLORS } from "../utils/config"
import Landing from "./Landing";
import NewRequest from "./NewRequest";
import RequestDetails from "./RequestDetails";

const RequestMain = (props) => {
    const [page, setPage] = useState({
        landing : true,
        new : false,
        details : false
    })
    const [selectedRequestID, setSelectedRequestID] = useState(null);
    const returnToMain = () => {
        setPage({landing: true, new: false, details : false})
    }
    const goToNewRequest = () => {
        setPage({landing: false, new: true, details : false})
    }
    const goToRequestDetails = () => {
        setPage({landing: false, new: false, details : true})
    }
    return (
        <div style={{height: "100%", backgroundColor: COLORS.WHITE}}>
            <NavBar {...props} />
            {page.landing && <Landing setSelectedRequestID={setSelectedRequestID} goToRequestDetails={goToRequestDetails} goToNewRequest={goToNewRequest} returnToMain={returnToMain} {...props} />}
            {page.new && <NewRequest returnToMain={returnToMain} {...props} />}
            {page.details && <RequestDetails selectedRequestID={selectedRequestID} returnToMain={returnToMain} {...props} />}
        </div>
    )
}

export default observer(RequestMain);