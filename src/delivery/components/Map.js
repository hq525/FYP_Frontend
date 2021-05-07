import React, { useState } from 'react';
import { userStore } from "../../index";
import { observer } from "mobx-react"
import { MAP_KEY } from '../../utils/config'
import GoogleMapReact from 'google-map-react';
import "./Map.css"

const Marker = (props) => {
    return (
        <div onMouseOver={() => {props.handleMarkerHoverOver(props.id)}} onMouseLeave={props.handleMarkerHoverLeave} onClick={() => {props.handleMarkerClick(props.id)}} className={props.hoverMarkerID === props.id ? "hoverMarker" : "marker"} >
           {props.text}
        </div>
     );
}

const Map = (props) => {
    return (
        <div style={{ height: '100%', width: '100%' }}>
            <GoogleMapReact
            bootstrapURLKeys={{ key: MAP_KEY }}
            defaultCenter={{lat: props.mapState.lat, lng: props.mapState.lng}}
            defaultZoom={props.mapState.zoom}
            onChange={props.onMapChange}
            >
            {
                props.users.map((user) => 
                    <Marker 
                        handleMarkerHoverOver={props.handleMarkerHoverOver}
                        handleMarkerHoverLeave={props.handleMarkerHoverLeave}
                        handleMarkerClick={props.handleMarkerClick}
                        hoverMarkerID={props.hoverMarkerID}
                        id={user.user.id}
                        text={user.user.id}
                        lat={user.user.lat}
                        lng={user.user.lng}
                    />
                )
            }
            </GoogleMapReact>
        </div>
    )
}

export default observer(Map);