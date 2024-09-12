import Header from './components/header/index'
import StoreProvider from './StoreProvider'

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <StoreProvider>
            <div className="flex flex-col h-screen w-screen">
                <Header />
                <div className="flex-grow h-full overflow-y-scroll">{children}</div>
            </div>
        </StoreProvider>
    )
}
