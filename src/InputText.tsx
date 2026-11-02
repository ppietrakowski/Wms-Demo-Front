export interface InputTextProps {
    submitElementKey?: string
    maxLength?: number

    placeholder?: string
    defaultValue?: string
    children?: React.ReactNode | React.ReactNode[]
    type: 'text' | 'password'
    className?: string
    onChange?: (e: any) => void
}

/** Scan ID button on center just to normalize first ones inputs in various apps */
export default function InputText({ submitElementKey, className, type, defaultValue, placeholder, onChange, maxLength, children }: InputTextProps) {
    submitElementKey = submitElementKey || ''
    maxLength = maxLength || 100

    return <div key={submitElementKey} className={className || ''}>
        <label htmlFor={submitElementKey} className="form-label small text-body-secondary translate-middle position-relative top-0 start-50">
            {children}
        </label>
        <div className="input-group">
            <input id={submitElementKey} className="form-control form-control-lg" type={type} name={submitElementKey} onChange={e => {
                onChange && onChange(e)
            }} maxLength={maxLength} placeholder={placeholder || ''} defaultValue={defaultValue || ''} autoComplete={'off'} autoFocus={true} />
        </div>
    </div >
}