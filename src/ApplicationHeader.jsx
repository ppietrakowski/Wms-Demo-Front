import * as ReactRouter from 'react-router-dom'
import { api } from './api.jsx';

export function DropDown({ children, icon, label, dropdownOnRightSide = false }) {
    let className = 'dropdown-menu p-2 rounded-1 shadow'
    let iconDiv = <span>{label}</span>

    if (icon) {
        iconDiv = <i className={icon}></i>
    }

    return <div className="" >
        <ReactRouter.Link className="nav-link" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" to="" aria-expanded="false">
            {iconDiv}
        </ReactRouter.Link>
        <ul className={className}
            aria-labelledby="dropdownMenuButton1">
            {children}
        </ul>
    </div>
}

async function handleLogout() {
    try {
        await api.post('logout/');

        // trick to browser route to reset
        window.location.reload()
    } catch (err) {
    }
}

export function ApplicationHeader({ user, operationStatus, header, displayOptionsMenu, children }) {

    let style = {
        filter: 'brightness(0.9)',
        gridTemplateColumns: '1fr auto 1fr',
        /* Workaround for alerts */
        zIndex: 1660
    }

    if (operationStatus == 'primary') {
        style['color'] = 'white'
    }

    return <header className={`d-grid align-items-center navbar navbar-light bg-${operationStatus}-subtle px-3`} style={style}>
        {
            displayOptionsMenu ?
                (
                    <DropDown icon='fa fa-bars'>
                        <ReactRouter.Link className='dropdown-item fs-6' to={'/'}>Menu</ReactRouter.Link>
                        <button className='dropdown-item fs-6' onClick={() => handleLogout()}>Logout</button>
                        {children}
                    </DropDown>
                ) :
                (<button className='text-white dropdown-item fs-6' onClick={() => handleLogout()}><span className='fa fa-sign-out'></span></button>)
        }

        <div className='fw-bold text-center'>{header}</div>
        <div className='text-end'>
            {user.username}
        </div>
    </header >
}
