import React from 'react'
import './popup.css'

function Popup(props) {
    return (props.trigger) ? (
        <div className="popup">
            <div className='popup-inner'>
                { props.children }

                <button className="close-btn" onClick={() => props.setTrigger(false) } >Avbryt</button>
                <button className="confirm-btn" onClick={() => { props.setTrigger(false); props.setManually(); }}>{props.confirmButtonText}</button>
                

            </div>
        </div>
    ) : "";
}

export default Popup