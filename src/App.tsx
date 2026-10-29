import * as ReactRouter from 'react-router-dom'
import { MainMenu } from './MainMenu.tsx';
import { Receive } from './Receive.tsx';

function Application() {
    return <ReactRouter.HashRouter>
        <ReactRouter.Routes>
            {/* Public Login Route */}
            <ReactRouter.Route
                path="/receive"
                element={<Receive />}
            />
            <ReactRouter.Route path="*" element={<MainMenu />} />
        </ReactRouter.Routes>
    </ReactRouter.HashRouter>
}

export default Application;
