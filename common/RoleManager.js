let roles = [];

const RoleManager = {
    isAdmin: () => roles.includes('admin'),
    isBoss: () => roles.includes('boss'),
    canBoss: () => RoleManager.isAdmin() || RoleManager.isBoss(),
    setRoles: function(rr) {
        roles = rr.filter(r => ['admin', 'boss'].includes(r));
    }
}

export default RoleManager;