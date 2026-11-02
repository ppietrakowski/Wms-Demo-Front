import * as React from 'react';
import { JSXElementConstructor } from 'react';

export class FormSubmitEvent {
    _target: HTMLFormElement
    _formData: FormData

    constructor(target: HTMLFormElement) {
        this._target = target
        this._formData = new FormData(this._target)
    }

    getString(id: string): string {
        return this._formData.get(id)?.toString() || ''
    }

    getNumber(id: string): number {
        return Number(this.getString(id) || 0)
    }

    public get target(): HTMLFormElement {
        return this._target
    }
}

interface FormSubmitCallback {
    (event: FormSubmitEvent): void
}


interface FormOptions {
    /** If true it's absolute positioned on center, on placement position otherwise */
    positionedAtCentered?: boolean
    submitCallback?: FormSubmitCallback
    children?: React.ReactNode | React.ReactNode[]
    method?: string
}


export function Form({ children, method, submitCallback, positionedAtCentered }: FormOptions) {
    let formClasses = 'vw-100 position-absolute top-50 start-50 translate-middle max-w-md d-flex justify-content-center align-items-center'

    if (!positionedAtCentered) {
        formClasses = "vw-100 w-100 max-w-md mt-3 d-flex justify-content-center align-items-center"
    }

    if (!submitCallback) {
        submitCallback = e => { }
    }

    if (method) {
        return <div className={formClasses}>
            <form id="wms-scan-form" method={method} onSubmit={e => { e.preventDefault(); submitCallback(new FormSubmitEvent(e.target)); }}>
                {children}
            </form>
        </div>
    }
    else {
        return <div className={formClasses}>
            <form id="wms-scan-form" onSubmit={e => { e.preventDefault(); submitCallback(new FormSubmitEvent(e.target)); }}>
                {children}
            </form>
        </div>
    }
}

