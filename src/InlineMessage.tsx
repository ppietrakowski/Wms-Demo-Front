
export interface InlineMessageSettings {
    message?: string
    type: string
}

interface InlineMessageProps {
    message: string
    type: string
}

export function InlineMessage({ message, type }: InlineMessageProps) {

    let icon = <div></div>

    if (type == 'primary') {
        icon = <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlinkHref="#info-fill" /></svg>
    }
    else if (type == 'success') {
        icon = <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlinkHref="#check-circle-fill" /></svg>
    }
    else if (type == 'warning') {
        icon = <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlinkHref="#exclamation-triangle-fill" /></svg>
    }
    else if (type == 'danger') {
        icon = <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlinkHref="#exclamation-triangle-fill" /></svg>
    }

    return <div className={`alert alert-${type} rounded-0 border-0`}>
        {icon}
        <span>{message}</span>
    </div>
}