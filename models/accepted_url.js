const sequelize = require('../database');
const { DataTypes } = require('sequelize');

const AcceptedUrl = sequelize.define('AcceptedUrl', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    url: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
}, {
    tableName: 'accepted_url',
    timestamps: false,
});

module.exports = AcceptedUrl;