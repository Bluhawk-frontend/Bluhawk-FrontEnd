import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';  // Import js-cookie

const PrivateRoute = ({ children }) => { 

    const token = Cookies.get('access_token');  // Use the key name you store the token with

    return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
