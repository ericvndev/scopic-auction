const dummyUsers = [
	{
		username: 'user1',
		firstName: 'regular',
		lastName: 'user',
		autobidBudget: 1000000000,
		alertPercent: 80,
		role: 'user',
		hashedPassword:
			'$argon2id$v=19$m=4096,t=3,p=1$QIBh9J9ib2wxDrWVXlVafg$1ByXHv1T1cuEiyyXZ5DZPjofW2OAkSpnLniEyocu5QI', // user2
	},
	{
		username: 'admin1',
		firstName: 'admin',
		lastName: 'user',
		autobidBudget: 1000000000,
		alertPercent: 80,
		role: 'admin',
		hashedPassword:
			'$argon2id$v=19$m=4096,t=3,p=1$vB7Gb6BOTE1alRrseQ+nPQ$xnB1GhZuEbOce1PgRAUO8Pp/wl85Pq3ymsYYU6pgiz8', // admin2
	},
];

class PrivateUserStore {
	constructor() {
		this.users = dummyUsers;
	}
	getUsers() {
		return [...this.users];
	}
	getUsersByUsername(usernames) {
		return this.users.filter((user) => usernames.includes(user.username));
	}
	getUserByUsername(username) {
		return this.users.find((user) => user.username === username);
	}
	setUser(newUser) {
		const foundIndex = this.users.findIndex(
			(user) => user.username === newUser.username
		);
		if (foundIndex > -1) {
			this.users[foundIndex] = {
				...this.users[foundIndex],
				...newUser,
			};
			const updatedUser = { ...this.users[foundIndex] };
			return updatedUser;
		}
		return null;
	}
}
class UserStore {
	constructor() {
		throw new Error('Use Singleton.getInstance()');
	}
	static getInstance() {
		if (!UserStore.instance) {
			UserStore.instance = new PrivateUserStore();
		}
		return UserStore.instance;
	}
}

exports = module.exports = UserStore;
