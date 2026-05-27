//Emergency Kit Service - API calls for emergency kit items
import api from '../api';

const emergencyKitService = {
    //Get all kit items
    getAll: async () => {
        const response = await api.get('/emergency-kit');
        return response.data;
    },

    //Get items expiring/replacement soon
    getExpiringSoon: async () => {
        const response = await api.get('/emergency-kit/expiring-soon');
        return response.data;
    },

    //Get items by category
    getByCategory: async (category) => {
        const response = await api.get(`/emergency-kit/category/${category}`);
        return response.data;
    },

    //Get single item by ID
    getById: async (id) => {
        const response = await api.get(`/emergency-kit/${id}`);
        return response.data;
    },

    //Create new item
    create: async (itemData) => {
        const response = await api.post('/emergency-kit', itemData);
        return response.data;
    },

    //Update item by ID
    update: async (id, itemData) => {
        const response = await api.put(`/emergency-kit/${id}`, itemData);
        return response.data;
    },

    //Delete item by ID
    delete: async (id) => {
        const response = await api.delete(`/emergency-kit/${id}`);
        return response.data;
    }
};

export default emergencyKitService;