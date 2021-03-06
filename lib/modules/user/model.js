'use strict';

module.exports = (seq, type) => {
    const additionalOptions = {
        // underscored: true,
        paranoid: true,
        hooks: {
            beforeUpdate: (instance) => instance.updatedAt = getNow(null),
            beforeDestroy: (instance) => instance.deletedAt = getNow(null)
        }
    };

    const objModel = {
        firstName: {
            field: 'first_name',
            type: type.STRING,
            allowNull: false
        },
        lastName: {
            field: 'last_name',
            type: type.STRING,
            allowNull: true
        },
        birthDate: {
            field: 'birth_date',
            type: type.DATE,
            allowNull: false
        },
        email: {
            type: type.STRING,
            allowNull: false,
            unique: {
                args: true,
                msg: 'Email already exists',
            },
        },
        password: {
            type: type.STRING,
            allowNull: false
        },
        salt: {
            type: type.STRING,
            allowNull: false
        },
        // Timestamps
        createdAt: {
            field: 'created_at',
            type: type.DATE,
            defaultValue: type.NOW
        },
        updatedAt: {
            field: 'updated_at',
            type: type.DATE
        },
        deletedAt: {
            field: 'deleted_at',
            type: type.DATE
        }
    };

    return seq.define('users', objModel, additionalOptions);
};