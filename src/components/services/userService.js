import api from '../api';

export const getUser = async() => {
try{
    const response = await api.get("/users");
    return response.data;
}catch(error){
 console.error("Failed to fetch users:",error?.response?.data || error.message);
 throw error;
}
};

export const createUser = async() => {
try{
const response = await api.post("/users",userData);
return response.data;
}catch(error){
    console.log("Failed to create user:", error?.response?.data || error.message);
    throw error;
}
};