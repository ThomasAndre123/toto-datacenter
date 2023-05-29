const { Sequelize, Transaction } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_URL, {
	isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
	logging: process.env.NODE_ENV === 'production' ? false : console.log,	
});

module.exports = sequelize;