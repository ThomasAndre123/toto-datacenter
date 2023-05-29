const sequelize = require('../database');
const { DataTypes } = require('sequelize');

const ResultData = sequelize.define('ResultData', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    urlId: { type: DataTypes.INTEGER, allowNull: false },
    closeTime: { type: DataTypes.BIGINT, allowNull: false },
    resultTime: { type: DataTypes.BIGINT, allowNull: false },
    result: { type: DataTypes.STRING, allowNull: false },
    source: { type: DataTypes.STRING, allowNull: false },
}, {
    tableName: 'result_data',
    timestamps: false,
});

// relationship
const AcceptedUrl = require('./accepted_url');
ResultData.belongsTo(AcceptedUrl, { foreignKey: 'urlId' });

module.exports = ResultData;