import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'customer' | 'seller' | 'owner' | 'guest';

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string, role: UserRole) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('spa_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
        // Mock authentication logic for SPA Enterprise Teams
        const mockUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: role === 'owner' ? 'Owner SPA' : (role === 'seller' ? 'Team SPA' : 'Valued Customer'),
            email: email,
            role: role,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        };

        setUser(mockUser);
        setIsAuthenticated(true);
        localStorage.setItem('spa_user', JSON.stringify(mockUser));
        return true;
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('spa_user');
        window.location.hash = '#home';
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
