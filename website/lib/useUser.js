import React, { useContext, createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';

import { GET_FROM_API, POST_TO_API } from '../helpers/utils';

const UserContext = createContext();

export const useUser = () => {
	return useContext(UserContext);
};

const useProviderUser = () => {
	const [user, setUser] = useState({});
	const router = useRouter();

	useEffect(() => {
		if (localStorage) {
			const token = localStorage.getItem('token');
			if (token) {
				(async () => {
					try {
						const user = await GET_FROM_API('/user/me');
						setUser({
							...user,
							token: token,
							isLoggedIn: true,
						});
					} catch (error) {
						setUser(null);
						router.push('/login');
					}
				})();
			} else {
				setUser(null);
				router.push('/login');
			}
		}
	}, []);

	const login = async (username, password) => {
		try {
			const accessToken = await POST_TO_API('/user/login', {
				username,
				password,
			});
			localStorage.setItem('token', accessToken);
			router.reload();
		} catch (error) {
			console.log(error);
			alert(error.message);
		}
	};

	const logout = async () => {
		if (!user) {
			return;
		}
		try {
			POST_TO_API('/user/logout');
			localStorage.removeItem('token');
			router.reload();
		} catch (error) {
			alert(error.message);
		}
	};

	const updateUser = async (newUser) => {
		if (!user) {
			return;
		}
		try {
			const data = await POST_TO_API('/user/me', newUser, 'PATCH');
			setUser({ ...user, ...data });
			return data;
		} catch (error) {
			alert(error.message);
		}
	};

	return {
		user,
		login,
		logout,
		updateUser,
	};
};

export function UserProvider({ children }) {
	const auth = useProviderUser();
	return <UserContext.Provider value={auth}>{children}</UserContext.Provider>;
}

UserProvider.propTypes = {
	children: PropTypes.node,
};
