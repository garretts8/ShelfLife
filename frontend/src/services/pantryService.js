//Handles CRUD operations for pantry items.

import api from '../api';

const pantryService = {
    //Get all pantry items for the logged-in user
    getAll: async () => {
        const response = await api.get('/pantry');
        return response.data;
    },

    //Get expiring soon items for the logged-in user
    getExpiring: async () => {
        const response = await api.get('/pantry/expiring-soon');
        return response.data;
    },
    //Get single item by ID
    getById: async (id) => {
        const response = await api.get(`/pantry/${id}`);
        return response.data;
    },

    //Create new pantry item
    create: async (itemData) => {
        const response = await api.post('/pantry', itemData);
        return response.data;
    },
    //Update pantry item
    update: async (id, itemData) => {
        const response = await api.put(`/pantry/${id}`, itemData);
        return response.data;
    },
    //Delete pantry item
    delete: async (id) => {
        const response = await api.delete(`/pantry/${id}`);
        return response.data;
    }
};

export default pantryService;
