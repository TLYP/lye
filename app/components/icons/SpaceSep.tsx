export default function Icon(props: React.ComponentProps<'svg'>) {
    return (
        <svg {...props} viewBox="0 0 10 4" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 0V3H9V0" stroke="defaultColor" />
        </svg>
    )
}
