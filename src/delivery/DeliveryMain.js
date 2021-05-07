import React, { useState } from 'react';
import { observer } from "mobx-react"
import NavBar from "../NavBar";
import { COLORS } from "../utils/config"
import DeliveryLanding from "./DeliveryLanding";
import NewDelivery from "./NewDelivery";
import DeliveryDetails from "./DeliveryDetails";

const DeliveryMain = (props) => {
    const [page, setPage] = useState({
        landing : true,
        new : false,
        details : false
    })
    const [selectedDeliveryID, setSelectedDeliveryID] = useState(null);
    const returnToMain = () => {
        setPage({landing: true, new: false, details : false})
    }
    const goToNewDelivery = () => {
        setPage({landing: false, new: true, details : false})
    }
    const goToDeliveryDetails = () => {
        setPage({landing: false, new: false, details : true})
    }
    return (
        <div style={{height: "100%", backgroundColor: COLORS.WHITE}}>
            <NavBar {...props} />
            {page.landing && <DeliveryLanding setSelectedDeliveryID={setSelectedDeliveryID} goToDeliveryDetails={goToDeliveryDetails} goToNewDelivery={goToNewDelivery} returnToMain={returnToMain} {...props} />}
            {page.new && <NewDelivery returnToMain={returnToMain} {...props} />}
            {page.details && <DeliveryDetails selectedDeliveryID={selectedDeliveryID} returnToMain={returnToMain} {...props} />}
        </div>
    )
}

export default observer(DeliveryMain);