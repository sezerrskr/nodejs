module.exports = {
    privGroups: [
        {
            id: "USERS",
            name: "User Permissions"
        },
        {
            id: "ROLES",
            name: "Role Permissions"
        },
        {
            id: "CATEGORIES",
            name: "Category Permissions"
        },
        {
            id: "AUDITLOGS",
            name: "AuditLogs Permissions"
        },
    ],

    privileges: [
        // Users
        {
            key: "user_view",
            name: "User View",
            group: "USERS",
            description: "user view",
        },
        {
            key: "user_add",
            name: "User Add",
            group: "USERS",
            description: "user add",
        },
        {
            key: "user_update",
            name: "User Update",
            group: "USERS",
            description: "user update",
        },
        {
            key: "user_delete",
            name: "User Delete",
            group: "USERS",
            description: "user Delete",
        },
        // Roles
        {
            key: "role_view",
            name: "Role View",
            group: "ROLES",
            description: "role view",
        },
        {
            key: "role_add",
            name: "Role Add",
            group: "ROLES",
            description: "role add",
        },
        {
            key: "role_update",
            name: "Role Update",
            group: "ROLES",
            description: "role update",
        },
        {
            key: "role_delete",
            name: "Role Delete",
            group: "ROLES",
            description: "role delete",
        },
        // Categories
        {
            key: "category_view",
            name: "Category View",
            group: "CATEGORIES",
            description: "category view",
        },
        {
            key: "category_add",
            name: "Category Add",
            group: "CATEGORIES",
            description: "category add",
        },
        {
            key: "category_update",
            name: "Category Update",
            group: "CATEGORIES",
            description: "category update",
        },
        {
            key: "category_delete",
            name: "Category Delete",
            group: "CATEGORIES",
            description: "category delete",
        },
        // AuditLogs
        {
            key: "auiditlogs_view",
            name: "Auiditlogs View",
            group: "CATEGORIES",
            description: "auiditlogs view",
        },

    ]
}