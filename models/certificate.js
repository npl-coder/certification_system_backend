const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Certificate = sequelize.define(
  "Certificate",
  {
    cert_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    recipientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipientEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    certificateNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    issueDate: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    templatePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    certificatePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    verificationUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    additionalFields: {
      type: DataTypes.JSON,
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "events",
        key: "event_id",
      },
    },
    issuedTo: {
      type: DataTypes.UUID,
      references: {
        model: "users",
        key: "user_id",
      },
    }
  },
  {
    tableName: "certificates",
    timestamps: true,
  }
);

module.exports = Certificate;
