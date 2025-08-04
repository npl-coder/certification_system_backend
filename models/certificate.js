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
    id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.cert_id;
      },
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
      defaultValue: DataTypes.NOW ,
    },
    templatePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    certificatePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    certificateUrl: {
      type: DataTypes.STRING,
      allowNull: true,
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
      type: DataTypes.INTEGER,
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
