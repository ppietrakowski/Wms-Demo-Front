
export default function TextAccentLastChars({ text, numChars = 4, className, boldClassName }) {
    const boldClass = ['fw-bold']

    if (boldClassName) {
        boldClass.push(boldClassName)
    }

    return <div className={className}>
        {text.substring(0, text.length - numChars)}
        <span className={boldClass.join(' ')}>{text.substring(text.length - numChars)}</span>
    </div>
}