import Header from './components/header'
import StoreProvider from './StoreProvider'

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <StoreProvider>
            <div className="flex flex-col h-screen w-screen">
                <Header />
                <div className="flex-grow">{children}</div>
            </div>
        </StoreProvider>
    )
}
