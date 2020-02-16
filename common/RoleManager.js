const RoleManager = {
    roles: [],
    isAdmin: () => RoleManager.roles.includes('admin'),
    isBoss: () => RoleManager.roles.includes('boss'),
    canBoss: () => RoleManager.isAdmin() || RoleManager.isBoss(),
    setRoles: function(rr) {
        RoleManager.roles = rr.filter(r => ['admin', 'boss'].includes(r));
    }
}

export default RoleManager;