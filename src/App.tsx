import * as ReactRouter from 'react-router-dom'
import { MainMenu } from './MainMenu.tsx';
import { Receive } from './Receive.tsx';
import { Login, UserData } from './Login.tsx';
import { use, useEffect, useState } from 'react';
import { api } from './Api.tsx';



function Application() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        api.get('authuser/')
            .then((response) => {
                setUser(response.data);
            })
            .catch((error) => {
                setUser(null)
            })
            .finally(() => setLoading(false))
    }, []);

    if (loading) {
        return <div className='position-absolute translate-middle top-50 start-50 justify-content-center align-items-center d-flex'>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    }

    if (!user) {
        return (<ReactRouter.HashRouter>
            <ReactRouter.Routes>
                <ReactRouter.Route
                    path="/login"
                    element={
                        user ? (
                            <ReactRouter.Navigate to="/menu" replace />
                        ) : (
                            <Login onLoginSuccess={(userData) => setUser(userData)} />
                        )
                    }
                />
                <ReactRouter.Route path="*" element={<ReactRouter.Navigate to={"/login"} replace />} />
            </ReactRouter.Routes>
        </ReactRouter.HashRouter>)
    }


    return (<ReactRouter.HashRouter>
        <ReactRouter.Routes>
            <ReactRouter.Route path="/" element={<ReactRouter.Navigate to="/menu" replace />} />

            <ReactRouter.Route
                path="/menu"
                element={<MainMenu user={user} />}
            />
            <ReactRouter.Route path='/receive' element={<Receive user={user} />} />

            <ReactRouter.Route path='/login' element={<ReactRouter.Navigate to='/menu' replace />} />

            <ReactRouter.Route path="*" element={<div>Strona nie istnieje (404)</div>} />
        </ReactRouter.Routes>
    </ReactRouter.HashRouter>)
}

export default Application;
