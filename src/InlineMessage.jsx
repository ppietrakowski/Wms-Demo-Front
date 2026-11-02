

function getIconForMessage(type) {
    const icons = {
        'primary': (<svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlinkHref="#info-fill" /></svg>),
        'success': (<svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlinkHref="#check-circle-fill" /></svg>),
        'warning': (<svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlinkHref="#exclamation-triangle-fill" /></svg>),
        'danger': (<svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlinkHref="#exclamation-triangle-fill" /></svg>),
    }

    return icons[type] || <div></div>
}

export function InlineMessage({ message, type }) {
    if (type == 'info') {
        type = 'primary'
    }

    let icon = getIconForMessage(type)
    return <div className={`alert alert-${type} rounded-0 border-0`}>
        {icon}
        <span>{message}</span>
    </div>
}