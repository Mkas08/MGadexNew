/**
 * Paint Shop API Client
 * Centralized API communication layer
 */

const API = {
    baseUrl: 'http://localhost:8000/api',

    // Get stored auth token
    getToken() {
        return localStorage.getItem('auth_token');
    },

    // Set auth token
    setToken(token) {
        localStorage.setItem('auth_token', token);
    },

    // Remove auth token
    removeToken() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    },

    // Get stored user
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Set user data
    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    },

    // Make API request
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const token = this.getToken();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Handle 401 Unauthorized
                if (response.status === 401) {
                    API.removeToken();

                    // Redirect based on current path
                    if (window.location.pathname.includes('admin-')) {
                        window.location.href = 'admin-login.html';
                    } else {
                        window.location.href = 'login.html'; // Or shop.html/home
                    }
                    throw { status: 401, message: 'Session expired. Please login again.' };
                }

                // Handle 403 Forbidden (Admin auth expired or not admin)
                if (response.status === 403 && window.location.pathname.includes('admin-')) {
                    API.removeToken();
                    localStorage.removeItem('adminLoggedIn');
                    window.location.href = 'admin-login.html';
                    throw { status: 403, message: 'Admin session expired. Please login again.' };
                }

                throw {
                    status: response.status,
                    message: data.message || 'Request failed',
                    errors: data.errors || {}
                };
            }

            return data;
        } catch (error) {
            if (error.status) {
                throw error;
            }
            throw { message: 'Network error. Please check your connection.' };
        }
    },

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    },

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    // ==================== AUTH ENDPOINTS ====================

    auth: {
        async login(email, password) {
            const response = await API.post('/login', { email, password });
            if (response.success) {
                API.setToken(response.token);
                API.setUser(response.user);
            }
            return response;
        },

        async adminLogin(email, password) {
            const response = await API.post('/admin/login', { email, password });
            if (response.success) {
                API.setToken(response.token);
                API.setUser(response.user);
            }
            return response;
        },

        async register(name, email, password, password_confirmation) {
            const response = await API.post('/register', { name, email, password, password_confirmation });
            if (response.success) {
                API.setToken(response.token);
                API.setUser(response.user);
            }
            return response;
        },

        async logout() {
            try {
                await API.post('/logout');
            } finally {
                API.removeToken();
            }
        },

        async getUser() {
            return API.get('/user');
        }
    },

    // ==================== PRODUCT ENDPOINTS ====================

    products: {
        async list(params = {}) {
            return API.get('/products', params);
        },

        async get(slug) {
            return API.get(`/products/${slug}`);
        },

        async search(query) {
            return API.get('/products', { search: query });
        }
    },

    // ==================== CATEGORY ENDPOINTS ====================

    categories: {
        async list() {
            return API.get('/categories');
        },

        async get(slug) {
            return API.get(`/categories/${slug}`);
        }
    },

    // ==================== PROFILE ENDPOINTS ====================

    profile: {
        async update(data) {
            return API.put('/profile', data);
        },
        async changePassword(data) {
            return API.put('/profile/password', data);
        }
    },

    // ==================== ADMIN ENDPOINTS ====================

    admin: {
        products: {
            async list(params = {}) {
                return API.get('/admin/products', params);
            },

            async get(id) {
                return API.get(`/admin/products/${id}`);
            },

            async create(data) {
                return API.post('/admin/products', data);
            },

            async update(id, data) {
                return API.put(`/admin/products/${id}`, data);
            },

            async delete(id) {
                return API.delete(`/admin/products/${id}`);
            }
        },

        images: {
            async upload(productId, file, isPrimary = false) {
                const formData = new FormData();
                formData.append('product_id', productId);
                formData.append('image', file);
                formData.append('is_primary', isPrimary ? '1' : '0');

                const token = API.getToken();
                const response = await fetch(`${API.baseUrl}/admin/images/upload`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    },
                    body: formData
                });

                const data = await response.json();
                if (!response.ok) {
                    throw {
                        status: response.status,
                        message: data.message || 'Upload failed',
                        errors: data.errors || {}
                    };
                }
                return data;
            },

            async delete(imageId) {
                return API.delete(`/admin/images/${imageId}`);
            },

            async setPrimary(imageId) {
                return API.post(`/admin/images/${imageId}/primary`);
            }
        },

        orders: {
            async list(params = {}) {
                return API.get('/admin/orders', params);
            },
            async get(id) {
                return API.get(`/admin/orders/${id}`);
            },
            async updateStatus(id, status) {
                return API.put(`/admin/orders/${id}`, { status });
            }
        },

        users: {
            async list(params = {}) {
                return API.get('/admin/users', params);
            },
            async get(id) {
                return API.get(`/admin/users/${id}`);
            },
            async create(userData) {
                return API.post('/admin/users', userData);
            }
        },

        dashboard: {
            async stats() {
                return API.get('/admin/dashboard/stats');
            },
            async salesChart() {
                return API.get('/admin/dashboard/sales-chart');
            },
            async orderStatusChart() {
                return API.get('/admin/dashboard/order-status-chart');
            },
            async topProducts() {
                return API.get('/admin/dashboard/top-products');
            }
        },


        gallery: {
            async list() {
                return API.get('/admin/gallery');
            },
            async upload(formData) {
                const token = API.getToken();
                const response = await fetch(`${API.baseUrl}/admin/gallery`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    },
                    body: formData
                });
                return response.json();
            },
            async delete(id) {
                return API.delete(`/admin/gallery/${id}`);
            },
            async toggle(id) {
                return API.request(`/admin/gallery/${id}/toggle`, { method: 'PATCH' });
            }
        },

        reviews: {
            async list(params = {}) {
                return API.get('/admin/reviews', params);
            },
            async updateStatus(id, status) {
                return API.request(`/admin/reviews/${id}/status`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status })
                });
            },
            async delete(id) {
                return API.delete(`/admin/reviews/${id}`);
            }
        },

        settings: {
            async getHero() {
                return API.get('/admin/settings/hero');
            },
            async updateHero(settings) {
                return API.post('/admin/settings/hero', settings);
            },
            async uploadHeroImage(formData) {
                const token = API.getToken();
                const response = await fetch(`${API.baseUrl}/admin/settings/hero/image`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    },
                    body: formData
                });
                return response.json();
            },
            async deleteHeroImage(path) {
                return API.delete('/admin/settings/hero/image', { path });
            },
            async uploadHeroVideo(formData) {
                const token = API.getToken();
                const response = await fetch(`${API.baseUrl}/admin/settings/hero/video`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    },
                    body: formData
                });
                return response.json();
            },
            async deleteHeroVideo(path) {
                return API.request('/admin/settings/hero/video', {
                    method: 'DELETE',
                    body: JSON.stringify({ path })
                });
            }
        }
    },

    // Public settings (for frontend)
    settings: {
        async getHero() {
            return API.get('/settings/hero');
        }
    },

    // ==================== ORDER ENDPOINTS ====================

    orders: {
        async create(orderData) {
            return API.post('/orders', orderData);
        },

        async get(orderNumber) {
            return API.get(`/orders/${orderNumber}`);
        },

        async list() {
            return API.get('/orders');
        }
    },

    // ==================== GALLERY ENDPOINTS (PUBLIC) ====================

    gallery: {
        async list() {
            return API.get('/gallery');
        }
    },

    // ==================== REVIEWS ENDPOINTS (PUBLIC) ====================

    reviews: {
        async list(productId) {
            return API.get(`/products/${productId}/reviews`);
        },

        async create(data) {
            return API.post('/reviews', data);
        }
    },

    // ==================== WISHLIST ENDPOINTS ====================

    wishlist: {
        async list() {
            return API.get('/wishlist');
        },
        async toggle(productId) {
            return API.post('/wishlist/toggle', { product_id: productId });
        }
    },

    // ==================== CART ENDPOINTS ====================

    cart: {
        async list() {
            return API.get('/cart');
        },
        async sync(items) {
            return API.post('/cart/sync', { items });
        },
        async add(productId, quantity, options) {
            return API.post('/cart/items', { product_id: productId, quantity, options });
        },
        async update(id, quantity) {
            return API.put(`/cart/items/${id}`, { quantity });
        },
        async remove(id) {
            return API.delete(`/cart/items/${id}`);
        },
        async clear() {
            return API.delete('/cart/clear');
        }
    },

    // ==================== ADDRESS ENDPOINTS ====================

    addresses: {
        async list() {
            return API.get('/addresses');
        },
        async create(data) {
            return API.post('/addresses', data);
        },
        async update(id, data) {
            return API.put(`/addresses/${id}`, data);
        },
        async delete(id) {
            return API.delete(`/addresses/${id}`);
        },
        async setDefault(id) {
            return API.patch(`/addresses/${id}/default`);
        }
    },

    // ==================== ORDER ENDPOINTS ====================

    orders: {
        async create(data) {
            return API.post('/orders', data);
        },
        async get(orderNumber) {
            return API.get(`/orders/${orderNumber}`);
        },
        async list() {
            return API.get('/orders');
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}

