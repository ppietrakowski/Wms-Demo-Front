import { CSSProperties, ReactNode, use, useEffect, useState } from 'react';
import * as ReactRouter from 'react-router-dom'

interface ApplicationHeaderProps {
    operationStatus?: string
    header: string
    displayOptionsMenu?: boolean
    children?: ReactNode | ReactNode[]
}

interface DropDownSettings {
    icon: string | undefined
    label?: string
    dropdownOnRightSide?: boolean
    children?: ReactNode | ReactNode[]
}

export function DropDown({ children, icon, label, dropdownOnRightSide = false }: DropDownSettings) {
    let className = 'dropdown-menu p-2 rounded-1'

    if (dropdownOnRightSide) {
        className += ' dropdown-menu-end'
    }

    let iconDiv = <span>{label}</span>

    if (icon) {
        iconDiv = <i className={icon}></i>
    }

    return <div className="position-relative">
        <ReactRouter.Link className="nav-link" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" to="" aria-expanded="false">
            {iconDiv}
        </ReactRouter.Link>
        <ul className={className}
            aria-labelledby="dropdownMenuButton1">
            {children}
        </ul>
    </div>
}

export function ApplicationHeader({ operationStatus, header, displayOptionsMenu, children }: ApplicationHeaderProps) {

    let style: CSSProperties = {
        filter: 'brightness(0.9)',
        gridTemplateColumns: '1fr auto 1fr',
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
                        <ReactRouter.Link className='dropdown-item fs-6' to={'/logout'}>Logout</ReactRouter.Link>
                        {children}
                    </DropDown>
                ) :
                (<div></div>)
        }

        <div className='fw-bold text-center'>{header}</div>
        <div className='text-end'>
            $User
        </div>
    </header >
}
