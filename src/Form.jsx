export class FormSubmitEvent {
    constructor(target) {
        this._target = target
        this._formData = new FormData(this._target)
    }

    getString(id) {
        return this._formData.get(id)?.toString() || ''
    }

    getNumber(id) {
        return Number(this.getString(id) || 0)
    }

    get target() {
        return this._target
    }
}


export function Form({ children, method, submitCallback, positionedAtCentered }) {
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

