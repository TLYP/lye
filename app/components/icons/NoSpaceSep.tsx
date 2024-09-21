export default function Icon(props: React.ComponentProps<'svg'>) {
    return (
        <svg {...props} viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.5 2V5H8.5V2" stroke="defaultColor" />
            <path
                d="M9.5 3L10.5 2M10.5 2L11.5 1M10.5 2L9.5 1M10.5 2L11.5 3"
                stroke="defaultColor"
                strokeWidth="0.5"
            />
        </svg>
    )
}
