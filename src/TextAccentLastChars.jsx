
export default function TextAccentLastChars({ text, numChars = 4, className, boldClassName }) {
    const boldClass = ['fw-bold m-1']

    if (boldClassName) {
        boldClass.push(boldClassName)
    }

    return <div className={className} style={{width: 'fit-content'}}>
        <span className="m-1">{text.substring(0, text.length - numChars)}</span>
        <span className={boldClass.join(' ')}>{text.substring(text.length - numChars)}</span>
    </div>
}